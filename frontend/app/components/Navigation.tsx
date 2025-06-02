import { NavigationContainer, NavigationIndependentTree } from '@react-navigation/native';
import DeviceStatusListScreen from '../screens/DeviceStatusListScreen';
import DeviceHistoryScreen from '../screens/DeviceHistoryScreen';
import StatisticsScreen from '../screens/StatisticsScreen';
import MenuScreen from '../screens/MenuScreen';
import { RootStackParamList } from '../types';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator<RootStackParamList>();

export default function Navigation() {
  return (
    <NavigationIndependentTree>
      <Stack.Navigator initialRouteName='Menu' screenOptions={{ headerShown: false }}>
        <Stack.Screen name='Menu' component={MenuScreen} />
        <Stack.Screen name='StatisticsScreen' component={StatisticsScreen} />
        <Stack.Screen name='DeviceStatusListScreen' component={DeviceStatusListScreen} />
        <Stack.Screen name='DeviceHistoryScreen' component={DeviceHistoryScreen} />
      </Stack.Navigator>
    </NavigationIndependentTree>
  );
}