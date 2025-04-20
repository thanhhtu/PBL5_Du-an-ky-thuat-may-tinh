import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import BottomTabBar from '../components/BottomTabBar';
import { COLORS } from '../constants';
import HomeScreen from './HomeScreen';
import ProfileScreen from './ProfileScreen';
import weatherService from '../services/weather.service';

const MenuScreen = () => {
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
    
  useEffect(() => {
    const unsubscribe = weatherService.onTimeOfDateChange((time) => {
      setTime(time);
    });

    const unsubscribeLocationChange = weatherService.onLocationChange((loc) => {
      setLocation(loc);
    });

    const unsubscribeDateChange = weatherService.onDateChange((date) => {
      setDate(date);
    });

    // Cleanup
    return () => {
      unsubscribe();
      unsubscribeLocationChange();
      unsubscribeDateChange();
    };
  }, []);

  const [bottomTabIndex, setBottomTabIndex] = useState<number>(0);

  const renderScreen = () => {
    switch(bottomTabIndex) {
      case 0:
        return (
          <HomeScreen 
            time={time}
            location={location}
            date={date}
          />);
      case 1:
        return <ProfileScreen />;
      default:
        return (
          <HomeScreen 
            time={time}
            location={location}
            date={date}
          />);
    }
  };

  return (
    <LinearGradient 
      colors={COLORS.yellowGradient as readonly [string, string]}
      style={styles.gradientContainer}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.screenContainer}>
          {renderScreen()}
        </View>
        <BottomTabBar 
          activeTab={bottomTabIndex}
          onTabChange={setBottomTabIndex}
        />
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
  screenContainer: {
    flex: 1,
  }
});

export default MenuScreen;