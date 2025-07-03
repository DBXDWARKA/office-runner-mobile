// LoginScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import BASE_URL from '../config';
import { Image } from 'react-native';

const LoginScreen = ({ navigation }) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('runner'); // default selection

  const handleLogin = async () => {
    if (!phone || !password) {
      Alert.alert('Error', 'Please enter phone and password');
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.user.role !== role) {
          Alert.alert('Role Mismatch', `You are not registered as ${role}`);
          return;
        }

        await AsyncStorage.setItem('user', JSON.stringify(data.user));

        if (role === 'runner') navigation.navigate('RunnerDashboard', { user: data.user });
else if (role === 'manager') navigation.navigate('ManagerDashboard', { user: data.user });
else if (role === 'admin') navigation.navigate('AdminDashboard', { user: data.user });
      } else {
        Alert.alert('Login Failed', data.message || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Unable to connect to server');
    }
  };

  return (
  <View style={styles.container}>
    <View style={{ alignItems: 'center', marginBottom: 20 }}>
      <Image
        source={require('../assets/Logo.png')}
        style={{ width: 240, height: 240, resizeMode: 'contain' }}
      />
      <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#fff', marginTop: 10 }}>
        DBX Runner
      </Text>
    </View>

    <Picker
      selectedValue={role}
      onValueChange={(itemValue) => setRole(itemValue)}
      style={styles.picker}
    >
      <Picker.Item label="Runner" value="runner" />
      <Picker.Item label="Manager" value="manager" />
      <Picker.Item label="Admin" value="admin" />
    </Picker>

      <TextInput
        style={styles.input}
        placeholder="Phone"
        keyboardType="numeric"
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

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#001F54',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFA500',
    marginBottom: 30,
  },
  input: {
    backgroundColor: '#fff',
    width: '100%',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  
  button: {
    backgroundColor: '#FFA500',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    width: '100%',
    marginTop: 10,
  },
  buttonText: {
    color: '#001F54',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 18,
  },
picker: {
  backgroundColor: '#fff',
  borderRadius: 10,
  width: '100%',
  height: 50, // 👈 Increase height for better touchability
  justifyContent: 'center',
  marginBottom: 15,
  paddingHorizontal: 10,
},
});
