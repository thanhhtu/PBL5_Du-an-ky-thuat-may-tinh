import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import WeatherWidget from '../components/WeatherWidget';
import DeviceSection from '../components/DeviceSection';
import Header from '../components/Header';
import { COLORS } from '../constants';
import { HomeScreenProps } from '../types';

const HomeScreen: React.FC<HomeScreenProps> = ({ time, location, date, tempHumid }) => {
  return (
    <LinearGradient 
      colors={COLORS.yellowGradient}
      style={styles.gradientContainer}
    >
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView}>
          <Header 
            user='Smart Home'
            time={time}
          />
          <WeatherWidget 
            location={location}
            date={date}
            tempHumid={tempHumid}
          />
          <DeviceSection />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },

  container: {
    flex: 1,
  },

  scrollView: {
    flex: 1,
    padding: 16,
  },
});

export default HomeScreen;