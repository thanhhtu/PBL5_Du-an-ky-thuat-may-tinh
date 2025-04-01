import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Alert, Platform } from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import axios from 'axios';
import { COLORS } from '../constants/colors';

// Get backend URL from environment variable
const backendUrl = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://10.0.2.2:3000';

interface BottomTabBarProps {
  activeTab: number;
  onTabChange: (index: number) => void;
}

const BottomTabBar: React.FC<BottomTabBarProps> = ({ activeTab, onTabChange }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  
  useEffect(() => {
    const getPermissions = async () => {
      try {
        const { status } = await Audio.requestPermissionsAsync();
        setHasPermission(status === 'granted');

        if (status === 'granted') {
          await Audio.setAudioModeAsync({
            allowsRecordingIOS: true,
            playsInSilentModeIOS: true,
          });
        } else {
          Alert.alert('Permission Required', 'Microphone access is needed.');
        }
      } catch (error) {
        console.error('Permission error:', error);
      }
    };
    getPermissions();
  }, []);

  const handleMicPress = async () => {
    if (!hasPermission) {
      Alert.alert('Permission Required', 'Microphone access is needed.');
      return;
    }
    try {
      if (!isRecording) {
        const { recording: newRecording } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        );
        setRecording(newRecording);
        setIsRecording(true);
      } else {
        if (!recording) return;

        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        setIsRecording(false);
        setRecording(null);

        if (uri) {
          console.log('🎤 Recorded file URI:', uri);

          // For mobile platforms, directly use the file URI
          if (Platform.OS === 'android' || Platform.OS === 'ios') {
            await sendAudioToBackend(uri);
          } else {
            // For web or other platforms
            const localUri = await convertBlobToFile(uri);
            console.log('📁 Converted local file:', localUri);
            await sendAudioToBackend(localUri);
          }
        }
      }
    } catch (error) {
      console.error('Recording error:', error);
    }
  };

  const convertBlobToFile = async (blobUri: string): Promise<string> => {
    try {
      console.log('🔄 Converting blob:', blobUri);
  
      const response = await fetch(blobUri);
      const blob = await response.blob();
  
      const filePath = `${FileSystem.cacheDirectory}audio_recording.m4a`;
      const base64 = await blobToBase64(blob); // Convert blob to base64
  
      await FileSystem.writeAsStringAsync(filePath, base64, { encoding: FileSystem.EncodingType.Base64 });
  
      console.log('✅ File saved:', filePath);
      return filePath;
    } catch (error) {
      console.error('❌ Error converting blob to file:', error);
      throw error;
    }
  };
  
  // Helper function to convert blob to base64
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Extract only the base64 data part (remove the data:audio/m4a;base64, prefix)
        const base64data = (reader.result as string).split(',')[1];
        resolve(base64data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };
  
  const sendAudioToBackend = async (filePath: string) => {
    try {
      const formData = new FormData();
      
      // Create file object for FormData
      const audioFile = {
        uri: filePath,
        name: `audio_${Date.now()}.m4a`,
        type: 'audio/m4a',
      } as any;
      
      formData.append('audio', audioFile);
      
      console.log('📤 Sending file:', filePath);
  
      const response = await axios.post(`${backendUrl}/ai/transcribe`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('✅ Response:', response.data);
      Alert.alert('Transcription', response.data.transcription);
    } catch (error) {
    //  console.error('❌ Upload error:', error.response?.data || error.message);
      Alert.alert('Error', 'Failed to send audio.');
    }
  };
  
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.tabButton} 
        onPress={() => onTabChange(0)}
      >
        <Image 
          source={require('../assets/icons/home.png')} 
          style={[styles.iconHome, activeTab === 0 && styles.activeIcon]} 
        />
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.micButton}
        onPress={handleMicPress}
      >
        <Image 
          source={require('../assets/icons/microphone.png')} 
          style={[styles.micIcon, isRecording && styles.recordingIcon]} 
        />
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.tabButton} 
        onPress={() => onTabChange(1)}
      >
        <Image 
          source={require('../assets/icons/profile.png')} 
          style={[styles.iconProfile, activeTab === 1 && styles.activeIcon]} 
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 75,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: COLORS.black,
    shadowOffset: { 
      width: 0, 
      height: -2 
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
    paddingHorizontal: 30,
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },

  iconHome: {
    width: 28.5,
    height: 25,
    opacity: 0.5,
  },

  iconProfile: {
    width: 24,
    height: 27,
    opacity: 0.5,
  },

  activeIcon: {
    opacity: 1,
    tintColor: COLORS.lightGreen
  },

  micButton: {
    width: 65,
    height: 65,
    borderRadius: 30,
    backgroundColor: COLORS.green,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.darkGreen,
    shadowOffset: { 
      width: 0, 
      height: 4 
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
    marginBottom: 30,
  },

  micIcon: {
    width: 20,
    height: 30,
    tintColor: COLORS.white,
  },

  recordingIcon: {
    tintColor: COLORS.red,
  },
});

export default BottomTabBar;