import { Animated } from "react-native";

// Interfaces
export interface HeaderProps {
  user: string,
  time: string,
  onRightIconPress?: () => void;
}

export interface WeatherWidgetProps {
  location: string,
  date: string
  tempHumid: ITempHumid
}

export interface HomeScreenProps {
  time: string,
  location: string,
  date: string,
  tempHumid: ITempHumid
}

export interface BottomTabBarProps {
  activeTab: number;
  onTabChange: (index: number) => void;
}

export interface WeatherData {
  date: string;
  condition: string;
  location: string;
  temperature: string;
  humidity: string;
  visibility: string;
  wind: string;
}

export interface Device {
  id: number;
  name: string;
  label: string;
  image: string;
  state: DeviceState;
  createdAt: string
}

export interface DeviceCardProps {
  device: Device;
  onToggle: (id: number, newState: DeviceState) => void;
}

export interface DeviceAllCardProps {
  devices: Device[];
  onToggle: (newState: DeviceState) => void;
}

export interface DeviceLog {
  id: number;
  deviceId: number,
  device: string;
  action: DeviceAction;
  timestamp: string;
  previousState: DeviceState;
  ipAddress: string;
}

export interface RecordingWavesProps {
  isRecording: boolean;
  baseSize: number;
  waveColor: string;
}

export interface AnimatedValues {
  wave1: Animated.Value;
  wave2: Animated.Value;
  wave3: Animated.Value;
}

// Enum Types
export enum DeviceState {
  ON = 'on',
  OFF = 'off'
}

export enum DeviceAction {
  TURN_ON = 'turn_on',
  TURN_OFF = 'turn_off'
}

// Navigation Types
export type RootStackParamList = {
  Menu: undefined;
  ProfileScreen: undefined;
  ProfileDetailScreen: undefined;
  DeviceStatusListScreen: undefined;
  DeviceHistoryScreen: undefined;
  HomeScreen: {
    time: string;
    location: string;
    date: string;
  };
}

export interface ITempHumid {
  temperature: string;
  humidity: string;
}