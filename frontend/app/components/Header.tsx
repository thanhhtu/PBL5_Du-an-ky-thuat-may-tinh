import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ImageSourcePropType } from 'react-native';
import { COLORS, FONTSIZE } from '../constants';
import { HeaderProps } from '../types';
import weatherService from '../services/weather.service';

const Header: React.FC<HeaderProps> = ({ user, time, onRightIconPress }) => {
  return (
    <View style={styles.container}>
      <View  style={styles.greetingUser}>
        <Text style={styles.greeting}>Good {time},</Text>
        <Text style={styles.user}>{ user }</Text>
      </View>
      
      <TouchableOpacity style={styles.iconButton} onPress={onRightIconPress}>
        <Image source={require('../assets/icons/bell.png')} style={styles.icon} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 15,
  },

  greetingUser: {
    flexDirection: 'column',
  },

  greeting: {
    fontSize: FONTSIZE.small,
    fontWeight: 'bold',
    color: COLORS.gray,
  },

  user: {
    fontSize: FONTSIZE.huge,
    fontWeight: 'bold',
    color: COLORS.black,
  },

  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  icon: {
    width: 18,
    height: 20,
  },
});

export default Header;