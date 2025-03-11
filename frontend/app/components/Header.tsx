import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ImageSourcePropType } from 'react-native';
import { COLORS } from '../constants/colors';
import { HeaderProps } from '../types';

const Header: React.FC<HeaderProps> = ({ user, onRightIconPress }) => {
  return (
    <View style={styles.container}>
      <View  style={styles.greetingUser}>
        <Text style={styles.greeting}>Good Morning,</Text>
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
    paddingHorizontal: 20,
    paddingVertical: 10,
  },

  greetingUser: {
    flexDirection: 'column',
  },

  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 5,
  },

  user: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 15,
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