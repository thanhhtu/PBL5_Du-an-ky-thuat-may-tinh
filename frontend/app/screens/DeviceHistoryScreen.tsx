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
  RefreshControl
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Device, DeviceLog } from '../types';
import deviceService from '../services/device.service';
import { COLORS, FONTSIZE, LIST_COLORS } from '../constants';
import { LinearGradient } from 'expo-linear-gradient';

type DeviceHistoryScreenRouteProp = RouteProp<
  { DeviceHistoryScreen: undefined },
  'DeviceHistoryScreen'
>;

const DeviceHistoryScreen = () => {
  useRoute<DeviceHistoryScreenRouteProp>();
  const navigation = useNavigation(); 

  const [devices, setDevices] = useState<Device[]>([]);
  const [deviceLogs, setDeviceLogs] = useState<DeviceLog[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('daily');

  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const [startOfWeek, setStartOfWeek] = useState<Date>(new Date());
  const [endOfWeek, setEndOfWeek] = useState<Date>(new Date());
  
  const [dailyLogs, setDailyLogs] = useState<DeviceLog[]>([]);
  const [weeklyLogs, setWeeklyLogs] = useState<DeviceLog[]>([]);

  const screenData = Dimensions.get('window');

  const fetchData = async () => {
    try {
      setLoading(true);

      const devices = await deviceService.getAllDevices();
      setDevices(devices);

      const allDeviceLogs: DeviceLog[] = await deviceService.getAllLogs();
      setDeviceLogs(allDeviceLogs);
      
      setError(null);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message || 'Network error when fetching devices');
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const setDaily = () => {
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const logs = deviceLogs.filter(log => {
      const logTime = new Date(log.timestamp);
      return logTime >= startOfDay && logTime <= endOfDay;
    });
    setDailyLogs(logs);
  };

  useEffect(() => {
    if (deviceLogs.length > 0) {
      setDaily();
    }
  }, [selectedDate, deviceLogs]);

  const setWeekly = () => {
    const currentTime = new Date();

    const endOfWeek = new Date(currentTime);
    const currentDay = currentTime.getDay(); // 0 (sunday) -> 6 (saturday)

    // getDay() === 0 (sunday) => endOfWeek is this sunday
    // getDay() === 1 (monday) => endOfWeek is next sunday (add 6 days)
    const daysSinceEndOfWeek = (currentDay === 0 ? 0 : 7 - currentDay);

    endOfWeek.setDate(currentTime.getDate() + daysSinceEndOfWeek - (weekOffset * 7));
    endOfWeek.setHours(23, 59, 59, 999);
    setEndOfWeek(endOfWeek);

    // a week is from monday to sunday
    const startOfWeek = new Date(endOfWeek);
    startOfWeek.setDate(endOfWeek.getDate() - 6);
    startOfWeek.setHours(0, 0, 0, 0);
    setStartOfWeek(startOfWeek);

    const weeklyLogs = deviceLogs.filter(log => {
      const logTime = new Date(log.timestamp);
      return logTime >= startOfWeek && logTime <= endOfWeek;
    });
    setWeeklyLogs(weeklyLogs);
  };

  useEffect(() => {
    if (deviceLogs.length > 0) {
      setWeekly();
    }
  }, [weekOffset, deviceLogs]);

  // Daily data for chart 
  const getDailyData = () => {
    const activeDeviceIdsInDay = [...new Set(dailyLogs.map(log => log.deviceId))];
    const displayDevices = devices.filter(device => activeDeviceIdsInDay.includes(device.id));
    
    let labels: string[] = [];
    let datasets: { 
      data: number[]; 
      colors: (() => string)[]; 
      strokeWidth: number 
    }[] = [];

    if (displayDevices.length === 0) {
      labels = ['No action history available'];
      datasets = [{
        data: [0],
        colors: Array(0).fill(() => COLORS.green),
        strokeWidth: 2,
      }];
    }

    labels = displayDevices.map(device => {
      const name = device.name;
      return name.length > 8 ? '..' + name.substring(5, 13) + '..' : name; 
    });

    datasets = [{
      data: displayDevices.map(device => {
              return dailyLogs.filter(log => log.deviceId === device.id).length;
            }),
      colors: displayDevices.map((_, index) => () => LIST_COLORS[index % LIST_COLORS.length]),
      strokeWidth: 2,
    }];

    const barItemEstimatedWidth = 60; 
    const calculatedBarChartWidth = Math.max(
      screenData.width - 40,
      labels.length * barItemEstimatedWidth 
    );

    return {
      labels,
      datasets: datasets,
      barChartWidth: calculatedBarChartWidth,
    };
  };

  const dailyChartData = getDailyData();

  // Weekly data for chart
  const getWeeklyData = () => {
    const today = new Date();
    const currentWeekStart = new Date(today);
    currentWeekStart.setDate(today.getDate() - today.getDay() + 1); // Monday of the current week
    currentWeekStart.setHours(0, 0, 0, 0);
    
    const selectedWeekStart = new Date(startOfWeek);
    selectedWeekStart.setHours(0, 0, 0, 0);
  
    const isCurrentWeek = selectedWeekStart.getTime() === currentWeekStart.getTime();
    
    let daysToShow;
    if (isCurrentWeek) {
      const currentDayOfWeek = today.getDay();
      daysToShow = currentDayOfWeek === 0 ? 7 : currentDayOfWeek;
    } else {
      daysToShow = 7;
    }
    
    const labels: string[] = [];
    const dateKeys: string[] = [];
    
    for (let i = 0; i < daysToShow; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);

      const label = date.toLocaleDateString('en-US', { weekday: 'short' });
      labels.push(label);

      const dateKey = date.toLocaleDateString('vi-VN');
      dateKeys.push(dateKey);
    }

    const deviceData: { [key: number]: { name: string; data: number[] } } = {};
    
    devices.forEach(device => {
      deviceData[device.id] = {
        name: device.name,
        data: new Array(daysToShow).fill(0),
      };
    });

    weeklyLogs.forEach(log => {
      const logDate = (new Date(log.timestamp)).toLocaleDateString('vi-VN'); 

      const dayIndex = dateKeys.indexOf(logDate);

      if (dayIndex !== -1 && deviceData[log.deviceId]) {
        deviceData[log.deviceId].data[dayIndex]++;
      }
    });

    const displayDevices = Object.values(deviceData)
      .filter((device) => device.data.some((val: number) => val > 0))
      .map((device, index) => ({
        data: device.data,
        color: () => LIST_COLORS[index % LIST_COLORS.length],
        strokeWidth: 2,
        withDots: true,
        dotColor: LIST_COLORS[index % LIST_COLORS.length],
      }));

    const datasets = displayDevices.length > 0 ? displayDevices : [{
      data: new Array(daysToShow).fill(0),
      color: () => COLORS.green,
      strokeWidth: 2,
    }];

    const legend = Object.values(deviceData)
      .filter((device: any) => device.data.some((val: number) => val > 0))
      .map((device: any) => device.name);

    return {
      weeklyChartData: {
        labels,
        datasets: datasets,
      },
      legend: legend.length > 0 ? legend : [],
    };
  };

  const weeklyChart = getWeeklyData();
  const weeklyChartData = weeklyChart.weeklyChartData;

  const chartConfig = {
    backgroundColor: COLORS.white,
    backgroundGradientFrom: COLORS.white,
    backgroundGradientTo: COLORS.white,
    decimalPlaces: 0,
    color: () => COLORS.lightGray,
    labelColor: () => COLORS.gray,
    
  };

  // Daily stats
  const getDailyStats = () => { 
    const deviceUsage: { [key: string]: number } = {};
    dailyLogs.forEach(log => {
      if (!deviceUsage[log.deviceId]) {
        deviceUsage[log.deviceId] = 0;
      }
      deviceUsage[log.deviceId]++;
    });
    
    const topDeviceId = Object.keys(deviceUsage).length > 0 
      ? Object.keys(deviceUsage).reduce((a, b) => deviceUsage[a] > deviceUsage[b] ? a : b)
      : null;
    
    const topDeviceName = topDeviceId ? (devices.find(d => d.id === Number(topDeviceId))?.name || 'N/A') : 'N/A';

    return {
      total: dailyLogs.length,
      topDevice: topDeviceName,
    };
  };

  const dailyStats = getDailyStats();

  // Weekly stats
  const getWeeklyStats = () => {
    return {
      total: weeklyLogs.length,
      average: weeklyLogs.length > 0 ? Math.round(weeklyLogs.length / 7) : 0,
    };
  };
  
  const weeklyStats = getWeeklyStats();

  const renderLogItem = ({ item }: { item: DeviceLog }) => {
    const device = devices.find(d => d.id === item.deviceId);
    const timestamp = new Date(item.timestamp);
    
    return (
      <View style={styles.logItem}>
        <View style={[styles.logColumn, { flex: 0.7 }]}>
          <Text style={styles.logText}>{device?.name}</Text>
        </View>
        <View style={[styles.logColumn, { flex: 0.5 }]}>
          <Text style={styles.logText}>{item.action}</Text>
        </View>
        <View style={[styles.logColumn, { flex: 0.5 }]}>
          <Text style={styles.logText}>{timestamp.toLocaleDateString('vi-VN')}</Text>
          <Text style={styles.logTime}>{timestamp.toLocaleTimeString('vi-VN')}</Text>
        </View>
        <View style={[styles.logColumn, { flex: 1 }]}>
          <Text style={styles.logText} numberOfLines={1} ellipsizeMode='tail'>{item.ipAddress.slice(7)}</Text>
        </View>
      </View>
    );
  };

  const formatDate = (date: Date) => {
    const day = String(date.getDate());
    const month = String(date.getMonth() + 1)
    return `${day}/${month}`;
  };

  const Header = () => {
    return (
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name='arrow-back' size={40} color={COLORS.darkGreen} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>History Statistic</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <LinearGradient
        colors={COLORS.yellowGradient as readonly [string, string]}
        style={styles.gradientContainer}
      >
        <SafeAreaView style={styles.container}>
          <Header/>

          <View style={[styles.container, styles.centered]}>
            <ActivityIndicator size='large' color={COLORS.yellow} />
          </View>
        </SafeAreaView>
        </LinearGradient>
    );
  }

  if (error) {
    return (
      <LinearGradient
        colors={COLORS.yellowGradient as readonly [string, string]}
        style={styles.gradientContainer}
      >
        <SafeAreaView style={styles.container}>
          <Header/>

          <View style={[styles.container, styles.centered]}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
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
       <Header/>

        <ScrollView 
          style={styles.scrollView}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.gray]} />}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.toggleContainer}>
            <TouchableOpacity 
              style={[styles.toggleButton, viewMode === 'daily' && styles.activeToggle]}
              onPress={() => setViewMode('daily')}
            >
              <Text style={[styles.toggleText, viewMode === 'daily' && styles.activeToggleText]}>Daily</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.toggleButton, viewMode === 'weekly' && styles.activeToggle]}
              onPress={() => setViewMode('weekly')}
            >
              <Text style={[styles.toggleText, viewMode === 'weekly' && styles.activeToggleText]}>Weekly</Text>
            </TouchableOpacity>
          </View>

          <View>
            {viewMode === 'daily' ? (
              <>
                <View style={styles.navigation}>
                  <TouchableOpacity 
                    style={styles.navButton}
                    onPress={() => {
                      const newDate = new Date(selectedDate);
                      newDate.setDate(newDate.getDate() - 1);
                      setSelectedDate(newDate);
                    }}
                  >
                    <Ionicons name='chevron-back' size={20} color={COLORS.yellow} />
                    <Text style={styles.navText}>Previous day</Text>
                  </TouchableOpacity>
                  <Text style={styles.calenderTitle}>{selectedDate.toLocaleDateString('vi-VN')}</Text>
                  <TouchableOpacity 
                    style={styles.navButton}
                    onPress={() => {
                      const newDate = new Date(selectedDate);
                      newDate.setDate(newDate.getDate() + 1);
                      if (newDate <= new Date()) setSelectedDate(newDate); 
                    }}
                    disabled={selectedDate.toDateString() === new Date().toDateString()}
                  >
                    <Text style={[styles.navText, selectedDate.toDateString() === new Date().toDateString() && styles.disabledText]}>Next day</Text>
                    <Ionicons name='chevron-forward' size={20} color={selectedDate.toDateString() === new Date().toDateString() ? COLORS.lightGray : COLORS.yellow}/>
                  </TouchableOpacity>
                </View>
                <View style={styles.statisticContainer}>
                  <Text style={styles.statisticTitle}>Daily usage count per device</Text>
                  {dailyChartData.datasets && dailyChartData.datasets[0].data.some(val => val > 0) ? (
                    <ScrollView 
                      horizontal 
                      showsHorizontalScrollIndicator={false}
                    >
                      <BarChart
                        data={dailyChartData}
                        width={dailyChartData.barChartWidth}
                        height={220}
                        chartConfig={chartConfig} 
                        style={styles.chart}
                        showValuesOnTopOfBars
                        fromZero
                        yAxisSuffix=''
                        yAxisLabel=''
                        withCustomBarColorFromData={true} 
                        flatColor={true}
                        withInnerLines={true} 
                      />
                    </ScrollView>
                  ) : (
                    <View style={styles.noDataContainer}><Text style={styles.noDataText}>No data for this day</Text></View>
                  )}
                </View>
              </>
            ) : (
              <>
                <View style={styles.navigation}>
                  <TouchableOpacity 
                    style={styles.navButton}
                    onPress={() => setWeekOffset(weekOffset + 1)} 
                  >
                    <Ionicons name='chevron-back' size={20} color={COLORS.yellow} />
                    <Text style={styles.navText}>Previous week</Text>
                  </TouchableOpacity>
                  <Text style={styles.calenderTitle}>
                    {formatDate(startOfWeek)} - {formatDate(endOfWeek)}
                  </Text>
                  <TouchableOpacity 
                    style={styles.navButton}
                    onPress={() => setWeekOffset(weekOffset - 1)} 
                    disabled={weekOffset <= 0}
                  >
                    <Text style={[styles.navText, weekOffset <= 0 && styles.disabledText]}>Next week</Text>
                    <Ionicons name='chevron-forward' size={20} color={weekOffset <= 0 ? COLORS.lightGray : COLORS.yellow} />
                  </TouchableOpacity>
                </View>
                <View style={styles.statisticContainer}>
                  <Text style={styles.statisticTitle}>Weekly usage count per device</Text>
                  {weeklyChartData.datasets && weeklyChartData.datasets[0].data.some(val => val > 0) ? (
                    <ScrollView 
                      horizontal 
                      showsHorizontalScrollIndicator={false}
                    >
                      <LineChart
                        data={weeklyChartData}
                        width={Math.max(screenData.width - 40, (weeklyChartData.labels.length || 0) * 60)}
                        height={220}
                        chartConfig={chartConfig}
                        bezier
                        fromZero
                        style={styles.chart}
                        yAxisSuffix=''
                        yAxisLabel=''
                        withHorizontalLabels={true}
                      />
                    </ScrollView>
                  ) : (
                    <View style={styles.noDataContainer}><Text style={styles.noDataText}>No data for this week</Text></View>
                  )}

                  <View style={styles.chartLegend}>
                    {weeklyChart.legend.map((label, index) => (
                      <View
                        key={index}
                        style={styles.legendItem}
                      >
                        <View
                          style={{
                            width: 12,
                            height: 12,
                            backgroundColor: LIST_COLORS[index % LIST_COLORS.length],
                            marginRight: 6,
                            borderRadius: 6,
                          }}
                        />
                        <Text style={{ fontSize: 12 }}>{label}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </>
            )}
          </View>

          <View style={styles.statisticContainer}>
            {viewMode === 'daily' ? (
              <View>
                <Text style={styles.statisticTitle}>Selected Day Overview</Text>
                <View style={styles.summaryRow}>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryNumber}>{dailyStats.total}</Text>
                    <Text style={styles.summaryLabel}>Total Activities</Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryNumber}>{dailyStats.topDevice}</Text>
                    <Text style={styles.summaryLabel}>Top Usage Device</Text>
                  </View>
                </View>
              </View>
            ) : (
              <View>
                <Text style={styles.statisticTitle}>Selected Week Overview</Text>
                <View style={styles.summaryRow}>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryNumber}>{weeklyStats.total}</Text>
                    <Text style={styles.summaryLabel}>Total Activities</Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryNumber}>{weeklyStats.average}</Text>
                    <Text style={styles.summaryLabel}>Average Each Week</Text>
                  </View>
                </View>
              </View>
            )}
          </View>

          <View style={styles.statisticContainer}>
            {viewMode === 'daily' ? (
              <Text style={styles.statisticTitle}>Daily Activities</Text>
            ) : (
              <Text style={styles.statisticTitle}>Weekly Activities</Text>
            )}
            <View style={styles.logHeader}>
              <View style={[styles.logColumn, { flex: 0.7 }]}>
                <Text style={styles.logHeaderText}>Device</Text>
              </View>
              <View style={[styles.logColumn, { flex: 0.5 }]}>
                <Text style={styles.logHeaderText}>Action</Text>
              </View>
              <View style={[styles.logColumn, { flex: 0.6 }]}>
                <Text style={styles.logHeaderText}>Timestamp</Text>
              </View>
              <View style={[styles.logColumn, { flex: 1 }]}>
                <Text style={styles.logHeaderText}>IP</Text>
              </View>
            </View>
             
            <ScrollView style={styles.logList} 
              nestedScrollEnabled={true}
              showsVerticalScrollIndicator={false}
            >
              {viewMode === 'daily' ? (
                dailyLogs.map((item) => (
                  <View key={item.id.toString()}>
                  {renderLogItem({ item })}
                </View>
              )))
            : (
              weeklyLogs.map((item) => (
                  <View key={item.id.toString()}>
                  {renderLogItem({ item })}
                </View>
            )))}
            </ScrollView>
          </View>
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

  scrollView: { 
    flex: 1, 
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

  headerTitle: { 
    fontSize: FONTSIZE.huge,
    color: COLORS.yellow,
    fontWeight: 'bold',
  },

  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 200,
    marginBottom: 100,
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

  toggleContainer: {
    flexDirection: 'row',
    marginTop: 15,
    backgroundColor: COLORS.softGray, 
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
    backgroundColor: COLORS.green, 
    shadowColor: COLORS.darkGray, 
    shadowOffset: { 
      width: 0, 
      height: 2 
    },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },

  toggleText: {
    fontSize: FONTSIZE.small,
    fontWeight: '500', 
    color: COLORS.gray, 
  },

  activeToggleText: {
    color: COLORS.white,
  },

  statisticContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginTop: 15,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },

  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 10,
    marginTop: 15,
    backgroundColor: COLORS.white,
    borderRadius: 12,
  },

  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10, 
    borderRadius: 6, 
  },

  navText: {
    fontSize: FONTSIZE.tiny,
    color: COLORS.yellow,
    fontWeight: '500',
    marginHorizontal: 3,
  },

  disabledText: {
    color: COLORS.lightGray, 
  },

  calenderTitle: {
    fontSize: FONTSIZE.small,
    fontWeight: '600',
    color: COLORS.black,
    textAlign: 'center',
    flex: 1, 
  },

  statisticTitle: {
    fontSize: FONTSIZE.medium,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 12,
    textAlign: 'center',
    paddingHorizontal: 0, 
  },

  chart: {
    borderRadius: 10,
    marginHorizontal: -15, 
  },

  chartLegend: {
    paddingLeft: 25,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 10,
  },

  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
    display: 'flex',
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
    fontSize: FONTSIZE.medium, 
    fontWeight: 'bold',
    color: COLORS.green,
    marginBottom: 3,
  },

  summaryLabel: {
    fontSize: 12,
    color: '#555',
    textAlign: 'center',
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
    paddingHorizontal: 2, 
    justifyContent: 'center',
    alignItems: 'center', 
  },

  logHeaderText: {
    fontSize: FONTSIZE.micro, 
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
  
  logText: { 
    fontSize: FONTSIZE.micro, 
    color: COLORS.darkGray, 
    textAlign: 'center' 
  },

  logTime: { 
    fontSize: 9, 
    color: '#888', 
    textAlign: 'center', 
    marginTop: 2 
  },
});


export default DeviceHistoryScreen;