import { DeviceAction, DeviceState } from "./device.enum";

export interface IDevice {
  id: number,
  name: string,
  label: string,
  image: string,
  state: DeviceState,
  createdAt: Date,
}

export interface IDeviceLog {
  id: number,
  device: string,
  action: DeviceAction,
  timestamp: Date,
  previousState: DeviceState,
  ipAddress?: string,
}