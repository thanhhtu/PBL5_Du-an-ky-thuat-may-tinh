import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { RootStackParamList } from '../types'; // Import the centralized type

const deviceActivities = [
  {
    room: 'Bedroom',
    description: 'Aircondition working to last 5 hour in bedroom.',
    icon: 'bed-outline',
    time: 'Yesterday',
    screen: 'ProfileDetailScreen'
  },
  {
    room: 'Kids room',
    description: 'Music system working to last 5 hour in kids room.',
    icon: 'musical-notes-outline',
    time: 'Yesterday',
    screen: 'DeviceListScreen'
  },
  {
    room: 'Kitchen',
    description: 'Hey, did you forget turn off the smart lamp?',
    icon: 'restaurant-outline',
    time: 'Yesterday',
    screen: 'DeviceHistoryScreen'
  }
];

// type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ProfileScreen'>;

const ProfileScreen = () => {
  // Define navigation with a more specific type
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  // Helper function to handle navigation with proper type checking
  const navigateToScreen = (screenName: string) => {
    switch (screenName) {
      case 'ProfileDetailScreen':
        navigation.navigate('ProfileDetailScreen');
        break;
      case 'DeviceListScreen':
        navigation.navigate('DeviceListScreen');
        break;
      case 'DeviceHistoryScreen':
        navigation.navigate('DeviceHistoryScreen');
        break;
      default:
        // Handle any other cases
        console.log('Unknown screen:', screenName);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Profile header */}
      <View style={styles.profileHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.profileTitle}>Profile</Text>
        <TouchableOpacity onPress={() => {}}>
          <Icon name="create-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* Device activities */}
      <ScrollView style={styles.activitiesContainer}>
        {deviceActivities.map((activity, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.activityItem}
            onPress={() => navigateToScreen(activity.screen)}
          >
            <View style={styles.activityIconContainer}>
              <Icon name={activity.icon} size={24} color="#666" />
            </View>
            <View style={styles.activityTextContainer}>
              <Text style={styles.activityRoom}>{activity.room}</Text>
              <Text style={styles.activityDescription}>
                {activity.description}
              </Text>
              <Text style={styles.activityTime}>{activity.time}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F2F5'
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white'
  },
  profileTitle: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  activitiesContainer: {
    marginTop: 10
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    marginVertical: 5,
    marginHorizontal: 10,
    borderRadius: 10
  },
  activityIconContainer: {
    marginRight: 15
  },
  activityTextContainer: {
    flex: 1
  },
  activityRoom: {
    fontWeight: 'bold',
    fontSize: 16
  },
  activityDescription: {
    color: '#666',
    marginTop: 5
  },
  activityTime: {
    color: '#999',
    marginTop: 5,
    fontSize: 12
  }
});

export default ProfileScreen;