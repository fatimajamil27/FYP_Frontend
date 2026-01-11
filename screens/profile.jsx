import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import BASE_URL from '../config';

const ProfileScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const fetchUserData = async () => {
    try {
      const user = await AsyncStorage.getItem('username');
      setUsername(user || 'User');
      return user;
    } catch (e) {
      console.error("Error fetching username", e);
      return null;
    }
  };

  const fetchReports = async (user) => {
    if (!user) return;
    try {
      const res = await axios.get(`${BASE_URL}/get-user-reports`, {
        params: { username: user }
      });

      if (res.data.success) {
        setReports(res.data.reports);
      }
    } catch (error) {
      console.log("Error fetching reports:", error);
      // Don't alert on initial load to avoid annoyance if empty
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadAll = async () => {
    const user = await fetchUserData();
    if (user) {
      await fetchReports(user);
    } else {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadAll();
  };

  const openReport = (report) => {
    navigation.navigate('report', { reportId: report.id });
  };

  const downloadReport = async (report) => {
    if (downloading) return;
    setDownloading(true);
    try {
      // 1. Fetch full report data
      const res = await axios.get(`${BASE_URL}/get-report`, {
        params: { report_id: report.id }
      });

      if (!res.data.success || !res.data.report) {
        Alert.alert("Error", "Could not fetch report data for download.");
        return;
      }

      const reportData = res.data.report;
      const fileName = `ProBowler_Report_${report.id.slice(-6)}.json`;
      const fileUri = FileSystem.documentDirectory + fileName;

      // 2. Write to local file
      await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(reportData, null, 2));

      // 3. Share the file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert("Saved", `Report saved to ${fileUri}`);
      }
    } catch (error) {
      console.error("Download error:", error);
      Alert.alert("Error", "Failed to download report.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Heading */}
      <Text style={styles.heading}>Profile Management</Text>

      {/* Profile Info */}
      <View style={styles.profileContainer}>
        <Ionicons name="person-circle" size={80} color="#555" />
        <View style={styles.userInfo}>
          <Text style={styles.username}>{username}</Text>
        </View>
      </View>

      {/* History Tab */}
      <Text style={styles.historyTab}>History</Text>

      {/* Reports List */}
      {loading ? (
        <ActivityIndicator size="large" color="#FF6600" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={reports}
          keyExtractor={(item) => item.id}
          scrollEnabled={false} // Let ScrollView handle scrolling
          renderItem={({ item }) => (
            <View style={styles.reportItem}>
              <TouchableOpacity
                style={{ flex: 1 }}
                onPress={() => openReport(item)}
              >
                <View>
                  <Text style={styles.reportText}>
                    Report - {new Date(item.createdAt).toLocaleDateString()}
                  </Text>
                  <Text style={styles.reportSubText}>
                    {item.video_count} video(s) • {item.summary_preview}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => downloadReport(item)}
                style={{ padding: 8 }}
              >
                <MaterialIcons name="visibility" size={28} color="#FF6600" />
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.noReports}>No reports available</Text>
          }
        />
      )}
    </ScrollView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 30,
    backgroundColor: '#f5f5f5',
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  userInfo: {
    marginLeft: 15,
  },
  username: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  historyTab: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#555',
  },
  reportItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 2,
  },
  reportText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  reportSubText: {
    fontSize: 12,
    color: '#777',
    marginTop: 4,
  },
  noReports: {
    textAlign: 'center',
    color: '#999',
    marginTop: 20,
  },
});
