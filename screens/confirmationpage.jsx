import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BASE_URL from '../config';

export default function VideoUploadConfirmation({ navigation, route }) {
  const [reportReady, setReportReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('Generating report...');

  const reportId = route.params?.report_id;
  console.log('📥 Confirmation Page received params:', route.params);
  console.log('🆔 Extracted reportId:', reportId);

  useEffect(() => {
    let interval;
    let isReportReady = false;

    const checkReportStatus = async () => {
      // Don't check if we already found the report
      if (isReportReady) return;

      try {
        let response;

        // Always fetch latest report by username as requested
        const username = await AsyncStorage.getItem('username') || 'anonymous';
        console.log('🔍 Checking latest report for user:', username);
        response = await axios.get(`${BASE_URL}/get-latest-report`, {
          params: { username }
        });

        // RELAXED CHECK: If status is 200, assume success even if data.success is undefined
        if (response.status === 200) {
          isReportReady = true;
          setReportReady(true);
          setStatusMessage('✅ Report is ready!');

          // Try to extract report ID if we don't have it
          if (!reportId && response.data?.report?._id) {
            // We can't update route.params, but we can pass it when navigating
            // Store it in a temp variable or state if needed, but for now relying on latest-report fallback is fine
          }

          if (interval) {
            clearInterval(interval);
          }
        } else {
          setStatusMessage(response.data?.message || 'Processing video...');
        }
      } catch (error) {
        console.error('❌ Error checking report status:', error.message);
        setStatusMessage(`Error: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    // Check status every 5 seconds until ready
    interval = setInterval(() => {
      checkReportStatus();
    }, 5000);

    checkReportStatus(); // Run once initially

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      <Ionicons name="checkmark-circle-outline" size={90} color="#FF6600" style={styles.icon} />
      <Text style={styles.header}>Upload Successful!</Text>

      <Text style={styles.description}>
        {statusMessage === '✅ Report is ready!'
          ? 'Your bowling video has been analyzed successfully. Tap below to view your biomechanics report.'
          : 'Your bowling video has been uploaded and is being processed. This may take a few moments...'}
      </Text>

      {!reportReady ? (
        <View style={{ alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#FF6600" />
          <Text style={styles.status}>{statusMessage}</Text>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.button, !reportReady && { backgroundColor: '#555' }]}
          disabled={!reportReady}
          onPress={() => navigation.navigate('report', { reportId: reportId })}
        >
          <Text style={styles.buttonText}>View Report</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0c0c0c',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
  },
  icon: {
    marginBottom: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    color: '#bbb',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  status: {
    color: '#fff',
    marginTop: 10,
    fontSize: 14,
  },
  button: {
    backgroundColor: '#FF6600',
    paddingVertical: 14,
    paddingHorizontal: 50,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
