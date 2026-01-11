import React, { useState, useEffect } from 'react';
import { View, Alert, StyleSheet, ActivityIndicator, Text, ScrollView, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Video as ExpoVideo } from 'expo-av';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BASE_URL from '../config';
import { Ionicons } from '@expo/vector-icons';
import InstructionsModal from '../components/InstructionsModal';

export default function UploadVideoScreen({ navigation }) {
  const [videos, setVideos] = useState([null, null, null]); // 3 slots
  const [uploading, setUploading] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);

  // Show welcome popup every time the page is opened
  useEffect(() => {
    setShowWelcomePopup(true);
  }, []);

  const handleCloseWelcomePopup = () => {
    setShowWelcomePopup(false);
    setShowInstructions(true);
  };

  const pickVideo = async (index) => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Camera roll permissions are needed to select videos.');
        return;
      }

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos, // Fixed: Use MediaTypeOptions
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newVideos = [...videos];
        newVideos[index] = result.assets[0];
        setVideos(newVideos);
      }
    } catch (error) {
      console.error("Error picking video:", error);
      Alert.alert("Error", "Failed to open gallery. Please try again.");
    }
  };

  const removeVideo = (index) => {
    const newVideos = [...videos];
    newVideos[index] = null;
    setVideos(newVideos);
  };

  const handleUpload = () => {
    const selectedVideos = videos.filter(v => v !== null);
    const count = selectedVideos.length;

    if (count === 0) {
      Alert.alert('No Videos', 'Please select at least 1 video to upload.');
      return;
    }

    if (count < 3) {
      Alert.alert(
        'Warning',
        'Uploading fewer than 3 videos could affect analysis. Do you want to proceed?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Proceed', onPress: () => performUpload(selectedVideos) }
        ]
      );
    } else {
      performUpload(selectedVideos);
    }
  };

  const performUpload = async (selectedVideos) => {
    setUploading(true);
    const formData = new FormData();

    // Retrieve username from AsyncStorage
    const username = await AsyncStorage.getItem('username') || 'anonymous';
    formData.append('username', username);

    // Map indices to view names for proper file naming
    const viewNames = ['back', 'side', 'front'];

    selectedVideos.forEach((video, i) => {
      // Find the original index in the videos array to get the correct view name
      const originalIndex = videos.findIndex(v => v === video);
      const viewName = viewNames[originalIndex] || 'unknown';

      // Use the asset's mimeType if available, otherwise fallback
      const fileType = video.mimeType || 'video/mp4';
      const originalFileName = video.fileName || `upload_${i + 1}.mp4`;

      // Prefix filename with view name for backend detection
      const fileName = `${viewName}_${originalFileName}`;

      formData.append('video', {
        uri: Platform.OS === 'ios' ? video.uri.replace('file://', '') : video.uri,
        name: fileName,
        type: fileType,
      });
    });

    try {
      console.log('Uploading to:', `${BASE_URL}/upload`);
      const response = await axios.post(`${BASE_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json',
        },
      });

      console.log('Upload success:', response.data);
      console.log('🚀 Navigating to Confirm with report_id:', response.data.report_id);

      setUploading(false);
      Alert.alert('Success', 'Videos uploaded and analyzed successfully!', [
        {
          text: 'OK',
          onPress: () => {
            console.log('🔘 OK Pressed. Navigating...');
            navigation.navigate('Confirm', {
              report_id: response.data.report_id
            });
          }
        },
      ]);
    } catch (error) {
      setUploading(false);
      console.error('Upload error:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || 'Could not upload videos. Please try again.';
      Alert.alert('Upload Failed', errorMessage);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Instructions Modal */}
      <InstructionsModal
        visible={showInstructions}
        onClose={() => setShowInstructions(false)}
      />

      {/* Welcome Popup */}
      {showWelcomePopup && (
        <View style={styles.welcomePopupOverlay}>
          <View style={styles.welcomePopup}>
            <Ionicons name="information-circle" size={48} color="#FFF" />
            <Text style={styles.welcomeTitle}>Welcome!</Text>
            <Text style={styles.welcomeText}>
              Please read the upload instructions by clicking the info icon at the top right corner.
            </Text>
            <TouchableOpacity
              style={styles.welcomeButton}
              onPress={handleCloseWelcomePopup}
            >
              <Text style={styles.welcomeButtonText}>Read Instructions</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.container}>
        {/* Header with Instructions Button */}
        <View style={styles.headerContainer}>
          <View>
            <Text style={styles.headerTitle}>Upload Bowling Videos</Text>
            <Text style={styles.subHeader}>Select videos from different angles</Text>
          </View>
          <TouchableOpacity
            style={styles.instructionsButton}
            onPress={() => setShowInstructions(true)}
          >
            <Ionicons name="information-circle-outline" size={32} color="#FFF" />
          </TouchableOpacity>
        </View>

        {videos.map((video, index) => {
          const viewLabels = ['Back View', 'Side View', 'Front View'];
          return (
            <View key={index} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{viewLabels[index]}</Text>
                {video && (
                  <TouchableOpacity onPress={() => removeVideo(index)}>
                    <Ionicons name="trash-outline" size={24} color="#FF4C29" />
                  </TouchableOpacity>
                )}
              </View>

              {video ? (
                <ExpoVideo
                  source={{ uri: video.uri }}
                  rate={1.0}
                  volume={1.0}
                  isMuted={false}
                  resizeMode="cover"
                  shouldPlay={false}
                  useNativeControls
                  style={styles.video}
                />
              ) : (
                <TouchableOpacity style={styles.placeholder} onPress={() => pickVideo(index)}>
                  <Ionicons name="cloud-upload-outline" size={40} color="#666" />
                  <Text style={styles.placeholderText}>Tap to Select Video</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}

        <TouchableOpacity
          style={[styles.submitButton, uploading && styles.disabledButton]}
          onPress={handleUpload}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.submitButtonText}>Analyze Videos</Text>
          )}
        </TouchableOpacity>

        {uploading && (
          <Text style={styles.processingText}>Processing your videos...</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#121212',
  },
  container: {
    padding: 20,
    alignItems: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
    marginBottom: 20,
    marginTop: 10,
  },
  instructionsButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 5,
  },
  subHeader: {
    fontSize: 12,
    color: '#AAA',
  },
  welcomePopupOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: 20,
  },
  welcomePopup: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
    maxWidth: 350,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 16,
    marginBottom: 12,
  },
  welcomeText: {
    fontSize: 16,
    color: '#FFF',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  welcomeButton: {
    backgroundColor: '#FF4C29',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  welcomeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  card: {
    width: '100%',
    backgroundColor: '#1E1E1E',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
  },
  video: {
    width: '100%',
    height: 180,
    borderRadius: 10,
    backgroundColor: '#000',
  },
  placeholder: {
    width: '100%',
    height: 180,
    borderRadius: 10,
    backgroundColor: '#2C2C2C',
    justifyContent: 'center',
    alignItems: 'center',
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: '#444',
  },
  placeholderText: {
    color: '#888',
    marginTop: 10,
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: '#FF4C29',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
    shadowColor: '#FF4C29',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  disabledButton: {
    backgroundColor: '#555',
    shadowOpacity: 0,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  processingText: {
    color: '#AAA',
    marginTop: 10,
    fontSize: 14,
  },
});
