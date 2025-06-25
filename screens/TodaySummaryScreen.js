// TodaySummaryScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL } from '../config';

export default function TodaySummaryScreen() {
  const [user, setUser] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserAndFetch = async () => {
      const stored = await AsyncStorage.getItem('user');
      if (!stored) return;
      const u = JSON.parse(stored);
      setUser(u);
      fetchTodaySummary(u._id);
    };
    loadUserAndFetch();
  }, []);

  const fetchTodaySummary = async (runnerId) => {
    try {
      const res = await axios.get(`${BASE_URL}/api/trip/summary-today/${runnerId}`);
      setSummary(res.data);
    } catch (err) {
      console.error('Failed to fetch today summary:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={{ marginTop: 10 }}>Loading Today’s Summary...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Today's Summary</Text>

      {summary ? (
        <View style={styles.box}>
          <Text style={styles.item}>Total Trips: {summary.totalTrips}</Text>
          <Text style={styles.item}>Total Distance: {summary.totalDistance?.toFixed(2)} km</Text>
          <Text style={styles.item}>Total Parking: ₹{summary.totalParking || 0}</Text>
          <Text style={styles.item}>Total Payment: ₹{summary.totalPayment?.toFixed(2)}</Text>
        </View>
      ) : (
        <Text style={styles.noData}>No data found for today.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f4f4f4',
    flexGrow: 1,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#003366',
    marginBottom: 15,
    textAlign: 'center',
  },
  box: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
  },
  item: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  noData: {
    fontSize: 16,
    textAlign: 'center',
    color: '#888',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
});
