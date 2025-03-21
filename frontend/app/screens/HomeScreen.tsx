import React, { useState } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import WeatherWidget from '../components/WeatherWidget';
import DeviceSection from '../components/DeviceSection';
import BottomTabBar from '../components/BottomTabBar';
import Header from '../components/Header';
import { COLORS } from '../constants/colors';

const HomeScreen = () => {
  return (
    <LinearGradient 
      colors={COLORS.yellowGradient}
      style={styles.gradientContainer}
    >
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView}>
          <Header 
            user='Smart Home'
          />
          <WeatherWidget />
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