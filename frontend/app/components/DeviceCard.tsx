import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { DeviceCardProps, DeviceState } from '../types';

const DeviceCard: React.FC<DeviceCardProps> = ({ device, onToggle }) => {
  const isActive = device.state === DeviceState.ON;

  const handleToggle = () => {
    onToggle(device.id, isActive ? DeviceState.OFF : DeviceState.ON);
  };
  
  return (
    <View style={[
      styles.container, 
      isActive ? styles.activeContainer : styles.inactiveContainer
    ]}>
      <View style={styles.subContainer}>
        <View style={styles.iconContainer}>
          <Image 
            source={{ uri: `${process.env.EXPO_PUBLIC_API_BASE_URL}/${device.image}` }} 
            style={styles.icon} 
            resizeMode="contain" 
          />
        </View>
        
        <TouchableOpacity 
          style={styles.toggleContainer}
          onPress={handleToggle}
          activeOpacity={0.8}
        >
          <View style={[
            styles.toggleTrack, 
            isActive ? styles.activeToggleTrack : styles.inactiveToggleTrack
          ]}>
            <View style={[
              styles.toggleThumb, 
              isActive ? styles.activeToggleThumb : styles.inactiveToggleThumb
            ]} />
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.name}>{device.name}</Text>
        <Text style={styles.label}>{device.label}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 20,
    height: 150,
    marginBottom: 20,
    // flexDirection: 'row',
    // alignItems: 'center',
    width: '47%', // Slightly smaller to ensure proper spacing
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  activeContainer: {
    backgroundColor: '#F9BA59', // Orange/yellow for Smart AC
  },
  inactiveContainer: {
    backgroundColor: '#FFFFFF', // White for inactive/Smart TV
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  subContainer: {
    flexDirection: 'row',
  },

  icon: {
    width: 28,
    height: 28,
  },

  contentContainer: {
    // flex: 2,
    // marginRight: 8,
  },

  name: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },

  label: {
    fontSize: 14,
    color: '#666666',
  },

  toggleContainer: {
    width: 48,
    height: 24,
    justifyContent: 'center',
  },

  toggleTrack: {
    width: 44,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
  },

  activeToggleTrack: {
    backgroundColor: '#D9F9FE', // Light blue background for active track
  },

  inactiveToggleTrack: {
    backgroundColor: '#E0E0E0', // Light gray for inactive track
  },

  toggleThumb: {
    width: 18,
    height: 18,
    borderRadius: 9,
    position: 'absolute',
  },

  activeToggleThumb: {
    backgroundColor: '#56D9E9', // Teal color for active toggle
    right: 3,
  },

  inactiveToggleThumb: {
    backgroundColor: '#FFFFFF', // White thumb for inactive toggle
    left: 3,
    borderWidth: 0.5,
    borderColor: '#CCCCCC',
  },
});

export default DeviceCard;