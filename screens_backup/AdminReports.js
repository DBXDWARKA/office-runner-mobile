import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import axios from 'axios';
import { BASE_URL } from '../config';

export default function AdminReports({ route }) {
  const { user } = route.params;
  const [stats, setStats] = useState({
    totalRunners: 0,
    totalManagers: 0,
    totalTrips: 0,
    approvedTrips: 0,
    declinedTrips: 0,
    pendingTrips: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/admin/stats`);
      setStats(res.data);
    } catch (err) {
      console.error('Admin stats fetch error:', err);
      Alert.alert('Error', 'Failed to load admin stats');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>📊 Admin Reports</Text>

      <View style={styles.card}>
        <Text style={styles.label}>👟 Total Runners</Text>
        <Text style={styles.value}>{stats.totalRunners}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>👔 Total Managers</Text>
        <Text style={styles.value}>{stats.totalManagers}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>🧾 Total Trips</Text>
        <Text style={styles.value}>{stats.totalTrips}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>✅ Approved Trips</Text>
        <Text style={styles.value}>{stats.approvedTrips}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>❌ Declined Trips</Text>
        <Text style={styles.value}>{stats.declinedTrips}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>🕒 Pending Trips</Text>
        <Text style={styles.value}>{stats.pendingTrips}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f4f7fa',
    flexGrow: 1
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#003366',
    textAlign: 'center',
    marginBottom: 20
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 3
  },
  label: {
    fontSize: 16,
    color: '#003366',
    fontWeight: 'bold'
  },
  value: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ff6600',
    marginTop: 5
  }
});
