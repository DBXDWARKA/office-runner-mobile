import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import axios from 'axios';
import { BASE_URL } from '../config';

export default function AllUsers() {
  const [runners, setRunners] = useState([]);
  const [managers, setManagers] = useState([]);

  useEffect(() => {
    axios.get(`${BASE_URL}/api/admin/all-users`)
      .then(res => {
        setRunners(res.data.runners);
        setManagers(res.data.managers);
      })
      .catch(err => {
        console.error('Fetch users error:', err);
      });
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>👟 Runners</Text>
      {runners.map((runner, index) => (
        <View key={index} style={styles.card}>
          <Text style={styles.name}>{runner.name}</Text>
          <Text style={styles.info}>{runner.phone}</Text>
        </View>
      ))}

      <Text style={styles.header}>🧑‍💼 Managers</Text>
      {managers.map((manager, index) => (
        <View key={index} style={styles.card}>
          <Text style={styles.name}>{manager.name}</Text>
          <Text style={styles.info}>{manager.phone}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f4f6f9',
    flex: 1
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#003366',
    marginTop: 20,
    marginBottom: 10
  },
  card: {
    backgroundColor: '#fff',
    padding: 14,
    marginBottom: 10,
    borderRadius: 8,
    borderLeftWidth: 6,
    borderLeftColor: '#f58025',
    elevation: 2
  },
  name: {
    fontWeight: 'bold',
    fontSize: 16
  },
  info: {
    color: '#555'
  }
});
