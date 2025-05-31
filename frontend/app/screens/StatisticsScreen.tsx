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
import { RootStackParamList } from '../types';
import { COLORS, FONTSIZE } from '../constants';

const statistics = [
  {
    title: 'Operational Status',
    description: 'View the current working state of all smart devices.',
    icon: 'time-outline',
    screen: 'DeviceStatusListScreen'
  },
  {
    title: 'History Statistics',
    description: 'Check detailed records and summaries of past device activities.',
    icon: 'pulse-outline',
    screen: 'DeviceHistoryScreen'
  }
];

const StatisticsScreen = () => {
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
        console.log('Unknown screen:', screenName);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.activitiesContainer}>
        {statistics.map((activity, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.activityItem}
            onPress={() => navigateToScreen(activity.screen)}
          >
            <View style={styles.activityIconContainer}>
              <Ionicons name={activity.icon as any} size={30} color={COLORS.gray} />
            </View>
            <View style={styles.activityTextContainer}>
              <Text style={styles.title}>{activity.title}</Text>
              <Text style={styles.description}>
                {activity.description}
              </Text>
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

  activitiesContainer: {
    marginTop: 10,
  },

  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: 20,
    paddingHorizontal: 15,
    marginVertical: 8,
    marginHorizontal: 10,
    
    borderRadius: 16,
    shadowColor: COLORS.gray,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 10,
  },

  activityIconContainer: {
    marginRight: 15
  },

  activityTextContainer: {
    flex: 1
  },

  title: {
    fontWeight: 'bold',
    fontSize: FONTSIZE.large
  },

  description: {
    color: COLORS.gray,
    marginTop: 5
  },
});

export default StatisticsScreen;