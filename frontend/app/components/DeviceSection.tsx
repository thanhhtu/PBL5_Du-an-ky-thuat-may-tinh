import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { COLORS } from '../constants/colors';
import DeviceCard from './DeviceCard';
import { Device, DeviceState } from '../types';
import axios from 'axios';
import { io } from 'socket.io-client';

const socket = io(process.env.EXPO_PUBLIC_API_BASE_URL);

const DeviceSection = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch devices from API
  const fetchDevices = async() => {
    try{
      setLoading(true);
      const res = await axios.get(`${process.env.EXPO_PUBLIC_API_BASE_URL}/devices`);
      if(res.data.success){
        setDevices(res.data.data);
      }else{
        setError('Failed to fetch data');
      }
    }catch(error){
      setError('Network error when fetching devices');
    }finally{
      setLoading(false);
    }
  };

  // Toggle device sate
  const handleDeviceToggle = async(id: number, newState: DeviceState) => {
    try {
      // Update UI immediately
      setDevices((preDevices) => 
        preDevices.map((device) => 
          device.id === id 
          ? {...device, state: newState}
          : device
        )
      );

      const res = await axios.patch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/devices/${id}/state`, {
        state: newState
      });

      if(!res.data.success) {
        fetchDevices();
      }

      console.log(`Device ${id} toggled to ${newState}`);
    } catch(error) {
      fetchDevices();
    }
  };

  useEffect(() => {
    fetchDevices();

    socket.on('device_state_changed', (updatedDevice: Device) => {
      console.log('Client connected socket')
      setDevices((preDevices) => 
        preDevices.map((device) => 
          device.id === updatedDevice.id
          ? updatedDevice
          : device
        )
      );
    });

    return () => {
      socket.off('device_state_changed');
    };
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchDevices}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Smart Devices</Text>
        <TouchableOpacity onPress={fetchDevices}>
          <Text style={styles.seeAll}>Refresh</Text>
        </TouchableOpacity>
      </View>
      
      {devices.length === 0 ? (
        <View style={styles.centered}>
          <Text>No devices found</Text>
        </View>
      ) : (
        <View style={styles.devicesGrid}>
          {devices.map((device) => (
            <DeviceCard 
              key={device.id} 
              device={device}
              onToggle={handleDeviceToggle}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 200,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  seeAll: {
    fontSize: 15,
    color: COLORS.primary,
  },
  devicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  errorText: {
    color: 'red',
    marginBottom: 15,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryText: {
    color: 'white',
    fontWeight: 'bold',
  }
});

export default DeviceSection;