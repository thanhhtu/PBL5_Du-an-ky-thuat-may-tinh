import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { Device, DeviceLog } from '../types';
import deviceService from '../services/device.service';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTSIZE } from '../constants';

type DeviceStatusListScreenRouteProp = RouteProp<
  { DeviceStatusListScreen: undefined },
  'DeviceStatusListScreen'
>;

interface DeviceWithLog extends Device {
  latestLog?: DeviceLog;
}

const DeviceStatusListScreen = () => {
  const route = useRoute<DeviceStatusListScreenRouteProp>();
  const navigation = useNavigation();

  const [devices, setDevices] = useState<DeviceWithLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDevicesWithLogs = async () => {
    try {
      const fetchedDevices = await deviceService.getAllDevices();

      const devicesWithLogs = await Promise.all(
        fetchedDevices.map(async (device) => {
          try {
            const logs = await deviceService.getLogsByDeviceId(device.id);
            return {
              ...device,
              latestLog: logs.length > 0 ? logs[0] : undefined
            };
          } catch (logError) {
            console.warn(`Could not fetch log for device ${device.id}:`, logError);
            return { ...device, latestLog: undefined };
          }
        })
      );

      setDevices(devicesWithLogs);
      setError(null);
    } catch(error){
      if (error instanceof Error) {
        setError(error.message || 'Network error when fetching devices');
      } else {
        setError('An unknown error occurred');
      }
    }finally{
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchDevicesWithLogs();
      setLoading(false);
    };

    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDevicesWithLogs();
    setRefreshing(false);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;

    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (state: string) => {
    return state === 'on' ? 'power' : 'power-outline';
  };

  const getStatusColor = (state: string) => {
    return state === 'on' ? COLORS.brightGreen : COLORS.red;
  };

  if (loading || error) {
    return (
      <LinearGradient
        colors={COLORS.yellowGradient as readonly [string, string]}
        style={styles.gradientContainer}
      >
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name='arrow-back' size={40} color={COLORS.darkGreen} />
            </TouchableOpacity>

            <Text style={styles.deviceCount}>Operation Status of {devices.length} devices</Text>
          </View>

          {loading && (
              <View style={[styles.container, styles.centered]}>
                <ActivityIndicator size='large' color={COLORS.yellow} />
              </View>
            )}

          {error && (
            <View style={[styles.container, styles.centered]}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={() => {
                setError(null);
                setLoading(true);
                fetchDevicesWithLogs().finally(() => setLoading(false));
              }}>
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}
        </SafeAreaView>
        </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={COLORS.yellowGradient as readonly [string, string]}
      style={styles.gradientContainer}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name='arrow-back' size={40} color={COLORS.darkGreen} />
          </TouchableOpacity>

          <Text style={styles.deviceCount}>Status of {devices.length} devices</Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.yellow]} />}
          showsVerticalScrollIndicator={false}
        >
          {devices.map((device) => (
            <View key={device.id} style={styles.deviceCard}>
              <View style={styles.deviceHeader}>
                <View style={styles.deviceInfo}>
                  <Text style={styles.deviceName}>{device.name}</Text>
                  <Text style={styles.deviceLabel}>{device.label}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(device.state) }]}>
                  <Ionicons name={getStatusIcon(device.state)} size={16} color={COLORS.white} />
                  <Text style={styles.statusText}>{device.state === 'on' ? 'ON' : 'OFF'}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              {device.latestLog ? (
                <View style={styles.logInfo}>
                  <View style={styles.logRow}>
                    <Ionicons name='time-outline' style={styles.icon}/>
                    <Text style={styles.logText}>
                      Last action: {formatTimestamp(device.latestLog.timestamp)}
                    </Text>
                  </View>
                  <View style={styles.logRow}>
                    <Ionicons name='globe-outline' style={styles.icon}/>
                    <Text style={styles.logText}>IP: {device.latestLog.ipAddress}</Text>
                  </View>
                  <View style={styles.logRow}>
                    <Ionicons name='settings-outline' style={styles.icon}/>
                    <Text style={styles.logText}>
                      Action:{' '}
                      {device.latestLog.action === 'turn_on'
                        ? 'Turned On'
                        : device.latestLog.action === 'turn_off'
                        ? 'Turned Off'
                        : device.latestLog.action}
                    </Text>
                  </View>
                </View>
              ) : (
                <View style={styles.noLogInfo}>
                  <Ionicons name='information-circle-outline'style={styles.icon}/>
                  <Text style={styles.noLogText}>No action history available</Text>
                </View>
              )}
            </View>
          ))}

          {devices.length === 0 && (
            <View style={styles.emptyContainer}>
              <Ionicons name='cube-outline' size={64} color='#CCC' />
              <Text style={styles.emptyText}>No devices found</Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
    paddingHorizontal: 15,
  },

  container: { 
    flex: 1,
    marginTop: 20,
    marginBottom: 24,
    paddingHorizontal: 15,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  backButton: { 
    padding: 8,
    marginLeft: -8,
  },

  deviceCount: { 
    fontSize: FONTSIZE.medium,
    color: COLORS.yellow,
    fontWeight: 'bold',
  },

  scrollView: { 
    flex: 1, 
  },

  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 200,
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
  },

  deviceCard: {
    backgroundColor: COLORS.white,
    padding: 14,
    marginBottom: 15,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },

  deviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  deviceInfo: {
    flex: 1,
    paddingRight: 8,
  },

  deviceName: {
    fontSize: FONTSIZE.large,
    fontWeight: '700',
    color: COLORS.darkGreen,
  },

  deviceLabel: {
    fontSize: FONTSIZE.tiny,
    color: COLORS.gray,
    marginTop: 3,
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
  },

  statusText: {
    color: COLORS.white,
    fontWeight: '600',
    marginLeft: 6,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.lightGray,
    marginVertical: 10,
  },

  logInfo: {
    paddingHorizontal: 4,
  },

  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
    position: 'relative',
  },

  logText: {
    color: COLORS.gray,
    fontSize: FONTSIZE.small,
    paddingTop: 5,
    marginLeft: 25,
  },

  icon: {
    color: COLORS.gray,
    fontSize: 16,
    position: 'absolute',
    bottom: 0.6,
  },  

  noLogInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  noLogText: {
    color: COLORS.gray,
    fontSize: FONTSIZE.small,
    fontStyle: 'italic',
    marginLeft: 25,
  },

  emptyContainer: {
    marginTop: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyText: {
    marginTop: 12,
    fontSize: FONTSIZE.small,
    color: COLORS.yellow,
  }
});

export default DeviceStatusListScreen;
