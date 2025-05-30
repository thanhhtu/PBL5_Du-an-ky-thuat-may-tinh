import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { COLORS, FONTSIZE } from '../constants';
import DeviceCard from './DeviceCard';
import { Device, DeviceState } from '../types';
import deviceService from '../services/device.service';
import DeviceAllCard from './DeviceAllCard';

const DeviceSection = memo(() => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const isSetupRef = useRef(false);

  const fetchDevices = useCallback(async() => {
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
  }, []);

  const handleDeviceToggle = useCallback(async(id: number, newState: DeviceState) => {
    try {
      // // Optimistic update
      // setDevices((prevDevices) => 
      //   prevDevices.map((device) => 
      //     device.id === id 
      //     ? {...device, state: newState}
      //     : device
      //   )
      // );

      await deviceService.updateDeviceState(id, newState);
      console.log(`Device ${id} toggled to ${newState}`);
    } catch(error) {
      console.error('Error toggling device:', error);
      
      fetchDevices();
      
      if (error instanceof Error) {
        setError(error.message || 'Network error when updating device');
      } else {
        setError('An unknown error occurred');
      }
    }
  }, [fetchDevices]);

  const handleAllDevicesToggle = useCallback(async(newState: DeviceState) => {
    try {
      // // Optimistic update
      // setDevices((prevDevices) => 
      //   prevDevices.map((device) => 
      //     device.id === id 
      //     ? {...device, state: newState}
      //     : device
      //   )
      // );

      await deviceService.updateAllDeviceState(newState);
      console.log(`All devices toggled to ${newState}`);
    } catch(error) {
      console.error('Error toggling all devices:', error);
      
      fetchDevices();
      
      if (error instanceof Error) {
        setError(error.message || 'Network error when updating devices');
      } else {
        setError('An unknown error occurred');
      }
    }
  }, [fetchDevices]);

  // Setup socket listener chỉ MỘT LẦN
  useEffect(() => {
    if (!isSetupRef.current) {
      console.log('DeviceSection: Setting up socket listener once...');
      
      fetchDevices();

      unsubscribeRef.current = deviceService.onDeviceStateChange((updatedDevice) => {
        console.log('DeviceSection received socket update:', updatedDevice);
        setDevices((prevDevices) => 
          prevDevices.map((device) => 
            device.id === updatedDevice.id
            ? updatedDevice
            : device
          )
        );
      });

      isSetupRef.current = true;
    }

    // Cleanup chỉ khi component thực sự unmount
    return () => {
      if (unsubscribeRef.current && !isSetupRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, []); // Empty dependencies

  // Final cleanup
  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        console.log('DeviceSection: Final cleanup...');
        unsubscribeRef.current();
        unsubscribeRef.current = null;
        isSetupRef.current = false;
      }
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
        <View style={styles.deviceContainer}>
          <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
          >
            <DeviceAllCard 
              devices={devices}
              onToggle={handleAllDevicesToggle} 
            />

            <View style={styles.devicesGrid}>
              {devices.map((device) => (
                <DeviceCard 
                  key={device.id} 
                  device={device}
                  onToggle={handleDeviceToggle}
                />
              ))}
            </View>
          </ScrollView>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    marginBottom: 24,
    paddingHorizontal: 15,
    position: 'relative',
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

  deviceContainer: {
    height: 300, 
    overflow: 'hidden',
  },

  scrollView: {
    width: '100%',
    height: '100%',
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