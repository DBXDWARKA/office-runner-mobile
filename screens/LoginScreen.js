// LoginScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL } from '../config';

export default function LoginScreen({ navigation }) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('runner');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!phone || !password) {
      Alert.alert('Missing Info', 'Please enter phone and password.');
      return;
    }

    try {
      setLoading(true);
      console.log('🔐 Trying to login with:', phone, password);

      const res = await axios.post(`${BASE_URL}/api/login`, { phone, password });
      const user = res.data;

      if (!user || !user.role) {
        Alert.alert('Login Failed', 'Invalid credentials or server error.');
        return;
      }

      if (user.role !== role) {
        Alert.alert('Role Mismatch', `You are registered as "${user.role}", but selected "${role}".`);
        return;
      }

      await AsyncStorage.setItem('user', JSON.stringify(user));

      if (user.role === 'runner') {
        navigation.navigate('RunnerDashboard', { user });
      } else if (user.role === 'manager') {
        navigation.navigate('ManagerDashboard', { user });
      } else if (user.role === 'admin') {
        navigation.navigate('AdminDashboard', { user });
      } else {
        Alert.alert('Login Failed', 'Unrecognized role.');
      }
    } catch (err) {
      console.error('❌ Login error:', err?.response?.data || err.message);
      Alert.alert('Login Failed', 'Server error or network issue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Image source={require('../Logo.png')} style={styles.logo} />
        <Text style={styles.welcome}>Welcome</Text>
        <Text style={styles.subtitle}>
          Deep Blue <Text style={{ color: 'orange' }}>Xpress</Text> - Office Runner
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Phone"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <Picker
          selectedValue={role}
          style={styles.picker}
          onValueChange={(itemValue) => setRole(itemValue)}
        >
          <Picker.Item label="Login as Runner" value="runner" />
          <Picker.Item label="Login as Manager" value="manager" />
          <Picker.Item label="Login as Admin" value="admin" />
        </Picker>

        <Button
          title={loading ? 'Logging in...' : 'LOGIN'}
          onPress={handleLogin}
          color="#007bff"
          disabled={loading}
        />
        {loading && <ActivityIndicator style={{ marginTop: 15 }} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1e3c72', padding: 20 },
  card: { backgroundColor: 'white', padding: 30, borderRadius: 10, width: '100%', maxWidth: 400, alignItems: 'center' },
  logo: { width: 140, height: 140, resizeMode: 'contain', marginBottom: 10 },
  welcome: { fontSize: 26, fontWeight: 'bold', color: '#003366' },
  subtitle: { fontSize: 16, marginBottom: 20, textAlign: 'center' },
  input: { width: '100%', borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 12, borderRadius: 5 },
  picker: { width: '100%', marginBottom: 20, color: '#333', backgroundColor: '#f2f2f2', borderRadius: 5 },
});
