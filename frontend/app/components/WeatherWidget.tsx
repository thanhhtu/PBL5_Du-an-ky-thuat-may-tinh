import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { COLORS } from '../constants/colors';
import { WeatherData } from '../types';

const WeatherWidget = () => {
  // Fetch from API
  const weatherData: WeatherData = {
    date: 'May 18, 2023 10:07 am',
    condition: 'Cloudy',
    location: 'Jakarta, Indonesia',
    temperature: '19°C',
    humidity: '97%',
    visibility: '7km',
    wind: '3km/h NE Wind',
  };

  return (
    <View style={styles.container}>
      <View style={styles.mainInfo}>
        <View>
          <Text style={styles.date}>{weatherData.date}</Text>
          <Text style={styles.condition}>{weatherData.condition}</Text>
          <Text style={styles.location}>{weatherData.location}</Text>
        </View>
        <View style={styles.temperatureContainer}>
          <Text style={styles.temperature}>{weatherData.temperature}</Text>
          <View style={styles.weatherIcon}>
            {/* Replace with actual weather icon */}
            <View style={styles.iconPlaceholder}>
              <Text style={styles.iconText}>☀️</Text>
            </View>
          </View>
        </View>
      </View>
      
      <View style={styles.detailsContainer}>
        <View style={styles.detailItem}>
          <Text style={styles.detailIcon}>💧</Text>
          <Text style={styles.detailLabel}>Humidity</Text>
          <Text style={styles.detailValue}>{weatherData.humidity}</Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.detailItem}>
          <Text style={styles.detailIcon}>👁️</Text>
          <Text style={styles.detailLabel}>Visibility</Text>
          <Text style={styles.detailValue}>{weatherData.visibility}</Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.detailItem}>
          <Text style={styles.detailIcon}>💨</Text>
          <Text style={styles.detailLabel}>Wind</Text>
          <Text style={styles.detailValue}>{weatherData.wind}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  
  mainInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  date: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },

  condition: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },

  location: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },

  temperatureContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  temperature: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text,
  },

  weatherIcon: {
    marginLeft: 8,
  },

  iconPlaceholder: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  iconText: {
    fontSize: 24,
  },

  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },

  detailItem: {
    flex: 1,
    alignItems: 'center',
  },

  detailIcon: {
    fontSize: 16,
    marginBottom: 4,
  },

  detailLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },

  detailValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
  },

  divider: {
    width: 1,
    backgroundColor: COLORS.divider,
  },
});

export default WeatherWidget;