import React, { useEffect, useState, useRef, useCallback, memo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { COLORS, FONTSIZE, HUMIDITY_LEVELS, TEMPERATURE_LEVELS } from '../constants';
import { WeatherWidgetProps } from '../types';
import weatherService from '../services/weather.service';

const WeatherWidget: React.FC<WeatherWidgetProps> = memo(({ location, date, tempHumid }) => {
  const [temperature, setTemperature] = useState<string>('');
  const [humidity, setHumidity] = useState<string>('');
  const [tempLevel, setTempLevel] = useState<string>('');
  const [humidLevel, setHumidLevel] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const isSetupRef = useRef(false);

  const checkTempLevel = useCallback((temp: number) => {
    for(let level of TEMPERATURE_LEVELS){
      if(temp <= level.value){
        return level.label;
      }
    }
    return 'Unknown';
  }, []);

  const checkHumidLevel = useCallback((humid: number) => {
    for(let level of HUMIDITY_LEVELS){
      if(humid <= level.value){
        return level.label;
      }
    }
    return 'Unknown';
  }, []);

  const updateTempHumidData = useCallback((newTempHumid: any) => {
    if (newTempHumid.temperature && newTempHumid.humidity) {
      setTemperature(newTempHumid.temperature);
      setHumidity(newTempHumid.humidity);
      setTempLevel(checkTempLevel(Number(newTempHumid.temperature)));
      setHumidLevel(checkHumidLevel(Number(newTempHumid.humidity)));
      setLoading(false);
      setError(null);
    }
  }, [checkTempLevel, checkHumidLevel]);

  const fetchTempHumid = useCallback(async() => {
    try{
      setLoading(true);
      setError(null);
      
      if (tempHumid.temperature && tempHumid.humidity && tempHumid.temperature !== 'None') {
        updateTempHumidData(tempHumid);
      } else {
        const data = await weatherService.getTempHumid();
        const tempData = {
          temperature: data.temperature || 'N/A',
          humidity: data.humidity || 'N/A'
        };
        updateTempHumidData(tempData);
      }
      
      setLoading(false);
    }catch(error){
      if (error instanceof Error) {
        setError(error.message || 'Network error when fetching devices');
      } else {
        setError('An unknown error occurred');
      }
      setLoading(false);
    }
  }, [tempHumid.temperature, tempHumid.humidity, updateTempHumidData]);

  // Setup socket listener chỉ MỘT LẦN khi component mount
  useEffect(() => {
    if (!isSetupRef.current) {
      console.log('WeatherWidget: Setting up socket listener once...');
      
      unsubscribeRef.current = weatherService.onTempHumidChange((newTempHumid) => {
        console.log('WeatherWidget received socket update:', newTempHumid);
        updateTempHumidData(newTempHumid);
      });

      fetchTempHumid();
      isSetupRef.current = true;
    }

    // Cleanup chỉ khi component thực sự unmount
    return () => {
      if (unsubscribeRef.current && !isSetupRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, []); // Empty dependencies - chỉ chạy khi mount/unmount

  // Update từ props (không setup lại socket)
  useEffect(() => {
    if (tempHumid.temperature && tempHumid.humidity && tempHumid.temperature !== 'None') {
      updateTempHumidData(tempHumid);
    }
  }, [tempHumid.temperature, tempHumid.humidity, updateTempHumidData]);

  // Final cleanup khi component unmount
  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        console.log('WeatherWidget: Final cleanup...');
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
        <TouchableOpacity style={styles.retryButton} onPress={fetchTempHumid}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>In </Text>
          <Text style={styles.titleHighlight}>{location}</Text>
        </View>
        <Text style={styles.date}>{date}</Text>
      </View>
      
      <View style={styles.divider} />
      
      <View style={styles.content}>
        <View style={styles.leftSection}>
          <Text style={[styles.label, styles.temperatureLabel]}>Temperature</Text>
          <View style={styles.temperatureContainer}>
            <Text style={styles.value}>{temperature}</Text>
            {(temperature !== 'None' && temperature !== 'N/A') && <Text style={[styles.value, styles.degree]}>°</Text>}
          </View>
          <Text style={[styles.level, styles.temperatureLevel]}>{tempLevel}</Text>
        </View>
        
        <View style={styles.rightSection}>
          <Text style={[styles.label, styles.humidityLabel]}>Humidity</Text>
          <Text style={[styles.value, styles.humidityValue]}>
            {humidity}{(humidity !== 'N/A' && humidity !== 'None') && '%'}
          </Text>
          <Text style={[styles.level, styles.humidityLevel]}>{humidLevel}</Text>
        </View>
      </View>
    </View>
  );
}, (prevProps, nextProps) => {
  // Strict comparison để tránh re-render không cần thiết
  return (
    prevProps.location === nextProps.location &&
    prevProps.date === nextProps.date &&
    prevProps.tempHumid.temperature === nextProps.tempHumid.temperature &&
    prevProps.tempHumid.humidity === nextProps.tempHumid.humidity
  );
});


const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 20,
    margin: 15,
    shadowColor: COLORS.gray,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 10,
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
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  title: {
    fontSize: FONTSIZE.huge,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  
  titleHighlight: {
    fontSize: FONTSIZE.huge,
    fontWeight: 'bold',
    color: COLORS.yellow,
  },
  
  date: {
    fontSize: FONTSIZE.small,
    color: COLORS.gray,
  },
  
  divider: {
    height: 1,
    backgroundColor: COLORS.lightGray,
    marginVertical: 15,
  },
  
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  leftSection: {
    // flex: 1,
    width: '50%',
  },

  rightSection: {
    flex: 1,
    backgroundColor: COLORS.green,
    borderRadius: 24,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  label: {
    fontSize: FONTSIZE.medium,
  },

  temperatureLabel: {
    color: COLORS.gray,
  },

  humidityLabel: {
    color: COLORS.white,
  },

  value: {
    fontSize: FONTSIZE.xLarge,
    fontWeight: 'bold',
  },
  
  temperatureContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  
  degree: {
    color: COLORS.black,
    lineHeight: 50,
  },

  humidityValue: {
    color: COLORS.white,
  },

  level: {
    fontSize: FONTSIZE.medium,
    marginTop: 5,
  },
  
  temperatureLevel: {
    color: COLORS.yellow, 
  },
  
  humidityLevel: {
    color: COLORS.white,
  },
});

export default WeatherWidget;