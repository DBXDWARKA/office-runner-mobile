// === TripApprovalScreen.js ===
import { BASE_URL } from '../config';
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, Button, StyleSheet, Alert } from 'react-native';
import axios from 'axios';

export default function TripApprovalScreen({ route }) {
  const { managerId } = route.params;
  const [pendingTrips, setPendingTrips] = useState([]);

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const res = await axios.get(`http://127.0.0.1:3010/api/trips/pending/${managerId}`);
      setPendingTrips(res.data);
    } catch (err) {
      console.error('Failed to fetch pending trips:', err);
    }
  };

  const updateDistanceAndApprove = async (tripId, newDistance) => {
    try {
      await axios.post(`http://127.0.0.1:3010/api/trips/approve/${tripId}`, { newDistance });
      Alert.alert('Trip approved!');
      fetchTrips(); // refresh
    } catch (err) {
      console.error('Approval failed:', err);
      Alert.alert('Error approving trip.');
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.label}>Runner ID: {item.userId}</Text>
      <Text>Distance: {item.distance} km</Text>
      <Text>Payment: ₹{item.payment}</Text>
      <TextInput
        placeholder="Adjust Distance"
        keyboardType="numeric"
        style={styles.input}
        onChangeText={(val) => (item.newDistance = val)}
      />
      <Button
        title="Approve Trip"
        onPress={() => updateDistanceAndApprove(item._id, item.newDistance || item.distance)}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      {pendingTrips.length === 0 ? (
        <Text style={styles.empty}>No pending trips.</Text>
      ) : (
        <FlatList
          data={pendingTrips}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f4f6f8' },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 8,
    marginVertical: 10,
  },
  empty: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 30,
    color: 'gray',
  },
});
