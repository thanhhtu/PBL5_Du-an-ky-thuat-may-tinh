import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Device, DeviceAllCardProps, DeviceState } from '../types';
import { COLORS, FONTSIZE } from '../constants';

const DeviceAllCard: React.FC<DeviceAllCardProps> = ({ devices, onToggle }) => {
  const [isActive, setIsActive] = useState(false);
  
  useEffect(() => {
    const allOn = devices.every((device: Device) => device.state === DeviceState.ON);
    const atLeastOneOn = devices.some((device: Device) => device.state === DeviceState.ON);

    if(allOn){
      setIsActive(true);
    }else if(atLeastOneOn){
      setIsActive(false);
    }else{
      setIsActive(false);
    }
  }, [devices]); 

  const handleToggle = () => {
    onToggle(isActive ? DeviceState.OFF : DeviceState.ON);
  };

  return (
    <View style={[
      styles.container, 
      isActive ? styles.activeContainer : styles.inactiveContainer
    ]}>
      <Text style={[
        styles.name,
        isActive ? styles.activeName : styles.inactiveName
      ]}>
        All Devices
      </Text>
      
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
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 17,
    height: 80,
    marginBottom: 20,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  activeContainer: {
    backgroundColor: COLORS.yellow, 
    borderColor: COLORS.yellow, 
  },

  inactiveContainer: {
    backgroundColor: COLORS.white, 
    borderColor: COLORS.lightGray,
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

  name: {
    fontSize: FONTSIZE.medium,
    fontWeight: 'bold',
    marginBottom: 4,
  },

  activeName: {
    color: COLORS.white,
  },

  inactiveName: {
    color: COLORS.black, 
  },
});

export default DeviceAllCard;