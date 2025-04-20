import { NavigationContainer, NavigationIndependentTree } from "@react-navigation/native";
import ProfileDetailScreen from '../screens/ProfileDetailScreen';
import DeviceListScreen from '../screens/DeviceListScreen';
import DeviceHistoryScreen from '../screens/DeviceHistoryScreen';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import MenuScreen from "../screens/MenuScreen";
import { RootStackParamList } from '../types';
import { createStackNavigator } from "@react-navigation/stack";

const Stack = createStackNavigator<RootStackParamList>();

export default function Navigation() {
  return (
    <NavigationIndependentTree>
      <Stack.Navigator initialRouteName="Menu" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Menu" component={MenuScreen} />
        <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
        <Stack.Screen name="ProfileDetailScreen" component={ProfileDetailScreen} />
        <Stack.Screen name="DeviceListScreen" component={DeviceListScreen} />
        <Stack.Screen name="DeviceHistoryScreen" component={DeviceHistoryScreen} />
        {/* <Stack.Screen name="HomeScreen" component={HomeScreen} /> */}
      </Stack.Navigator>
    </NavigationIndependentTree>
  );
}