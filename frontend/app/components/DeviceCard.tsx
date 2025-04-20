import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { DeviceCardProps, DeviceState } from '../types';
import { COLORS, FONTSIZE } from '../constants';

const DeviceCard: React.FC<DeviceCardProps> = ({ device, onToggle }) => {
  const isActive = device.state === DeviceState.ON;

  const handleToggle = () => {
    onToggle(device.id, isActive ? DeviceState.OFF : DeviceState.ON);
  };
  
  return (
    <View style={[
      styles.container, 
      isActive ? styles.activeContainer : styles.inactiveContainer
    ]}>
      <View style={styles.subContainer}>
        <View style={[
          styles.iconContainer,
          isActive ? styles.activeIconContainer : styles.inactiveIconContainer
        ]}>
          <Image 
            source={{ uri: `${process.env.EXPO_PUBLIC_API_BASE_URL}/${device.image}` }} 
            style={styles.icon} 
            resizeMode='contain' 
          />
        </View>
        
        <TouchableOpacity 
          style={styles.toggleContainer}
          onPress={handleToggle}
          activeOpacity={0.8}
        >
          <View style={[
            styles.toggleTrack, 
            isActive ? styles.activeToggleTrack : styles.inactiveToggleTrack
          ]}>
            <View style={[
              styles.toggleThumb, 
              isActive ? styles.activeToggleThumb : styles.inactiveToggleThumb
            ]} />
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.contentContainer}>
        <Text style={[
          styles.name,
          isActive ? styles.activeName : styles.inactiveName
        ]}>
          {device.name}
        </Text>
        <Text style={[
          styles.label,
          isActive ? styles.activeLabel : styles.inactiveLabel
        ]}>
          {device.label}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 17,
    height: 150,
    marginBottom: 20,
    width: '47%', 
    borderWidth: 1,
  },

  activeContainer: {
    backgroundColor: COLORS.yellow, 
    borderColor: COLORS.yellow, 
  },

  inactiveContainer: {
    backgroundColor: COLORS.white, 
    borderColor: COLORS.lightGray,
  },

  subContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 10,    
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  activeIconContainer: {
    backgroundColor: COLORS.white,
  },

  inactiveIconContainer: {
    backgroundColor: COLORS.lightYellow,
  },

  icon: {
    width: 28,
    height: 28,
  },

  toggleContainer: {
    width: 38,
    height: 24,
    justifyContent: 'center',
  },

  toggleTrack: {
    width: 33,
    height: 18,
    borderRadius: 12,
    justifyContent: 'center',
  },

  activeToggleTrack: {
    backgroundColor: COLORS.white, 
  },

  inactiveToggleTrack: {
    backgroundColor: COLORS.lightGray,
  },

  toggleThumb: {
    width: 23,
    height: 23,
    borderRadius: 11.5,
    borderWidth: 1.5,
    position: 'absolute',
  },

  activeToggleThumb: {
    backgroundColor: COLORS.green,
    right: -3,
    borderColor: COLORS.white,
  },

  inactiveToggleThumb: {
    backgroundColor: COLORS.white,
    left: -3,
    borderColor: COLORS.lightGray,
  },

  contentContainer: {
    marginTop: 16,
  },

  name: {
    fontSize: FONTSIZE.medium,
    fontWeight: 'bold',
    marginBottom: 4,
  },

  label: {
    fontSize: FONTSIZE.tiny,
  },

  activeName: {
    color: COLORS.white,
  },

  inactiveName: {
    color: COLORS.black, 
  },

  activeLabel: {
    color: COLORS.white,
  },

  inactiveLabel: {
    color: COLORS.gray, 
  },
});

export default DeviceCard;