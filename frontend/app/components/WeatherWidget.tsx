import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTSIZE } from '../constants/colors';
import weatherService from '../services/weather.service';

const WeatherWidget = () => {
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    const unsubscribeLocationChange = weatherService.onLocationChange((loc) => {
      setLocation(loc);
    });

    const unsubscribeDateChange = weatherService.onDateChange((date) => {
      setDate(date);
    });

    // Cleanup
    return () => {
      unsubscribeLocationChange();
      unsubscribeDateChange();
    };
  }, []);

  // mock date
  const data = {
    temperature: '20',
    temperatureLevel: 'Medium',

    humidity: '65%',
    humidityLevel: 'Normal'
  };

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
            <Text style={styles.value}>{data.temperature}</Text>
            <Text style={[styles.value, styles.degree]}>°</Text>
          </View>
          <Text style={[styles.level, styles.temperatureLevel]}>{data.temperatureLevel}</Text>
        </View>
        
        <View style={styles.rightSection}>
          <Text style={[styles.label, styles.humidityLabel]}>Humidity</Text>
          <Text style={[styles.value, styles.humidityValue]}>{data.humidity}</Text>
          <Text style={[styles.level, styles.humidityLevel]}>{data.humidityLevel}</Text>
        </View>
      </View>
    </View>
  );
};

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