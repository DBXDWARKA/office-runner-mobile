// ManagerDashboard.js
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Button, StyleSheet, Alert, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';
import { BASE_URL } from '../config';

export default function ManagerDashboard() {
  const [user, setUser] = useState(null);
  const [trips, setTrips] = useState([]);
  const [managers, setManagers] = useState([]);
  const [updatedDistance, setUpdatedDistance] = useState({});
  const [filters, setFilters] = useState({
    managerId: '',
    status: 'all',
    period: 'weekly',
  });

  useEffect(() => {
    const init = async () => {
      const stored = await AsyncStorage.getItem('user');
      if (!stored) return;
      const u = JSON.parse(stored);
      setUser(u);
      fetchManagers();
      fetchTrips(u._id);
    };
    init();
  }, []);

  const fetchManagers = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/managers`);
      setManagers(res.data);
    } catch (err) {
      console.error('Manager list failed:', err);
    }
  };

  const fetchTrips = async () => {
    try {
      const today = new Date();
      let from = new Date();
      if (filters.period === 'daily') from.setDate(today.getDate() - 1);
      if (filters.period === 'weekly') from.setDate(today.getDate() - 7);
      if (filters.period === 'monthly') from.setMonth(today.getMonth() - 1);

      const params = {
        managerId: filters.managerId,
        status: filters.status,
        from: from.toISOString(),
        to: today.toISOString(),
      };

      const res = await axios.get(`${BASE_URL}/api/trip/filter`, { params });
      setTrips(res.data);
    } catch (err) {
      console.error('Trip fetch failed:', err);
    }
  };

  const handleAction = async (tripId, status) => {
    try {
      await axios.post(`${BASE_URL}/api/trip/approve`, { tripId, status });
      Alert.alert('Trip status updated');
      fetchTrips();
    } catch (err) {
      console.error('Approval failed:', err);
      Alert.alert('Error updating status');
    }
  };

  const handleUpdateKM = async (tripId) => {
    const newDistance = parseFloat(updatedDistance[tripId]);
    if (isNaN(newDistance)) return Alert.alert('Invalid KM value');

    try {
      await axios.post(`${BASE_URL}/api/trip/update-distance/${tripId}`, {
        distance: newDistance,
      });
      Alert.alert('Distance Updated');
      fetchTrips();
    } catch (err) {
      console.error('Update KM failed:', err);
      Alert.alert('Failed to update distance');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Manager Dashboard</Text>

      {/* FILTERS */}
      <View style={styles.filters}>
        <Text style={styles.label}>Status:</Text>
        <Picker
          selectedValue={filters.status}
          onValueChange={(v) => setFilters({ ...filters, status: v })}
          style={styles.picker}
        >
          <Picker.Item label="All" value="all" />
          <Picker.Item label="Pending" value="pending" />
          <Picker.Item label="Approved" value="approved" />
          <Picker.Item label="Declined" value="declined" />
        </Picker>

        <Text style={styles.label}>Manager:</Text>
        <Picker
          selectedValue={filters.managerId}
          onValueChange={(v) => setFilters({ ...filters, managerId: v })}
          style={styles.picker}
        >
          <Picker.Item label="All Managers" value="" />
          {managers.map((m) => (
            <Picker.Item key={m._id} label={m.name} value={m._id} />
          ))}
        </Picker>

        <Text style={styles.label}>Time Range:</Text>
        <Picker
          selectedValue={filters.period}
          onValueChange={(v) => setFilters({ ...filters, period: v })}
          style={styles.picker}
        >
          <Picker.Item label="Daily" value="daily" />
          <Picker.Item label="Weekly" value="weekly" />
          <Picker.Item label="Monthly" value="monthly" />
        </Picker>

        <Button title="Apply Filters" onPress={fetchTrips} color="#ff6600" />
      </View>

      {/* TRIP TABLE */}
      {trips.length === 0 ? (
        <Text style={styles.noTrips}>No trips found.</Text>
      ) : (
        <>
          <View style={styles.headerRow}>
            <Text style={styles.cellHeader}>Trip ID</Text>
            <Text style={styles.cellHeader}>Runner</Text>
            <Text style={styles.cellHeader}>Start</Text>
            <Text style={styles.cellHeader}>End</Text>
            <Text style={styles.cellHeader}>From</Text>
            <Text style={styles.cellHeader}>To</Text>
            <Text style={styles.cellHeader}>KM</Text>
            <Text style={styles.cellHeader}>Parking</Text>
            <Text style={styles.cellHeader}>Payment</Text>
            <Text style={styles.cellHeader}>Manager</Text>
            <Text style={styles.cellHeader}>Status</Text>
            <Text style={styles.cellHeader}>Action</Text>
          </View>

          {trips.map((trip) => (
            <View key={trip._id} style={styles.row}>
              <Text style={styles.cell}>{trip._id.slice(-6)}</Text>
              <Text style={styles.cell}>{trip.userId?.name || 'N/A'}</Text>
              <Text style={styles.cell}>{trip.startTime ? new Date(trip.startTime).toLocaleString() : '-'}</Text>
              <Text style={styles.cell}>{trip.endTime ? new Date(trip.endTime).toLocaleString() : '-'}</Text>
              <Text style={styles.cell}>
                {trip.startLat?.toFixed(4) || '-'}, {trip.startLng?.toFixed(4) || '-'}
              </Text>
              <Text style={styles.cell}>
                {trip.endLat?.toFixed(4) || '-'}, {trip.endLng?.toFixed(4) || '-'}
              </Text>
              <Text style={styles.cell}>{trip.distance}</Text>
              <Text style={styles.cell}>₹{trip.parking || 0}</Text>
              <Text style={styles.cell}>₹{trip.payment || 0}</Text>
              <Text style={styles.cell}>{trip.managerName || '-'}</Text>
              <Text style={styles.cell}>{trip.status}</Text>
              <View style={styles.cell}>
                {trip.status === 'pending' ? (
                  <>
                    <TextInput
                      style={styles.kmInput}
                      value={updatedDistance[trip._id]?.toString() ?? trip.distance?.toString() ?? ''}
                      keyboardType="numeric"
                      onChangeText={(text) =>
                        setUpdatedDistance((prev) => ({ ...prev, [trip._id]: text }))
                      }
                    />
                    <Button title="Update KM" onPress={() => handleUpdateKM(trip._id)} color="#007bff" />
                    <Button title="✓" onPress={() => handleAction(trip._id, 'approved')} color="green" />
                    <Button title="✗" onPress={() => handleAction(trip._id, 'declined')} color="red" />
                  </>
                ) : (
                  <Text style={{ fontWeight: 'bold', color: trip.status === 'approved' ? 'green' : 'red' }}>
                    {trip.status}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 10, backgroundColor: '#f0f8ff' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#003366', textAlign: 'center', marginBottom: 15 },
  filters: { marginBottom: 15, backgroundColor: '#fff', padding: 10, borderRadius: 8 },
  label: { fontWeight: 'bold', color: '#003366', marginTop: 10 },
  picker: { borderWidth: 1, borderColor: '#ccc', backgroundColor: 'white', marginBottom: 10 },
  headerRow: { flexDirection: 'row', flexWrap: 'wrap', backgroundColor: '#003366', padding: 5 },
  row: { flexDirection: 'row', flexWrap: 'wrap', backgroundColor: '#fff', padding: 5, marginBottom: 4 },
  cellHeader: { flex: 1, fontWeight: 'bold', color: '#fff', fontSize: 11 },
  cell: { flex: 1, fontSize: 11 },
  noTrips: { textAlign: 'center', color: '#888', marginTop: 20 },
  kmInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    width: 80,
    marginBottom: 4,
  },
});
