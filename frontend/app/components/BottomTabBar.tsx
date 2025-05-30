import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { COLORS } from '../constants';
import { BottomTabBarProps } from '../types';
import AudioService from '../services/audio.service';
import RecordingWaves from './RecordingWaves';

const BottomTabBar: React.FC<BottomTabBarProps> = ({ activeTab, onTabChange }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const audioServiceRef = useRef<AudioService | null>(null);

  useEffect(() => {
    // Initialize the audio service
    const audioService = new AudioService();
    audioServiceRef.current = audioService;
    
    // Set up callbacks
    audioService.setCallbacks({
      onRecordingStart: () => setIsRecording(true),
      onRecordingStop: () => setIsRecording(false),
      onPermissionStatus: (granted) => setHasPermission(granted),
      onError: (error) => handleError(error)
    });
    
    // Request audio permissions
    audioService.setupAudioPermissions()
      .catch(handleError);

    return () => {
      if (audioServiceRef.current) {
        audioServiceRef.current.cleanup();
        audioServiceRef.current = null;
      }
    };
  }, []);

  // Centralized error handler
  const handleError = (error: Error) => {
    console.error('Audio operation error:', error);
    Alert.alert('Error', error.message);
  };

  const handleMicPress = async () => {
    if (!audioServiceRef.current) return;
    
    try {
      // await audioServiceRef.current.toggleRecording();
      if (isRecording) {
        await audioServiceRef.current.stopRecording(false);
      } else {
        await audioServiceRef.current.startRecording();
      }
    } catch (error) {
      handleError(error instanceof Error ? error : new Error('Unknown error occurred'));
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.tabButton}
        onPress={() => !isRecording && onTabChange(0)}
        disabled={isRecording}
      >
        <Image
          source={require('../assets/icons/home.png')}
          style={[styles.iconHome, activeTab === 0 && !isRecording && styles.activeIcon, isRecording && styles.disabledIcon]}
        />
      </TouchableOpacity>

      <View style={styles.micButtonContainer}>
        {/* Waves component */}
        <RecordingWaves
          isRecording={isRecording}
          baseSize={70}
          waveColor={COLORS.yellow}
        />
        
        <TouchableOpacity
          style={[styles.micButton, isRecording && styles.recordingMicButton]}
          onPress={handleMicPress}
          disabled={!hasPermission}
        >
          <Image
            source={require('../assets/icons/microphone.png')}
            style={[styles.micIcon, isRecording ? styles.recordingIcon : styles.idleIcon]}
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.tabButton}
        onPress={() => !isRecording && onTabChange(1)}
        disabled={isRecording}
      >
        <Image
          source={require('../assets/icons/bars.png')}
          style={[styles.iconProfile, activeTab === 1 && !isRecording && styles.activeIcon, isRecording && styles.disabledIcon]}
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
      height: -3
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 12,
    paddingHorizontal: 20,
    justifyContent: 'space-around',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },

  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: '100%',
  },

  iconHome: {
    width: 28,
    height: 28,
    opacity: 0.6,
  },

  iconProfile: {
    width: 26,
    height: 29,
    opacity: 0.6,
  },

  activeIcon: {
    opacity: 1,
    tintColor: COLORS.lightGreen,
  },

  disabledIcon: {
    opacity: 0.3,
    tintColor: COLORS.gray,
  },

  micButtonContainer: {
    position: 'relative',
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    marginBottom: 25,
  },

  micButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.green,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.darkGreen,
    shadowOffset: {
      width: 0,
      height: 5
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 15,
    borderWidth: 3,
    borderColor: COLORS.white,
    zIndex: 10,
  },

  recordingMicButton: {
    backgroundColor: COLORS.yellow,
  },

  micIcon: {
    width: 20,
    height: 28,
  },

  idleIcon: {
    tintColor: COLORS.white,
  },

  recordingIcon: {
    tintColor: COLORS.white,
  },
});

export default BottomTabBar;