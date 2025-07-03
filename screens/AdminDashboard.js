// AdminDashboard.js (with Reset Password + working buttons)

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import axios from 'axios';
import { BASE_URL } from '../config';

export default function AdminDashboard({ navigation, route }) {
  const { user } = route.params || {};

  const [runnerName, setRunnerName] = useState('');
  const [runnerPhone, setRunnerPhone] = useState('');
  const [runnerPassword, setRunnerPassword] = useState('');

  const [managerName, setManagerName] = useState('');
  const [managerPhone, setManagerPhone] = useState('');
  const [managerPassword, setManagerPassword] = useState('');

  const createRunner = async () => {
    try {
      await axios.post(`${BASE_URL}/api/admin/create-runner`, {
        name: runnerName,
        phone: runnerPhone,
        password: runnerPassword
      });
      Alert.alert('Success', 'Runner created successfully');
      setRunnerName('');
      setRunnerPhone('');
      setRunnerPassword('');
    } catch (err) {
      console.error('Runner create error:', err);
      Alert.alert('Error', 'Failed to create runner');
    }
  };

  const createManager = async () => {
    try {
      await axios.post(`${BASE_URL}/api/admin/create-manager`, {
        name: managerName,
        phone: managerPhone,
        password: managerPassword
      });
      Alert.alert('Success', 'Manager created successfully');
      setManagerName('');
      setManagerPhone('');
      setManagerPassword('');
    } catch (err) {
      console.error('Manager create error:', err);
      Alert.alert('Error', 'Failed to create manager');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Admin Dashboard</Text>

        <View style={styles.rowBox}>
          <View style={styles.card}>
            <Text style={styles.subheading}>Create Runner</Text>
            <TextInput style={styles.input} placeholder="Name" value={runnerName} onChangeText={setRunnerName} />
            <TextInput style={styles.input} placeholder="Phone" value={runnerPhone} onChangeText={setRunnerPhone} keyboardType="phone-pad" />
            <TextInput style={styles.input} placeholder="Password" value={runnerPassword} onChangeText={setRunnerPassword} secureTextEntry />
            <TouchableOpacity style={styles.runnerButton} onPress={createRunner}>
              <Text style={styles.buttonText}>Create Runner</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <Text style={styles.subheading}>Create Manager</Text>
            <TextInput style={styles.input} placeholder="Name" value={managerName} onChangeText={setManagerName} />
            <TextInput style={styles.input} placeholder="Phone" value={managerPhone} onChangeText={setManagerPhone} keyboardType="phone-pad" />
            <TextInput style={styles.input} placeholder="Password" value={managerPassword} onChangeText={setManagerPassword} secureTextEntry />
            <TouchableOpacity style={styles.managerButton} onPress={createManager}>
              <Text style={styles.buttonText}>Create Manager</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.subheading}>🔍 Manage</Text>

        <View style={styles.buttonGrid}>
          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('AllUsers', { user })}>
            <Text style={styles.buttonText}>👥 All Users</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('AdminReports', { user })}>
            <Text style={styles.buttonText}>📊 Admin Reports</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('BillingExport', { user })}>
            <Text style={styles.buttonText}>📁 Billing Export</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('ResetPassword', { user })}>
            <Text style={styles.buttonText}>🔐 Reset Password</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f0f4f8',
    flexGrow: 1
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#003366',
    textAlign: 'center',
    marginBottom: 20
  },
  subheading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#003366'
  },
  rowBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10
  },
  card: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 3
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginBottom: 10
  },
  runnerButton: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 5
  },
  managerButton: {
    backgroundColor: '#f58025',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 5
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginTop: 10
  },
  actionButton: {
    backgroundColor: '#003366',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginVertical: 6,
    minWidth: '40%',
    alignItems: 'center',
    elevation: 3
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14
  }
});
