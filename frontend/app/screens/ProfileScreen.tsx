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
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../types'; // Import the centralized type
import { COLORS } from '../constants';

const deviceActivities = [
  {
    title: 'Operational Status',
    description: 'Music system working to last 5 hour in kids room.',
    icon: 'musical-notes-outline',
    screen: 'DeviceStatusListScreen'
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
      case 'DeviceStatusListScreen':
        navigation.navigate('DeviceStatusListScreen');
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
      {/* Device activities */}
      <ScrollView style={styles.activitiesContainer}>
        {deviceActivities.map((activity, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.activityItem}
            onPress={() => navigateToScreen(activity.screen)}
          >
            <View style={styles.activityIconContainer}>
              <Ionicons name="close-circle" size={20} color="#888" />
            </View>
            <View style={styles.activityTextContainer}>
              <Text style={styles.activityRoom}>{activity.title}</Text>
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
    marginTop: 20,
    marginBottom: 24,
    paddingHorizontal: 15,
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
    marginTop: 10,
  },

  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    marginVertical: 5,
    marginHorizontal: 10,
    
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
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