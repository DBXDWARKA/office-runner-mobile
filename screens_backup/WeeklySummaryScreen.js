import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  Button,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { BASE_URL } from '../config';

export default function WeeklySummaryScreen() {
  const [user, setUser] = useState(null);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [managers, setManagers] = useState([]);
  const [filter, setFilter] = useState({
    managerId: '',
    status: '',
    range: 'weekly',
  });

  useEffect(() => {
    const init = async () => {
      const stored = await AsyncStorage.getItem('user');
      if (!stored) return;
      const u = JSON.parse(stored);
      setUser(u);
      fetchManagers();
      fetchTrips(u._id, filter);
    };
    init();
  }, []);

  const fetchManagers = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/managers`);
      setManagers(res.data);
    } catch (err) {
      console.error('Manager fetch failed', err);
    }
  };

  const fetchTrips = async (runnerId, currentFilter) => {
    try {
      setLoading(true);
      const res = await axios.post(`${BASE_URL}/api/trip/filter-runner/${runnerId}`, currentFilter);
      const sorted = res.data.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
      setTrips(sorted);
    } catch (err) {
      console.error('Trip fetch failed', err);
      Alert.alert('Failed to fetch report');
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = () => {
    if (user) {
      fetchTrips(user._id, filter);
    }
  };

  const handleExportPDF = () => {
    const dateStr = new Date().toLocaleString();
    const totalDistance = trips.reduce((sum, t) => sum + (t.distance || 0), 0);
    const totalParking = trips.reduce((sum, t) => sum + (t.parking || 0), 0);
    const totalPayment = trips.reduce((sum, t) => sum + (t.payment || 0), 0);

    const tableRows = trips.map((trip) => `
      <tr>
        <td>${trip._id.slice(-5)}</td>
        <td>${trip.managerName || '-'}</td>
        <td>${new Date(trip.startTime).toLocaleString()}</td>
        <td>${trip.endTime ? new Date(trip.endTime).toLocaleString() : '-'}</td>
        <td>${trip.startLat && trip.startLng ? `${trip.startLat.toFixed(4)}, ${trip.startLng.toFixed(4)}` : '-'}</td>
        <td>${trip.endLat && trip.endLng ? `${trip.endLat.toFixed(4)}, ${trip.endLng.toFixed(4)}` : '-'}</td>
        <td>${(trip.finalKm ?? trip.distance)?.toFixed(2)} km</td>
        <td>${trip.finalKm != null && trip.finalKm !== trip.distance ? 'Yes' : 'OK'}</td>
        <td>₹${trip.parking?.toFixed(2) || '0.00'}</td>
        <td>₹${trip.payment?.toFixed(2) || '0.00'}</td>
        <td>${trip.status}</td>
      </tr>
    `).join('');

    const htmlContent = `
      <html><head><title>Weekly Summary</title></head><body style="font-family: Arial;">
        <h2 style="text-align:center;">Weekly Summary Report</h2>
        <h4 style="text-align:center;">Runner: ${user.name} | Date: ${dateStr}</h4>
        <table border="1" cellspacing="0" cellpadding="4" style="width:100%; font-size:12px;">
          <thead style="background-color:#003366; color:white;">
            <tr>
              <th>Trip ID</th><th>Manager</th><th>Start</th><th>End</th><th>From</th><th>To</th><th>Distance</th><th>Modified KM</th><th>Parking</th><th>Payment</th><th>Status</th>
            </tr>
          </thead>
          <tbody>${tableRows}</tbody>
        </table>
        <br />
        <p style="font-weight:bold;">Total Trips: ${trips.length} &nbsp;&nbsp;&nbsp; Total Distance: ${totalDistance.toFixed(2)} km &nbsp;&nbsp;&nbsp; Total Parking: ₹${totalParking.toFixed(2)} &nbsp;&nbsp;&nbsp; Total Payment: ₹${totalPayment.toFixed(2)}</p>
        <br/><br/>
        <div style="display:flex; justify-content:space-between;">
          <p><b>Passed By:</b> ______________________</p>
          <p><b>Approved By:</b> ____________________</p>
        </div>
      </body></html>
    `;

    const win = window.open('', 'Print-Window');
    win.document.open();
    win.document.write(htmlContent);
    win.document.close();
    win.print();
  };

  const totalDistance = trips.reduce((sum, t) => sum + (t.distance || 0), 0);
  const totalParking = trips.reduce((sum, t) => sum + (t.parking || 0), 0);
  const totalPayment = trips.reduce((sum, t) => sum + (t.payment || 0), 0);

  if (loading) return <ActivityIndicator style={{ marginTop: 30 }} size="large" color="#003366" />;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Weekly Summary Report</Text>
      {user && <Text style={styles.subheader}>Runner: {user.name}</Text>}

      <View style={styles.filterBox}>
        <Text style={styles.label}>Status</Text>
        <Picker
          selectedValue={filter.status}
          onValueChange={(val) => setFilter({ ...filter, status: val })}
          style={styles.picker}
        >
          <Picker.Item label="All" value="" />
          <Picker.Item label="Pending" value="pending" />
          <Picker.Item label="Approved" value="approved" />
          <Picker.Item label="Declined" value="declined" />
        </Picker>

        <Text style={styles.label}>Manager</Text>
        <Picker
          selectedValue={filter.managerId}
          onValueChange={(val) => setFilter({ ...filter, managerId: val })}
          style={styles.picker}
        >
          <Picker.Item label="All" value="" />
          {managers.map((m) => (
            <Picker.Item key={m._id} label={m.name} value={m._id} />
          ))}
        </Picker>

        <Text style={styles.label}>Date Range</Text>
        <Picker
          selectedValue={filter.range}
          onValueChange={(val) => setFilter({ ...filter, range: val })}
          style={styles.picker}
        >
          <Picker.Item label="Daily" value="daily" />
          <Picker.Item label="Weekly" value="weekly" />
          <Picker.Item label="Monthly" value="monthly" />
        </Picker>

        <View style={{ marginTop: 10 }}>
          <Button title="Apply Filters" onPress={applyFilter} color="#ff6600" />
        </View>

        <View style={{ marginTop: 10 }}>
          <Button title="Export to PDF" onPress={handleExportPDF} color="#003366" />
        </View>
      </View>

      {/* Report Table Rendered on Screen */}
      {trips.length === 0 ? (
        <Text style={{ textAlign: 'center', marginTop: 20, color: '#999' }}>No trips found.</Text>
      ) : (
        <View>
          <View style={styles.tableHeader}>
            <Text style={styles.th}>Trip ID</Text>
            <Text style={styles.th}>Manager</Text>
            <Text style={styles.th}>Start</Text>
            <Text style={styles.th}>End</Text>
            <Text style={styles.th}>From</Text>
            <Text style={styles.th}>To</Text>
            <Text style={styles.th}>Distance</Text>
            <Text style={styles.th}>Modified KM</Text>
            <Text style={styles.th}>Parking</Text>
            <Text style={styles.th}>Payment</Text>
            <Text style={styles.th}>Status</Text>
          </View>
          {trips.map((trip) => (
            <View style={styles.tableRow} key={trip._id}>
              <Text style={styles.td}>{trip._id.slice(-5)}</Text>
              <Text style={styles.td}>{trip.managerName || '-'}</Text>
              <Text style={styles.td}>{new Date(trip.startTime).toLocaleString()}</Text>
              <Text style={styles.td}>{trip.endTime ? new Date(trip.endTime).toLocaleString() : '-'}</Text>
              <Text style={styles.td}>{trip.startLat && trip.startLng ? `${trip.startLat.toFixed(4)}, ${trip.startLng.toFixed(4)}` : '-'}</Text>
              <Text style={styles.td}>{trip.endLat && trip.endLng ? `${trip.endLat.toFixed(4)}, ${trip.endLng.toFixed(4)}` : '-'}</Text>
              <Text style={styles.td}>{(trip.finalKm ?? trip.distance)?.toFixed(2)} km</Text>
              <Text style={styles.td}>{trip.finalKm != null && trip.finalKm !== trip.distance ? 'Yes' : 'OK'}</Text>
              <Text style={styles.td}>₹{trip.parking?.toFixed(2) || '0.00'}</Text>
              <Text style={styles.td}>₹{trip.payment?.toFixed(2) || '0.00'}</Text>
              <Text style={styles.td}>{trip.status}</Text>
            </View>
          ))}
          <Text style={{ marginTop: 16, fontWeight: 'bold', color: '#003366' }}>
            Total Trips: {trips.length} &nbsp;&nbsp;&nbsp; Total Distance: {totalDistance.toFixed(2)} km &nbsp;&nbsp;&nbsp; Total Parking: ₹{totalParking.toFixed(2)} &nbsp;&nbsp;&nbsp; Total Payment: ₹{totalPayment.toFixed(2)}
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 40 }}>
            <Text>Passed By: ____________________</Text>
            <Text>Approved By: ____________________</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 12, backgroundColor: '#f4f6fa' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#003366', textAlign: 'center', marginBottom: 10 },
  subheader: { fontSize: 14, textAlign: 'center', marginBottom: 10 },
  filterBox: { backgroundColor: '#fff', padding: 10, borderRadius: 10, marginBottom: 12, elevation: 3 },
  label: { marginTop: 8, fontWeight: 'bold', color: '#003366' },
  picker: { backgroundColor: '#eef2f9', borderRadius: 6, marginTop: 4 },
  tableHeader: { flexDirection: 'row', flexWrap: 'wrap', backgroundColor: '#003366', padding: 4 },
  tableRow: { flexDirection: 'row', flexWrap: 'wrap', backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#eee' },
  th: { flex: 1, color: 'white', fontWeight: 'bold', fontSize: 10, textAlign: 'center' },
  td: { flex: 1, fontSize: 10, textAlign: 'center', paddingVertical: 2 },
});
