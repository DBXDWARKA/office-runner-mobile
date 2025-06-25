import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import axios from 'axios';
import { BASE_URL } from '../config';

export default function BillingExport() {
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    axios.get(`${BASE_URL}/api/admin/billing-export`)
      .then(res => setTrips(res.data))
      .catch(err => console.error('Billing fetch error:', err));
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>📁 Billing Export</Text>
      {trips.map((trip, index) => (
        <View key={index} style={styles.tripBox}>
          <Text style={styles.row}><Text style={styles.label}>Runner:</Text> {trip.runner?.name} ({trip.runner?.phone})</Text>
          <Text style={styles.row}><Text style={styles.label}>Manager:</Text> {trip.manager?.name}</Text>
          <Text style={styles.row}><Text style={styles.label}>Distance:</Text> {trip.distance?.toFixed(2)} km</Text>
          <Text style={styles.row}><Text style={styles.label}>Parking:</Text> ₹{trip.parkingCharges || 0}</Text>
          <Text style={styles.row}><Text style={styles.label}>Payment:</Text> ₹{trip.payment?.toFixed(2)}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#eef2f5',
    flex: 1
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#003366',
    marginBottom: 20
  },
  tripBox: {
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    borderLeftWidth: 6,
    borderLeftColor: '#007bff',
    elevation: 2
  },
  row: {
    marginBottom: 4,
    fontSize: 14
  },
  label: {
    fontWeight: 'bold',
    color: '#333'
  }
});
