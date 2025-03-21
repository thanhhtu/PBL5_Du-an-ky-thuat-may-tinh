import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { COLORS } from '../constants/colors';
import Header from '../components/Header';

const ProfileScreen = () => {
  return (
    <ScrollView style={styles.scrollView}>
      <Header user='Profile' />
      <View style={styles.profileContainer}>
        <Image 
          source={require('../assets/icons/profile.png')} 
          style={styles.profileImage}
        />
        <Text style={styles.userName}>User Name</Text>
        <Text style={styles.userEmail}>user@example.com</Text>
        
        {/* Thêm các thông tin profile khác ở đây */}
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Account Settings</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Notification Preferences</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Connected Devices</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Help & Support</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>About</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    padding: 16,
  },
  profileContainer: {
    alignItems: 'center',
    padding: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 20,
  },
  infoItem: {
    width: '100%',
    padding: 15,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  infoLabel: {
    fontSize: 16,
    color: COLORS.text,
  }
});

export default ProfileScreen;