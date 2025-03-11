import React, { useState } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import WeatherWidget from '../components/WeatherWidget';
import DeviceSection from '../components/DeviceSection';
import BottomTabBar from '../components/BottomTabBar';
import { COLORS } from '../constants/colors';
import Header from '../components/Header';

const HomeScreen = () => {
  const [bottomTabIndex, setBottomTabIndex] = useState<number>(0);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Header 
          user="Smart Home"
        />
        <WeatherWidget />
        <DeviceSection />
      </ScrollView>
      <BottomTabBar 
        activeTab={bottomTabIndex}
        onTabChange={setBottomTabIndex}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scrollView: {
    flex: 1,
    padding: 16,
  },

  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  }
});

export default HomeScreen;