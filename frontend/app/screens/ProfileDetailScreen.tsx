import React from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { RootStackParamList } from '../types';

type ProfileDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ProfileDetailScreen'>;

const ProfileDetailScreen = () => {
  const navigation = useNavigation<ProfileDetailScreenNavigationProp>();
  const profileData = {
    name: 'Anni',
    email: 'anni@gmail.com',
    registrationDate: 'Dec 202X',
    profileImage: 'https://via.placeholder.com/100/FF6B6B/ffffff?text=A'
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile Details</Text>
      </View>

      <View style={styles.profileContainer}>
        <View style={styles.profileImageContainer}>
          <Image 
            source={{ uri: profileData.profileImage }} 
            style={styles.profileImage} 
          />
        </View>
        <Text style={styles.profileName}>{profileData.name}</Text>
        <Text style={styles.profileEmail}>{profileData.email}</Text>
        <Text style={styles.registrationText}>
          Registered since {profileData.registrationDate}
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F2F5'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white'
  },
  headerTitle: {
    marginLeft: 15,
    fontSize: 18,
    fontWeight: 'bold'
  },
  profileContainer: {
    alignItems: 'center',
    padding: 20
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10
  },
  profileEmail: {
    color: '#666',
    marginTop: 5
  },
  registrationText: {
    color: '#999',
    marginTop: 5
  }
});

export default ProfileDetailScreen;