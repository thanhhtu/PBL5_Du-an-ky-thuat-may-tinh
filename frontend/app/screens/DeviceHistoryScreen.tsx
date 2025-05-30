import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { LineChart, BarChart } from 'react-native-chart-kit';
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
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');

  const screenData = Dimensions.get('window');

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

  // Get data for the last 7 days
  const getWeeklyData = () => {
    const currentTime = new Date();
    const sevenDaysAgo = new Date(currentTime.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Filter logs within the last 7 days
    const weeklyLogs = deviceLogs.filter(log => {
      const logTime = new Date(log.timestamp);
      return logTime >= sevenDaysAgo && logTime <= currentTime;
    });

    // Group logs by day
    const dailyUsage = {};
    const labels = [];
    
    // Create labels for the last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(currentTime.getTime() - i * 24 * 60 * 60 * 1000);
      const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD format
      const dayLabel = date.toLocaleDateString('vi-VN', { weekday: 'short' });
      labels.push(dayLabel);
      dailyUsage[dateKey] = 0;
    }

    // Count actions per day
    weeklyLogs.forEach(log => {
      const logDate = new Date(log.timestamp).toISOString().split('T')[0];
      if (dailyUsage.hasOwnProperty(logDate)) {
        dailyUsage[logDate]++;
      }
    });

    const data = Object.values(dailyUsage);

    return {
      labels,
      datasets: [{
        data,
        color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
        strokeWidth: 2
      }]
    };
  };

  // Get device usage statistics
  const getDeviceUsageStats = () => {
    const currentTime = new Date();
    const sevenDaysAgo = new Date(currentTime.getTime() - 7 * 24 * 60 * 60 * 1000);

    const weeklyLogs = deviceLogs.filter(log => {
      const logTime = new Date(log.timestamp);
      return logTime >= sevenDaysAgo && logTime <= currentTime;
    });

    // Group by device
    const deviceUsage = {};
    weeklyLogs.forEach(log => {
      const device = devices.find(d => d.id === log.deviceId);
      const deviceName = device ? device.name : 'Unknown';
      
      if (!deviceUsage[deviceName]) {
        deviceUsage[deviceName] = 0;
      }
      deviceUsage[deviceName]++;
    });

    // Sort devices by usage
    const sortedDevices = Object.entries(deviceUsage)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5); // Top 5 devices

    return {
      labels: sortedDevices.map(([name]) => name.length > 10 ? name.substring(0, 10) + '...' : name),
      datasets: [{
        data: sortedDevices.map(([, count]) => count)
      }]
    };
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#8641f4'
    }
  };

  const barChartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(54, 162, 235, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8641f4" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Lỗi tải dữ liệu: {error.message}</Text>
      </View>
    );
  }

  const weeklyData = getWeeklyData();
  const deviceStats = getDeviceUsageStats();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thống kê sử dụng thiết bị (7 ngày)</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Chart Type Toggle */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity 
            style={[styles.toggleButton, chartType === 'line' && styles.activeToggle]}
            onPress={() => setChartType('line')}
          >
            <Text style={[styles.toggleText, chartType === 'line' && styles.activeToggleText]}>
              Biểu đồ đường
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.toggleButton, chartType === 'bar' && styles.activeToggle]}
            onPress={() => setChartType('bar')}
          >
            <Text style={[styles.toggleText, chartType === 'bar' && styles.activeToggleText]}>
              Biểu đồ cột
            </Text>
          </TouchableOpacity>
        </View>

        {/* Daily Usage Chart */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Hoạt động hàng ngày</Text>
          {weeklyData.datasets[0].data.some(val => val > 0) ? (
            chartType === 'line' ? (
              <LineChart
                data={weeklyData}
                width={screenData.width - 40}
                height={220}
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
              />
            ) : (
              <BarChart
                data={weeklyData}
                width={screenData.width - 40}
                height={220}
                chartConfig={barChartConfig}
                style={styles.chart}
                showValuesOnTopOfBars
              />
            )
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>Không có dữ liệu trong 7 ngày qua</Text>
            </View>
          )}
        </View>

        {/* Device Usage Statistics */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Top 5 thiết bị được sử dụng nhiều nhất</Text>
          {deviceStats.datasets[0].data.length > 0 ? (
            <BarChart
              data={deviceStats}
              width={screenData.width - 40}
              height={220}
              chartConfig={{
                ...barChartConfig,
                color: (opacity = 1) => `rgba(255, 99, 132, ${opacity})`,
              }}
              style={styles.chart}
              showValuesOnTopOfBars
              fromZero
            />
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>Không có dữ liệu thiết bị</Text>
            </View>
          )}
        </View>

        {/* Statistics Summary */}
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Tổng quan</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>
                {deviceLogs.filter(log => {
                  const logTime = new Date(log.timestamp);
                  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                  return logTime >= sevenDaysAgo;
                }).length}
              </Text>
              <Text style={styles.summaryLabel}>Tổng hoạt động</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>
                {new Set(deviceLogs.filter(log => {
                  const logTime = new Date(log.timestamp);
                  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                  return logTime >= sevenDaysAgo;
                }).map(log => log.deviceId)).size}
              </Text>
              <Text style={styles.summaryLabel}>Thiết bị hoạt động</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>
                {Math.round(deviceLogs.filter(log => {
                  const logTime = new Date(log.timestamp);
                  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                  return logTime >= sevenDaysAgo;
                }).length / 7)}
              </Text>
              <Text style={styles.summaryLabel}>Trung bình/ngày</Text>
            </View>
          </View>
        </View>
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
    backgroundColor: 'white',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    marginLeft: 15,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center'
  },
  toggleContainer: {
    flexDirection: 'row',
    margin: 20,
    backgroundColor: '#E0E0E0',
    borderRadius: 25,
    padding: 4
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center'
  },
  activeToggle: {
    backgroundColor: '#8641f4'
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666'
  },
  activeToggleText: {
    color: 'white'
  },
  chartContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    margin: 20,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center'
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16
  },
  noDataContainer: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center'
  },
  noDataText: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center'
  },
  summaryContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    margin: 20,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center'
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  summaryItem: {
    alignItems: 'center'
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8641f4',
    marginBottom: 5
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center'
  }
});

export default DeviceHistoryScreen;