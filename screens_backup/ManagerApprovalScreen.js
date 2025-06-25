// === File: screens/ManagerApprovalScreen.js ===
import { BASE_URL } from '../config';
import React, { useState } from 'react';
import { View, Text, TextInput, Button, ScrollView, Alert, StyleSheet } from 'react-native';
import axios from 'axios';

export default function ManagerApprovalScreen() {
  const [managerId, setManagerId] = useState('');
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPendingTrips = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://127.0.0.1:3010/api/trips/pending?managerId=${managerId}`);
      setTrips(res.data);
    } catch (error) {
      console.error('Failed to fetch trips', error);
      Alert.alert('Error', 'Could not fetch trips.');
    } finally {
      setLoading(false);
    }
  };

  const approveTrip = async (tripId) => {
    try {
      await axios.post('http://127.0.0.1:3010/api/trip/approve', { tripId, managerId });
      Alert.alert('✅ Success', 'Trip approved.');
      setTrips(trips.filter((t) => t._id !== tripId)); // Remove approved from list
    } catch (error) {
      console.error('Approval error', error);
      Alert.alert('Error', 'Failed to approve trip.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Manager Trip Approval</Text>
      <TextInput
        placeholder="Enter Manager ID"
        value={managerId}
        onChangeText={setManagerId}
        style={styles.input}
      />
      <Button title="Fetch Trips" onPress={fetchPendingTrips} disabled={!managerId || loading} />

      {trips.map((trip) => (
        <View key={trip._id} style={styles.card}>
          <Text>Trip ID: {trip._id}</Text>
          <Text>Runner: {trip.userId}</Text>
          <Text>Start: {new Date(trip.startTime).toLocaleString()}</Text>
          <Text>End: {new Date(trip.endTime).toLocaleString()}</Text>
          <Text>Distance: {trip.distanceKm} km</Text>
          <Text>Payment: ₹{trip.payment}</Text>
          <Button title="Approve" onPress={() => approveTrip(trip._id)} />
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 100,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#888',
    padding: 8,
    borderRadius: 5,
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#eee',
    padding: 10,
    borderRadius: 6,
    marginVertical: 8,
  },
});
