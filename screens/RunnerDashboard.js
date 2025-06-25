// RunnerDashboard.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Button,
  TextInput,
  StyleSheet,
  Alert,
  ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Geolocation from '@react-native-community/geolocation';
import { Picker } from '@react-native-picker/picker';
import { BASE_URL } from '../config';

export default function RunnerDashboard({ navigation }) {
  const [user, setUser] = useState(null);
  const [trip, setTrip] = useState(null);
  const [managers, setManagers] = useState([]);
  const [selectedManagerId, setSelectedManagerId] = useState('');
  const [distance, setDistance] = useState('');
  const [parking, setParking] = useState('');
  const [summary, setSummary] = useState({});
  const [tpfa, setTpfa] = useState([]);

  useEffect(() => {
    const load = async () => {
      const stored = await AsyncStorage.getItem('user');
      if (!stored) return;
      const u = JSON.parse(stored);
      setUser(u);
      fetchTripStatus(u._id);
      fetchSummary(u._id);
      fetchTPFA(u._id);
      fetchManagers();
    };
    load();
  }, []);

  const fetchManagers = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/managers`);
      setManagers(res.data);
    } catch (err) {
      console.error('Manager fetch failed:', err);
    }
  };

  const fetchTripStatus = async (runnerId) => {
    try {
      const res = await axios.get(`${BASE_URL}/api/trip/status/${runnerId}`);
      setTrip(res.data || null);
    } catch (err) {
      console.error('Trip status fetch failed:', err);
    }
  };

  const fetchSummary = async (runnerId) => {
    try {
      const res = await axios.get(`${BASE_URL}/api/trip/summary/${runnerId}`);
      setSummary(res.data);
    } catch (err) {
      console.error('Summary fetch failed:', err);
    }
  };

  const fetchTPFA = async (runnerId) => {
    try {
      const res = await axios.get(`${BASE_URL}/api/trip/pending-count/${runnerId}`);
      setTpfa(res.data);
    } catch (err) {
      console.error('Failed to fetch TPFA data:', err);
    }
  };

  const startTrip = async () => {
    if (!selectedManagerId) return Alert.alert('Please select a manager');

    Geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await axios.post(`${BASE_URL}/api/trip/start`, {
            runnerId: user._id,
            managerId: selectedManagerId,
            startLat: latitude,
            startLng: longitude,
          });
          setTrip(res.data);
        } catch (err) {
          console.error('Trip start failed:', err);
          Alert.alert('Failed to start trip');
        }
      },
      (error) => {
        console.error('Geolocation error (start):', error);
        Alert.alert('Unable to fetch location to start trip');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const stopTrip = async () => {
    if (!trip?._id) return;
    Geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await axios.post(`${BASE_URL}/api/trip/stop/${trip._id}`, {
            distance: parseFloat(distance),
            endLat: latitude,
            endLng: longitude,
          });
          setTrip(res.data);
          fetchSummary(user._id);
        } catch (err) {
          console.error('Trip stop failed:', err);
          Alert.alert('Failed to stop trip');
        }
      },
      (error) => {
        console.error('Geolocation error (stop):', error);
        Alert.alert('Unable to fetch location to stop trip');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const updateParking = async () => {
    if (!trip?._id) return;
    try {
      const res = await axios.post(`${BASE_URL}/api/trip/update-parking/${trip._id}`, {
        parking: parseFloat(parking),
      });
      setTrip(res.data);
      fetchSummary(user._id);
      Alert.alert('Parking Updated');
    } catch (err) {
      console.error('Parking update failed:', err);
      Alert.alert('Failed to update parking');
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('user');
    navigation.navigate('Login');
  };

  const goToSummary = () => {
    navigation.navigate('WeeklySummaryScreen', { user });
  };

  const resetState = () => {
    setTrip(null);
    setDistance('');
    setParking('');
    fetchTPFA(user._id);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Runner Dashboard</Text>
      {user && <Text style={styles.subheader}>Welcome, {user.name}</Text>}

      <View style={styles.tpfaBox}>
        <Text style={styles.tpfaText}>TPFA (Pending Trips For Approval)</Text>
        {tpfa.map((item, index) => (
          <Text key={index} style={styles.tpfaText}>
            {item.managerName}: {item.count}
          </Text>
        ))}
      </View>

      {!trip ? (
        <>
          <Text style={styles.label}>Select Manager:</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedManagerId}
              onValueChange={(val) => setSelectedManagerId(val)}
              style={styles.picker}
            >
              <Picker.Item label="-- Select Manager --" value="" />
              {managers.map((m) => (
                <Picker.Item key={m._id} label={m.name} value={m._id} />
              ))}
            </Picker>
          </View>
          <Button title="Start Trip" onPress={startTrip} color="#003366" />
          <View style={styles.buttonSpacing}>
            <View style={styles.buttonRowTop}>
              <View style={styles.flexButton}>
                <Button title="View Report" onPress={goToSummary} color="#ffcc00" />
                <Button
                  title="Today Summary"
                  onPress={() => navigation.navigate('TodaySummaryScreen')}
                  color="#28a745"
                />
              </View>
            </View>
          </View>
        </>
      ) : (
        <View style={styles.card}>
          <Text style={styles.status}>Trip Status: {trip.endTime ? 'Completed' : 'Started'}</Text>
          <Text>Manager: {trip.managerName || 'N/A'}</Text>
          <Text>Trip ID: {trip._id}</Text>
          <Text>Start Time: {new Date(trip.startTime).toLocaleString()}</Text>
          {trip.endTime && <Text>End Time: {new Date(trip.endTime).toLocaleString()}</Text>}
          <Text>Start Location: {trip.startLat?.toFixed(4) || '-'}, {trip.startLng?.toFixed(4) || '-'}</Text>
          <Text>End Location: {trip.endLat?.toFixed(4) || '-'}, {trip.endLng?.toFixed(4) || '-'}</Text>
          <Text>Distance: {trip.distance || distance} km</Text>
          <Text>Parking Charges: ₹{trip.parking || 0}</Text>
          <Text>Total Payment: ₹{trip.payment || 0}</Text>

          {!trip.endTime && (
            <>
              <TextInput
                style={styles.input}
                placeholder="Enter KM Travelled"
                keyboardType="numeric"
                value={distance}
                onChangeText={setDistance}
              />
              <Button title="Stop Trip" onPress={stopTrip} color="#ff6600" />
            </>
          )}

          {trip.endTime && (
            <>
              <TextInput
                style={styles.input}
                placeholder="Enter Parking Charges"
                keyboardType="numeric"
                value={parking}
                onChangeText={setParking}
              />
              <Button title="Update Parking Charges" onPress={updateParking} color="#007bff" />
              <Button title="Start New Trip" onPress={resetState} color="#28a745" />
              <Button title="View Report" onPress={goToSummary} color="#ffcc00" />
              <Button
                title="Today Summary"
                onPress={() => navigation.navigate('TodaySummaryScreen')}
                color="#28a745"
              />
            </>
          )}
        </View>
      )}

      <View style={styles.summary}>
        <Text style={styles.label}>Weekly Summary:</Text>
        <Text>Total Trips: {summary.totalTrips || 0}</Text>
        <Text>Total Distance: {summary.totalDistance?.toFixed(2) || 0} km</Text>
        <Text>Total Parking: ₹{summary.totalParking || 0}</Text>
        <Text>Total Payment: ₹{summary.totalPayment?.toFixed(2) || 0}</Text>
      </View>

      <Button title="Log Out" onPress={logout} color="#dc3545" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#f4f4f4', flexGrow: 1 },
  header: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', color: '#003366' },
  subheader: { fontSize: 16, textAlign: 'center', marginBottom: 10 },
  label: { marginTop: 10, marginBottom: 5, fontWeight: 'bold' },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    backgroundColor: 'white',
    marginBottom: 10,
  },
  picker: { height: 44, width: '100%' },
  card: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginVertical: 20,
    shadowColor: '#000',
    elevation: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 5,
    padding: 10,
    marginTop: 10,
    marginBottom: 10,
  },
  tpfaBox: {
    backgroundColor: 'orange',
    padding: 8,
    borderRadius: 6,
    alignSelf: 'flex-end',
    marginBottom: 10,
  },
  tpfaText: { color: 'white', fontWeight: 'bold' },
  status: { fontWeight: 'bold', color: '#003366', marginBottom: 5 },
  summary: { marginTop: 20 },
  buttonRowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 10,
  },
  flexButton: {
    flex: 1,
    marginRight: 5,
  },
  buttonSpacing: {
    marginTop: 12,
  },
});
