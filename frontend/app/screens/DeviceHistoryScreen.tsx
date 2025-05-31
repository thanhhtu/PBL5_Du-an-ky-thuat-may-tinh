import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  ScrollView,
  FlatList
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Device, DeviceLog } from '../types';
import deviceService from '../services/device.service';

type DeviceHistoryScreenRouteProp = RouteProp<
  { DeviceHistoryScreen: undefined },
  'DeviceHistoryScreen'
>;

const DeviceHistoryScreen = () => {
  const route = useRoute<DeviceHistoryScreenRouteProp>();
  const navigation = useNavigation(); 

  const [devices, setDevices] = useState<Device[]>([]);
  const [deviceLogs, setDeviceLogs] = useState<DeviceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [viewMode, setViewMode] = useState<'daily' | '7days'>('daily'); // 'daily' ở đây sẽ là "Theo thiết bị trong ngày"
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const screenData = Dimensions.get('window');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const fetchedDevices = await deviceService.getAllDevices();
        setDevices(fetchedDevices);

        const allDeviceLogs: DeviceLog[] = [];
        for (const device of fetchedDevices) {
          try {
            // Giả sử getLogsByDeviceId trả về DeviceLog[]
            const logsForDevice: DeviceLog[] = await deviceService.getLogsByDeviceId(device.id);
            allDeviceLogs.push(...logsForDevice);
          } catch (logError) {
            console.error(`Error loading logs for device ${device.id}:`, logError);
          }
        }
        
        setDeviceLogs(allDeviceLogs);
      } catch (err) {
        console.error('Error loading data:', err);
        setError(err instanceof Error ? err : new Error(String(err) || 'Undefined error'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getWeeklyData = () => {
    const currentTime = new Date();
    // Điều chỉnh ngày bắt đầu của tuần để lấy 7 ngày tính từ ngày cuối tuần
    const endOfWeek = new Date(currentTime);
    endOfWeek.setDate(currentTime.getDate() - (weekOffset * 7));
    endOfWeek.setHours(23, 59, 59, 999);


    const startOfWeek = new Date(endOfWeek);
    startOfWeek.setDate(endOfWeek.getDate() - 6);
    startOfWeek.setHours(0, 0, 0, 0);


    const weeklyLogs = deviceLogs.filter(log => {
      const logTime = new Date(log.timestamp);
      return logTime >= startOfWeek && logTime <= endOfWeek;
    });

    const labels: string[] = [];
    const dateKeys: string[] = [];
    for (let i = 0; i <= 6; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const dateKey = date.toISOString().split('T')[0];
      const dayLabel = date.toLocaleDateString('vi-VN', { weekday: 'short' });
      labels.push(dayLabel);
      dateKeys.push(dateKey);
    }

    const deviceData: { [key: string]: { name: string; data: number[] } } = {};
    devices.forEach(device => {
      deviceData[device.id] = {
        name: device.name,
        data: new Array(7).fill(0),
      };
    });

    weeklyLogs.forEach(log => {
      const logDate = new Date(log.timestamp).toISOString().split('T')[0];
      const dayIndex = dateKeys.indexOf(logDate);
      if (dayIndex !== -1 && deviceData[log.deviceId]) {
        deviceData[log.deviceId].data[dayIndex]++;
      }
    });

    const colors = [
      'rgba(134, 65, 244, 1)', 'rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)',
      'rgba(255, 206, 86, 1)', 'rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)',
      'rgba(255, 159, 64, 1)',
    ];

    const datasets = Object.values(deviceData)
      .filter((device: any) => device.data.some((val: number) => val > 0))
      .slice(0, 7)
      .map((device: any, index) => ({
        data: device.data,
        color: (opacity = 1) => colors[index % colors.length].replace('1)', `${opacity})`),
        strokeWidth: 2,
      }));
    
    const legend = Object.values(deviceData)
      .filter((device: any) => device.data.some((val: number) => val > 0))
      .slice(0, 7)
      .map((device: any) => device.name);

    return {
      labels,
      datasets: datasets.length > 0 ? datasets : [{
        data: new Array(7).fill(0),
        color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
        strokeWidth: 2,
      }],
      legend: legend.length > 0 ? legend : [],
    };
  };

  // Sửa hàm này để BarChart có thể cuộn
  const getDailyDeviceData = () => { // Đổi tên hàm cho rõ nghĩa
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const dailyLogs = deviceLogs.filter(log => {
      const logTime = new Date(log.timestamp);
      return logTime >= startOfDay && logTime <= endOfDay;
    });

    // Lấy tất cả các thiết bị có log trong ngày đó
    const activeDeviceIdsInDay = [...new Set(dailyLogs.map(log => log.deviceId))];
    const displayDevices = devices.filter(device => activeDeviceIdsInDay.includes(device.id));
    
    if (displayDevices.length === 0) {
      return {
        labels: ['Không có hoạt động'],
        datasets: [{ data: [0] }],
        barChartWidth: screenData.width - 40, // Default width
      };
    }

    const labels = displayDevices.map(device => {
      const name = device.name;
      return name.length > 10 ? name.substring(0, 10) + '...' : name; // Tăng giới hạn cắt chữ
    });

    const deviceUsageData = displayDevices.map(device => {
      return dailyLogs.filter(log => log.deviceId === device.id).length;
    });
    
    const baseColors = [
        (opacity = 1) => `rgba(134, 65, 244, ${opacity})`, // Purple
        (opacity = 1) => `rgba(255, 99, 132, ${opacity})`, // Red
        (opacity = 1) => `rgba(54, 162, 235, ${opacity})`, // Blue
        (opacity = 1) => `rgba(255, 206, 86, ${opacity})`, // Yellow
        (opacity = 1) => `rgba(75, 192, 192, ${opacity})`,  // Teal
        (opacity = 1) => `rgba(153, 102, 255, ${opacity})`,// Lavender
        (opacity = 1) => `rgba(255, 159, 64, ${opacity})`, // Orange
    ];

    // Ước lượng chiều rộng mỗi cột (ví dụ 60px, bao gồm khoảng cách)
    const barItemEstimatedWidth = 60; 
    const calculatedBarChartWidth = Math.max(
      screenData.width - 40, // Chiều rộng tối thiểu
      labels.length * barItemEstimatedWidth 
    );

    return {
      labels,
      datasets: [{
        data: deviceUsageData,
        // Cung cấp mảng màu cho withCustomBarColorFromData
        colors: displayDevices.map((_, index) => baseColors[index % baseColors.length])
      }],
      barChartWidth: calculatedBarChartWidth, // Truyền chiều rộng đã tính
    };
  };


  const getRecentLogs = () => {
    return deviceLogs
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 50);
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4', // Giảm kích thước điểm
      strokeWidth: '2',
      stroke: '#8641f4',
    },
    scrollableDotFill: '#fff',
    scrollableDotStrokeColor: '#8641f4',
    scrollableDotStrokeWidth: 2,
    scrollableDotRadius: 6, // Có thể không cần nếu không dùng điểm cuộn
    scrollableInfoViewStyle: {
      backgroundColor: 'white',
      borderRadius: 5,
      padding: 5,
      marginTop: 5,
    },
  };

  const renderLogItem = ({ item }: { item: DeviceLog }) => {
    const device = devices.find(d => d.id === item.deviceId);
    const timestamp = new Date(item.timestamp);
    
    return (
      <View style={styles.logItem}>
        <View style={styles.logColumn}><Text style={styles.logId} numberOfLines={1} ellipsizeMode="tail">{item.id}</Text></View>
        <View style={styles.logColumn}><Text style={styles.logAction}>{item.action}</Text></View>
        <View style={styles.logColumn}><Text style={styles.logPreviousState}>{item.previousState}</Text></View>
        <View style={styles.logColumn}>
          <Text style={styles.logTimestamp}>{timestamp.toLocaleDateString('vi-VN')}</Text>
          <Text style={styles.logTime}>{timestamp.toLocaleTimeString('vi-VN')}</Text>
        </View>
        <View style={styles.logColumn}><Text style={styles.logIpAddress}>{item.ipAddress}</Text></View>
        <View style={styles.logColumn}><Text style={styles.logDeviceId} numberOfLines={1} ellipsizeMode="tail">{device?.name || item.deviceId}</Text></View>
      </View>
    );
  };

  if (loading) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#8641f4" /></View>;
  }

  if (error) {
    return <View style={styles.errorContainer}><Text style={styles.errorText}>Lỗi tải dữ liệu: {error.message}</Text></View>;
  }

  // Sử dụng hàm mới cho daily view
  const currentChartData = viewMode === '7days' ? getWeeklyData() : getDailyDeviceData();
  const recentLogs = getRecentLogs();

  const get7DayStats = () => {
    const currentTime = new Date();
    const sevenDaysAgo = new Date(currentTime);
    sevenDaysAgo.setDate(currentTime.getDate() - 6);
    sevenDaysAgo.setHours(0,0,0,0);

    const endOfCurrentDay = new Date(currentTime);
    endOfCurrentDay.setHours(23,59,59,999);

    const weekLogs = deviceLogs.filter(log => {
      const logTime = new Date(log.timestamp);
      return logTime >= sevenDaysAgo && logTime <= endOfCurrentDay;
    });
    
    return {
      total: weekLogs.length,
      average: weekLogs.length > 0 ? Math.round(weekLogs.length / 7) : 0,
    };
  };

  const getDailyStats = () => { // Thống kê này giờ sẽ là cho các thiết bị trong ngày đã chọn
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    const dayLogs = deviceLogs.filter(log => {
      const logTime = new Date(log.timestamp);
      return logTime >= startOfDay && logTime <= endOfDay;
    });

    const deviceUsage: { [key: string]: number } = {};
    dayLogs.forEach(log => {
      if (!deviceUsage[log.deviceId]) {
        deviceUsage[log.deviceId] = 0;
      }
      deviceUsage[log.deviceId]++;
    });
    
    const topDeviceId = Object.keys(deviceUsage).length > 0 
      ? Object.keys(deviceUsage).reduce((a, b) => deviceUsage[a] > deviceUsage[b] ? a : b)
      : null;
    
    const topDeviceName = topDeviceId ? (devices.find(d => d.id === topDeviceId)?.name || 'N/A') : 'N/A';

    return {
      total: dayLogs.length, // Tổng hoạt động trong ngày
      deviceCount: Object.keys(deviceUsage).length, // Số thiết bị hoạt động trong ngày
      topDevice: topDeviceName, // Thiết bị dùng nhiều nhất trong ngày
    };
  };

  const stats = viewMode === '7days' ? get7DayStats() : getDailyStats();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thống kê sử dụng thiết bị</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.toggleContainer}>
          <TouchableOpacity 
            style={[styles.toggleButton, viewMode === '7days' && styles.activeToggle]}
            onPress={() => setViewMode('7days')}
          >
            <Text style={[styles.toggleText, viewMode === '7days' && styles.activeToggleText]}>7 ngày</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.toggleButton, viewMode === 'daily' && styles.activeToggle]}
            onPress={() => setViewMode('daily')}
          >
            <Text style={[styles.toggleText, viewMode === 'daily' && styles.activeToggleText]}>Theo thiết bị (ngày)</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.chartContainer}>
          {viewMode === '7days' ? (
            <>
              <View style={styles.weekNavigation}>
                <TouchableOpacity 
                  style={styles.navButton}
                  onPress={() => setWeekOffset(weekOffset + 1)} // Lùi về tuần trước
                >
                  <Ionicons name="chevron-back" size={20} color="#8641f4" />
                  <Text style={styles.navText}>Tuần trước</Text>
                </TouchableOpacity>
                <Text style={styles.weekTitle}>
                  {weekOffset === 0 ? 'Tuần này' : 
                   weekOffset === 1 ? 'Tuần trước' : 
                   `${weekOffset} tuần trước`}
                </Text>
                <TouchableOpacity 
                  style={styles.navButton}
                  onPress={() => setWeekOffset(weekOffset - 1)} // Tiến tới tuần sau
                  disabled={weekOffset <= 0} // Chỉ cho phép xem các tuần quá khứ và hiện tại
                >
                  <Text style={[styles.navText, weekOffset <= 0 && styles.disabledText]}>Tuần sau</Text>
                  <Ionicons name="chevron-forward" size={20} color={weekOffset <= 0 ? "#ccc" : "#8641f4"} />
                </TouchableOpacity>
              </View>
              <Text style={styles.chartTitle}>Hoạt động thiết bị trong tuần</Text>
              {currentChartData.datasets && currentChartData.datasets[0].data.some(val => val > 0) ? (
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={true}
                  style={styles.chartScrollView}
                >
                  <LineChart
                    data={currentChartData} // labels, datasets, legend
                    width={Math.max(screenData.width - 40, (currentChartData.labels?.length || 0) * 60)}
                    height={220}
                    chartConfig={chartConfig}
                    bezier
                    style={styles.chart}
                    yAxisSuffix=""
                    yAxisLabel=""
                    // Thêm legend nếu bạn muốn hiển thị tên các đường
                    // legend={currentChartData.legend} 
                  />
                </ScrollView>
              ) : (
                <View style={styles.noDataContainer}><Text style={styles.noDataText}>Không có dữ liệu trong tuần này</Text></View>
              )}
            </>
          ) : ( // daily view - BarChart hiển thị sử dụng của từng thiết bị trong ngày đã chọn
            <>
              <View style={styles.dateNavigation}>
                <TouchableOpacity 
                  style={styles.navButton}
                  onPress={() => {
                    const newDate = new Date(selectedDate);
                    newDate.setDate(newDate.getDate() - 1);
                    setSelectedDate(newDate);
                  }}
                >
                  <Ionicons name="chevron-back" size={20} color="#8641f4" />
                  <Text style={styles.navText}>Hôm qua</Text>
                </TouchableOpacity>
                <Text style={styles.dateTitle}>{selectedDate.toLocaleDateString('vi-VN')}</Text>
                <TouchableOpacity 
                  style={styles.navButton}
                  onPress={() => {
                    const newDate = new Date(selectedDate);
                    newDate.setDate(newDate.getDate() + 1);
                    if (newDate <= new Date()) setSelectedDate(newDate); // Không cho chọn ngày tương lai
                  }}
                  disabled={selectedDate.toDateString() === new Date().toDateString()}
                >
                  <Text style={[styles.navText, selectedDate.toDateString() === new Date().toDateString() && styles.disabledText]}>Hôm sau</Text>
                  <Ionicons name="chevron-forward" size={20} color={selectedDate.toDateString() === new Date().toDateString() ? "#ccc" : "#8641f4"} />
                </TouchableOpacity>
              </View>
              <Text style={styles.chartTitle}>Số lần sử dụng của từng thiết bị trong ngày</Text>
              {currentChartData.datasets && currentChartData.datasets[0].data.some(val => val > 0) ? (
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={true}
                  style={styles.chartScrollView}
                >
                  <BarChart
                    data={{
                        labels: currentChartData.labels || [],
                        datasets: currentChartData.datasets || []
                    }}
                    width={currentChartData.barChartWidth || (screenData.width - 40)}
                    height={220}
                    chartConfig={chartConfig} // Có thể tạo barChartConfig riêng nếu muốn màu khác
                    style={styles.chart}
                    showValuesOnTopOfBars
                    fromZero
                    yAxisSuffix=""
                    withCustomBarColorFromData={true} // Để sử dụng màu từ dataset.colors
                  />
                </ScrollView>
              ) : (
                <View style={styles.noDataContainer}><Text style={styles.noDataText}>Không có dữ liệu trong ngày này</Text></View>
              )}
            </>
          )}
        </View>

        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>{viewMode === '7days' ? 'Tổng quan 7 ngày' : 'Tổng quan ngày đã chọn'}</Text>
          <View style={styles.summaryRow}>
            {viewMode === '7days' ? (
              <>
                <View style={styles.summaryItem}><Text style={styles.summaryNumber}>{stats.total}</Text><Text style={styles.summaryLabel}>Tổng hoạt động</Text></View>
                <View style={styles.summaryItem}><Text style={styles.summaryNumber}>{stats.average}</Text><Text style={styles.summaryLabel}>Trung bình/ngày</Text></View>
              </>
            ) : ( // daily stats
              <>
                <View style={styles.summaryItem}><Text style={styles.summaryNumber}>{stats.total}</Text><Text style={styles.summaryLabel}>Hoạt động</Text></View>
                <View style={styles.summaryItem}><Text style={styles.summaryNumber}>{stats.deviceCount}</Text><Text style={styles.summaryLabel}>Thiết bị</Text></View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryNumber} numberOfLines={1} ellipsizeMode="tail">
                    {stats.topDevice.length > 10 ? stats.topDevice.substring(0, 10) + '...' : stats.topDevice}
                  </Text>
                  <Text style={styles.summaryLabel}>Dùng nhiều</Text>
                </View>
              </>
            )}
          </View>
        </View>

        <View style={styles.logContainer}>
          <Text style={styles.logTitle}>Lịch sử hoạt động gần đây</Text>
          <View style={styles.logHeader}>
            <View style={styles.logColumn}><Text style={styles.logHeaderText}>ID Log</Text></View>
            <View style={styles.logColumn}><Text style={styles.logHeaderText}>H.Động</Text></View>
            <View style={styles.logColumn}><Text style={styles.logHeaderText}>T.T Trước</Text></View>
            <View style={styles.logColumn}><Text style={styles.logHeaderText}>Thời gian</Text></View>
            <View style={styles.logColumn}><Text style={styles.logHeaderText}>IP</Text></View>
            <View style={styles.logColumn}><Text style={styles.logHeaderText}>Thiết bị</Text></View>
          </View>
          <FlatList
            data={recentLogs}
            renderItem={renderLogItem}
            keyExtractor={(item) => item.id.toString()}
            style={styles.logList}
            nestedScrollEnabled={true}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Styles giữ nguyên như bạn cung cấp hoặc styles đã được cải thiện ở lần trước
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F2F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    marginLeft: 15,
    fontSize: 18,
    fontWeight: '600', 
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F2F5',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F0F2F5',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
  toggleContainer: {
    flexDirection: 'row',
    marginHorizontal: 15, 
    marginTop: 15,
    backgroundColor: '#E9E9EB', 
    borderRadius: 10, 
    padding: 3, 
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8, 
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeToggle: {
    backgroundColor: '#8641f4', 
    shadowColor: '#8641f4', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '500', 
    color: '#4A4A4A', 
  },
  activeToggleText: {
    color: 'white',
    fontWeight: '600',
  },
  chartContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginHorizontal: 15,
    marginTop: 15,
    paddingVertical: 15,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  weekNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 10, 
  },
  dateNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10, 
    borderRadius: 6, 
  },
  navText: {
    fontSize: 13,
    color: '#8641f4',
    fontWeight: '500',
    marginHorizontal: 3,
  },
  disabledText: {
    color: '#B0B0B0', 
  },
  weekTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    flex: 1, 
  },
  dateTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    flex: 1,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
    paddingHorizontal: 15, 
  },
  chartScrollView: {
    // marginVertical: 8, // Bỏ nếu không cần thiết
    // paddingHorizontal: 5 // Thêm padding nhỏ nếu cần
  },
  chart: {
    marginVertical: 8,
    borderRadius: 10,
    paddingRight: 15, // QUAN TRỌNG: Để label cuối cùng của BarChart không bị cắt
  },
  noDataContainer: {
    height: 220, 
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  noDataText: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
  },
  summaryContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginHorizontal: 15,
    marginTop: 15,
    padding: 15,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 5,
  },
  summaryNumber: {
    fontSize: 20, 
    fontWeight: 'bold',
    color: '#8641f4',
    marginBottom: 3,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#555',
    textAlign: 'center',
  },
  logContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginHorizontal: 15,
    marginTop: 15,
    marginBottom: 20, 
    paddingVertical: 15,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  logTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
    paddingHorizontal: 15, 
  },
  logHeader: {
    flexDirection: 'row',
    backgroundColor: '#F8F8F8',
    paddingVertical: 10,
    paddingHorizontal: 10, 
    borderRadius: 8,
    marginHorizontal: 10, 
    marginBottom: 8,
  },
  logColumn: { 
    flex: 1,
    paddingHorizontal: 2, 
    justifyContent: 'center',
    alignItems: 'center', 
  },
  logHeaderText: {
    fontSize: 10, 
    fontWeight: '600',
    color: '#4A4A4A',
    textAlign: 'center',
  },
  logList: {
    maxHeight: 300, 
    paddingHorizontal: 10, 
  },
  logItem: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  logId: { fontSize: 10, color: '#777', textAlign: 'center' },
  logAction: { fontSize: 10, color: '#333', fontWeight: '500', textAlign: 'center' },
  logPreviousState: { fontSize: 10, color: '#777', textAlign: 'center' },
  logTimestamp: { fontSize: 10, color: '#555', textAlign: 'center' },
  logTime: { fontSize: 9, color: '#888', textAlign: 'center', marginTop: 2 },
  logIpAddress: { fontSize: 10, color: '#777', textAlign: 'center' },
  logDeviceId: { fontSize: 10, color: '#333', fontWeight: '500', textAlign: 'center' },
});


export default DeviceHistoryScreen;