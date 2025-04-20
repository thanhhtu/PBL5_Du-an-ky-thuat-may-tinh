import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { Device, DeviceLog, RootStackParamList } from '../types';
import deviceService from '../services/device.service';
import { ScrollView } from 'react-native-gesture-handler';

type ProfileDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ProfileDetailScreen'>;

const DeviceHistoryScreen = () => {
  const navigation = useNavigation<ProfileDetailScreenNavigationProp>();
  const [devices, setDevices] = useState<Device[]>([]);
  const [deviceLogs, setDeviceLogs] = useState<DeviceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [expandedDevices, setExpandedDevices] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all devices
        const fetchedDevices = await deviceService.getAllDevices();
        setDevices(fetchedDevices);

        // Fetch logs for each device
        const allDeviceLogs: DeviceLog[] = [];
        for (const device of fetchedDevices) {
          try {
            const deviceLogs = await deviceService.getDeviceLogs(device.id);
            allDeviceLogs.push(...deviceLogs);
          } catch (logError) {
            console.error(`Error loading logs for device ${device.id}:`, logError);
          }
        }
        
        setDeviceLogs(allDeviceLogs);
        setLoading(false);
      } catch (err) {
        console.error('Error loading data:', err);
        setError(err instanceof Error ? err : new Error('Undefined error'));
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Current time and 6 hours ago
  const currentTime = new Date();
  const sixHoursAgo = new Date(currentTime.getTime() - 6 * 60 * 60 * 1000);

  // Filter device logs within the last 6 hours
  const filteredDeviceLogs = deviceLogs.filter(log => {
    const logTime = new Date(log.timestamp);
    return logTime >= sixHoursAgo && logTime <= currentTime;
  });

  // Group device logs by device name
  const deviceLogGroups = filteredDeviceLogs.reduce((acc, log) => {
    const device = devices.find(d => d.id === log.deviceId);
    const deviceName = device ? device.name : 'Unknown Device';

    if (!acc[deviceName]) {
      acc[deviceName] = [];
    }
    acc[deviceName].push(log);

    return acc;
  }, {} as Record<string, DeviceLog[]>);

  // Sort logs within each device group
  Object.keys(deviceLogGroups).forEach(deviceName => {
    deviceLogGroups[deviceName].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  });

  // Toggle expand/collapse for each device
  const toggleDeviceExpand = (deviceName: string) => {
    setExpandedDevices(prev => ({
      ...prev,
      [deviceName]: !prev[deviceName]
    }));
  };

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
        <Text style={styles.headerTitle}>Device History (Last 6 Hours)</Text>
      </View>

      <ScrollView>
        {Object.keys(deviceLogGroups).length > 0 ? (
          Object.entries(deviceLogGroups).map(([deviceName, logs]) => (
            <View key={deviceName} style={styles.deviceHistorySection}>
              <TouchableOpacity 
                style={styles.deviceHistoryHeader}
                onPress={() => toggleDeviceExpand(deviceName)}
              >
                <Text style={styles.deviceHistoryTitle}>{deviceName}</Text>
                <Icon 
                  name={expandedDevices[deviceName] ? 'chevron-up-outline' : 'chevron-down-outline'} 
                  size={20} 
                  color="#666" 
                />
              </TouchableOpacity>
              
              {expandedDevices[deviceName] && logs.map((log, index) => (
                <View key={index} style={styles.historyItem}>
                  <View style={styles.historyItemHeader}>
                    <Text style={styles.historyAction}>
                      {log.action.replace('_', ' ').toUpperCase()}
                    </Text>
                    <Text style={styles.historyTime}>
                      {new Date(log.timestamp).toLocaleString()}
                    </Text>
                  </View>
                  <Text style={styles.historyIP}>
                    Performed by IP: {log.ipAddress}
                  </Text>
                </View>
              ))}
            </View>
          ))
        ) : (
          <Text style={styles.noHistoryText}>
            No device history in the last 6 hours
          </Text>
        )}
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
  deviceHistorySection: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 10,
    marginHorizontal: 10,
    padding: 15
  },
  deviceHistoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333'
  },
  deviceHistoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0'
  },
  historyItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingVertical: 10
  },
  historyItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5
  },
  historyAction: {
    fontWeight: 'bold',
    fontSize: 16
  },
  historyTime: {
    color: '#999',
    fontSize: 12
  },
  historyIP: {
    color: '#666',
    fontSize: 12,
    marginTop: 5
  },
  noHistoryText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20
  }
});

export default DeviceHistoryScreen;