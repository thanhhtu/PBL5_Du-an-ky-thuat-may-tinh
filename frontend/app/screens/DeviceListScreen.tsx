import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView,
  ActivityIndicator 
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { NavigationProp } from '@react-navigation/native';
import { Device } from '../types';
import deviceService from '../services/device.service';

interface DeviceListScreenProps {
  navigation: NavigationProp<any>;
}

const DeviceListScreen: React.FC<DeviceListScreenProps> = ({ navigation }) => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const fetchedDevices = await deviceService.getAllDevices();
        setDevices(fetchedDevices);
        setLoading(false);
      } catch (err) {
        console.error('Error loading devices:', err);
        setError(err instanceof Error ? err : new Error('Undefined error'));
        setLoading(false);
      }
    };

    fetchDevices();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Data loading error: {error.message}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Device List</Text>
      </View>

      <ScrollView>
        {devices.map((device) => (
          <View key={device.id} style={styles.deviceListItem}>
            <Text style={styles.deviceName}>{device.name}</Text>
            <Text style={styles.deviceLabel}>{device.label}</Text>
            <Text 
              style={[
                styles.deviceState, 
                { color: device.state === 'on' ? '#4CAF50' : '#FF5722' }
              ]}
            >
              {device.state.toUpperCase()}
            </Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F2F5'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white'
  },
  headerTitle: {
    marginLeft: 15,
    fontSize: 18,
    fontWeight: 'bold'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  errorText: {
    color: 'red',
    fontSize: 18
  },
  deviceListItem: {
    backgroundColor: 'white',
    padding: 15,
    marginVertical: 5,
    marginHorizontal: 10,
    borderRadius: 10
  },
  deviceName: {
    fontWeight: 'bold',
    fontSize: 16
  },
  deviceLabel: {
    color: '#666'
  },
  deviceState: {
    marginTop: 5,
    fontWeight: 'bold'
  }
});

export default DeviceListScreen;