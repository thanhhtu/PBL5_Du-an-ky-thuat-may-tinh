import { ImageSourcePropType } from 'react-native';

export interface HeaderProps {
  user: string,
  onRightIconPress?: () => void;
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

export enum DeviceState {
  ON = 'on',
  OFF = 'off'
}

export enum DeviceAction {
  TURN_ON = 'turn_on',
  TURN_OFF = 'turn_off'
}

export interface Device {
  id: number;
  name: string;
  label: string;
  image: string;
  state: DeviceState;
  createdAt: string,
}

export interface DeviceCardProps {
  device: Device;
  onToggle: (id: number, newState: DeviceState) => void;
}

export interface DeviceLog {
  id: number;
  device: string;
  action: DeviceAction;
  timestamp: string;
  previousState: DeviceState;
  ipAddress: string;
}