// RunnerReportScreen.js (TPFA moved to top right, cleaner layout, and trip approved shown)
import React, { useState, useEffect } from 'react';
import {
  View, Text, Button, StyleSheet, ScrollView, TouchableOpacity
} from 'react-native';
import axios from 'axios';
import { DatePickerInput } from 'react-native-paper-dates';
import { en, registerTranslation } from 'react-native-paper-dates';
import { format } from 'date-fns';

registerTranslation('en', en);

export default function RunnerReportScreen({ route }) {
  const { user } = route.params;
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState([]);

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://127.0.0.1:3010/api/trip/report/${user._id}?from=${fromDate.toISOString()}&to=${toDate.toISOString()}`);
      setReport(res.data);
    } catch (err) {
      console.error('Report fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPending = async () => {
    try {
      const res = await axios.get(`http://127.0.0.1:3010/api/trip/pending-runner/${user._id}`);
      setPending(res.data);
    } catch (err) {
      console.error('Pending fetch failed:', err);
    }
  };

  const formatDate = (date) => date ? format(new Date(date), 'dd/MM/yyyy, hh:mm a') : 'N/A';

  const downloadExcel = () => {
    alert('Excel download not implemented yet');
  };

  const downloadPDF = () => {
    alert('PDF generation not implemented yet');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Runner Report</Text>
        {pending.length > 0 && (
          <View style={styles.tpfaBox}>
            <Text style={styles.tpfaTitle}>TPFA</Text>
            {pending.reduce((acc, trip) => {
              const key = trip.managerName || 'N/A';
              acc[key] = (acc[key] || 0) + 1;
              return acc;
            }, {}) && Object.entries(pending.reduce((acc, trip) => {
              const key = trip.managerName || 'N/A';
              acc[key] = (acc[key] || 0) + 1;
              return acc;
            }, {})).map(([manager, count]) => (
              <Text key={manager} style={styles.tpfaItem}>• {manager}: {count} pending</Text>
            ))}
          </View>
        )}
      </View>

      <Text style={styles.runnerInfo}>Runner: {user.name}</Text>

      <DatePickerInput
        locale="en"
        label="From Date"
        value={fromDate}
        onChange={(d) => setFromDate(d)}
        inputMode="start"
        style={styles.datepicker}
      />
      <DatePickerInput
        locale="en"
        label="To Date"
        value={toDate}
        onChange={(d) => setToDate(d)}
        inputMode="end"
        style={styles.datepicker}
      />

      <Button title="Generate Report" onPress={fetchReport} color="#007bff" disabled={loading} />

      {report && (
        <View style={styles.reportBox}>
          <Text style={styles.section}>Report for: {format(fromDate, 'dd/MM/yyyy')} to {format(toDate, 'dd/MM/yyyy')}</Text>
          <Text>Total Trips: {report.totalTrips}</Text>
          <Text>Total Distance: {report.totalDistance} km</Text>
          <Text>Total Parking: ₹{report.totalParking}</Text>
          <Text>Total Payment: ₹{report.totalPayment}</Text>

          <Text style={styles.section}>Trip Details:</Text>
          <View style={styles.tableHeader}>
            <Text style={styles.th}>#</Text>
            <Text style={styles.th}>Trip ID</Text>
            <Text style={styles.th}>Manager</Text>
            <Text style={styles.th}>Start</Text>
            <Text style={styles.th}>End</Text>
            <Text style={styles.th}>Distance</Text>
            <Text style={styles.th}>Parking</Text>
            <Text style={styles.th}>Payment</Text>
            <Text style={styles.th}>Approved</Text>
          </View>
          {report.trips.length === 0 && (
            <Text style={{ textAlign: 'center', marginTop: 10 }}>No trips found for selected date range.</Text>
          )}
          {report.trips.map((trip, index) => (
            <View key={trip._id} style={styles.row}>
              <Text style={styles.td}>{index + 1}</Text>
              <Text style={styles.td}>{trip._id.slice(-5)}</Text>
              <Text style={styles.td}>{trip.managerName || 'N/A'}</Text>
              <Text style={styles.td}>{formatDate(trip.startTime)}</Text>
              <Text style={styles.td}>{formatDate(trip.endTime)}</Text>
              <Text style={styles.td}>{trip.distance || 0} km</Text>
              <Text style={styles.td}>₹{trip.parkingAmount || 0}</Text>
              <Text style={styles.td}>₹{trip.payment || 0}</Text>
              <Text style={styles.td}>{trip.approved ? 'Yes' : 'No'}</Text>
            </View>
          ))}

          <View style={styles.downloadBox}>
            <TouchableOpacity style={styles.button} onPress={downloadPDF}>
              <Text style={styles.buttonText}>Download PDF</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={downloadExcel}>
              <Text style={styles.buttonText}>Download Excel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#f2f2f2', flexGrow: 1 },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  runnerInfo: { textAlign: 'center', marginBottom: 15 },
  datepicker: { marginBottom: 15 },
  section: { fontWeight: 'bold', marginTop: 20, marginBottom: 10 },
  reportBox: { marginTop: 20 },
  tableHeader: { flexDirection: 'row', flexWrap: 'wrap', backgroundColor: '#007bff', padding: 5 },
  th: { color: '#fff', fontWeight: 'bold', width: '11.1%', fontSize: 10 },
  row: { flexDirection: 'row', flexWrap: 'wrap', backgroundColor: '#fff', padding: 5, borderBottomWidth: 1, borderColor: '#ccc' },
  td: { width: '11.1%', fontSize: 10 },
  downloadBox: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 20 },
  button: { backgroundColor: '#28a745', padding: 10, borderRadius: 5 },
  buttonText: { color: 'white', fontWeight: 'bold' },
  tpfaBox: { backgroundColor: '#fff3cd', padding: 8, borderRadius: 8, marginBottom: 5, alignSelf: 'flex-end', maxWidth: 220 },
  tpfaTitle: { fontWeight: 'bold', color: '#856404', marginBottom: 5, textAlign: 'center' },
  tpfaItem: { color: '#856404', fontSize: 12 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }
});
