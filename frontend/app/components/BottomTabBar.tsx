import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { COLORS } from '../constants/colors';

interface BottomTabBarProps {
  activeTab: number;
  onTabChange: (index: number) => void;
}

const BottomTabBar: React.FC<BottomTabBarProps> = ({ activeTab, onTabChange }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.tabButton} 
        onPress={() => onTabChange(0)}
      >
        <Image 
          source={require('../assets/icons/home.png')} 
          style={[styles.iconHome, activeTab === 0 && styles.activeIcon]} 
        />
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.micButton}
        onPress={() => {/* Handle mic press */}}
      >
        <Image 
          source={require('../assets/icons/microphone.png')} 
          style={styles.micIcon} 
        />
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.tabButton} 
        onPress={() => onTabChange(1)}
      >
        <Image 
          source={require('../assets/icons/profile.png')} 
          style={[styles.iconProfile, activeTab === 1 && styles.activeIcon]} 
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 75,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
    paddingHorizontal: 30,
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },

  iconHome: {
    width: 28.5,
    height: 25,
    opacity: 0.5,
  },

  iconProfile: {
    width: 24,
    height: 27,
    opacity: 0.5,
  },

  activeIcon: {
    opacity: 1,
  },

  micButton: {
    width: 65,
    height: 65,
    borderRadius: 30,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    marginBottom: 30,
  },

  micIcon: {
    width: 20,
    height: 30,
    tintColor: COLORS.primary,
  },
});

export default BottomTabBar;