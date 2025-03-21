import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { COLORS, FONTSIZE } from '../constants/colors';
import DeviceCard from './DeviceCard';
import { Device, DeviceState } from '../types';
import deviceService from '../services/device.service';

const DeviceSection = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch devices from API
  const fetchDevices = async() => {
    try{
      setLoading(true);
      
      const devices = await deviceService.getAllDevices();
      setDevices(devices);
      setError(null);
    }catch(error){
      if (error instanceof Error) {
        setError(error.message || 'Network error when fetching devices');
      } else {
        setError('An unknown error occurred');
      }
    }finally{
      setLoading(false);
    }
  };

  // Toggle device sate
  const handleDeviceToggle = async(id: number, newState: DeviceState) => {
    try {
      // // Update UI immediately
      // setDevices((preDevices) => 
      //   preDevices.map((device) => 
      //     device.id === id 
      //     ? {...device, state: newState}
      //     : device
      //   )
      // );

      await deviceService.updateDeviceState(id, newState);

      console.log(`Device ${id} toggled to ${newState}`);
    } catch(error) {
      if (error instanceof Error) {
        setError(error.message || 'Network error when fetching devices');
      } else {
        setError('An unknown error occurred');
      }

      fetchDevices();
    }
  };

  useEffect(() => {
    fetchDevices();

    const unsubscribe = deviceService.onDeviceStateChange((updatedDevice) => {
      setDevices((prevDevices) => 
        prevDevices.map((device) => 
          device.id === updatedDevice.id
          ? updatedDevice
          : device
        )
      );
    });

    // Cleanup
    return () => {
      unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size='large' color={COLORS.yellow} />
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
          <Text style={styles.refresh}>Refresh</Text>
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
    marginTop: 20,
    marginBottom: 24,
    paddingHorizontal: 15,
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
    fontSize: FONTSIZE.large,
    fontWeight: 'bold',
    color: COLORS.black,
  },

  refresh: {
    fontSize: FONTSIZE.small,
    color: COLORS.yellow,
  },

  devicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  errorText: {
    fontSize: FONTSIZE.small,
    color: COLORS.red,
    marginBottom: 15,
  },

  retryButton: {
    backgroundColor: COLORS.green,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },

  retryText: {
    color: COLORS.white,
    fontWeight: 'bold',
  }
});

export default DeviceSection;