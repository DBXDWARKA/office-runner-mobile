// RunnerReport.js
import { BASE_URL } from '../config';
import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Button, FlatList, ActivityIndicator, Alert
} from 'react-native';
import axios from 'axios';
import { captureRef } from 'react-native-view-shot';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Picker } from '@react-native-picker/picker';

export default function RunnerReport({ route }) {
  const { user } = route.params;
  const [trips, setTrips] = useState([]);
  const [filter, setFilter] = useState('month');
  const [loading, setLoading] = useState(true);
  const reportRef = useRef();

  useEffect(() => {
    fetchTrips();
  }, [filter]);

  const fetchTrips = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/trip/summary-list/${user._id}`);
      let data = res.data;
      const now = new Date();

      if (filter === 'today') {
        data = data.filter(t => new Date(t.startTime).toDateString() === now.toDateString());
      } else if (filter === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        data = data.filter(t => new Date(t.startTime) >= weekAgo);
      } else if (filter === 'month') {
        data = data.filter(t => {
          const d = new Date(t.startTime);
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        });
      }

      setTrips(data);
    } catch (err) {
      console.error('Fetch error:', err);
      Alert.alert('Failed to fetch report');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = () => {
  const approvedTrips = trips.filter(t => t.status !== 'declined');
  const totalKM = approvedTrips.reduce((sum, t) => sum + (t.distance || 0), 0);
  const totalParking = approvedTrips.reduce((sum, t) => sum + (t.parkingAmount || 0), 0);
  const totalPayment = approvedTrips.reduce((sum, t) => sum + (t.payment || 0), 0);
  return { totalKM, totalParking, totalPayment };
};


  const handlePDFExport = async () => {
    try {
      const uri = await captureRef(reportRef, {
        format: 'png',
        quality: 1
      });
      await Print.printAsync({ uri });
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Print failed');
    }
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 30 }} />;

  const { totalKM, totalParking, totalPayment } = calculateTotals();

  return (
    <ScrollView style={styles.container}>
      <View ref={reportRef} collapsable={false}>
        <Text style={styles.title}>Runner Report – {user.name}</Text>

        <Picker selectedValue={filter} style={styles.picker} onValueChange={val => setFilter(val)}>
          <Picker.Item label="Today" value="today" />
          <Picker.Item label="This Week" value="week" />
          <Picker.Item label="This Month" value="month" />
        </Picker>

        <View style={styles.headerRow}>
          {['Trip ID', 'Date & Time', 'KM', 'Parking', 'Payment', 'From', 'To', 'Status'].map((h, i) => (
            <Text key={i} style={styles.headerCell}>{h}</Text>
          ))}
        </View>

        <FlatList
          data={trips}
          keyExtractor={item => item._id}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Text style={styles.cell}>{item._id.slice(-5)}</Text>
              <Text style={styles.cell}>{new Date(item.startTime).toLocaleString()}</Text>
              <Text style={styles.cell}>{item.adjustedDistance || item.distance || 0}</Text>
              <Text style={styles.cell}>₹{item.parkingAmount || 0}</Text>
              <Text style={styles.cell}>₹{item.payment || 0}</Text>
              <Text style={styles.cell}>{item.startLoc ? `${item.startLoc.lat.toFixed(2)}, ${item.startLoc.lng.toFixed(2)}` : '-'}</Text>
              <Text style={styles.cell}>{item.endLoc ? `${item.endLoc.lat.toFixed(2)}, ${item.endLoc.lng.toFixed(2)}` : '-'}</Text>
              <Text style={styles.cell}>{item.status}</Text>
            </View>
          )}
        />

        <View style={styles.totalBlock}>
          <Text style={styles.totalText}>Total KM: {totalKM}</Text>
          <Text style={styles.totalText}>Total Parking: ₹{totalParking}</Text>
          <Text style={styles.totalText}>Total Payment: ₹{totalPayment}</Text>
        </View>
      </View>

      <Button title="Download PDF Report" onPress={handlePDFExport} color="#ff6600" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 10, backgroundColor: '#f0f4f8' },
  title: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 10, color: '#003366' },
  picker: { backgroundColor: '#fff', marginBottom: 10 },
  headerRow: { flexDirection: 'row', backgroundColor: '#003366', padding: 6, borderRadius: 4 },
  headerCell: { flex: 1, color: '#fff', fontWeight: 'bold', fontSize: 12, textAlign: 'center' },
  row: { flexDirection: 'row', backgroundColor: '#fff', paddingVertical: 8, marginBottom: 4, borderRadius: 6, borderWidth: 1, borderColor: '#ccc' },
  cell: { flex: 1, textAlign: 'center', fontSize: 12 },
  totalBlock: { marginVertical: 10, padding: 10, backgroundColor: '#e6f2ff', borderRadius: 6 },
  totalText: { fontWeight: 'bold', textAlign: 'center', color: '#003366', marginVertical: 2 },
});
