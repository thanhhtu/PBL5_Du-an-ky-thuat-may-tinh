import axios, { AxiosInstance } from 'axios';
import { io, Socket } from 'socket.io-client';
import { Device, DeviceLog, DeviceState } from '@/app/types';

class DeviceService{
  api: AxiosInstance;
  socket: Socket;
  private deviceStateChangeCallbacks: ((device: Device) => void)[] = [];

  constructor(){
    this.api = axios.create({
      baseURL: process.env.EXPO_PUBLIC_API_BASE_URL,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    this.socket = io(process.env.EXPO_PUBLIC_API_BASE_URL);

    this.socket.on('device_state_changed', (updatedDevice: Device) => {
      console.log('Client connected socket - state: ', this.socket.id);
      this.deviceStateChangeCallbacks.forEach(callback => callback(updatedDevice));
    });
  }

  async getAllDevices(): Promise<Device[]>{
    try{
      const res = await this.api.get('/devices');

      if(!res.data.success){
        throw new Error('Failed to fetch data');
      }

      return res.data.data;
    }catch(error){
      throw error;
    }
  }

  async getDeviceById(id: number): Promise<Device[]>{
    try{
      const res = await this.api.get(`/devices/${id}`);
      if(!res.data.success){
        throw new Error('Failed to fetch data');
      }

      return res.data.data;
    }catch(error){
      throw error;
    }
  }

  async getDeviceLogs(id: number): Promise<DeviceLog[]>{
    try{
      const res = await this.api.get(`/devices/${id}/logs`);
      if(!res.data.success){
        throw new Error('Failed to fetch data');
      }

      return res.data.data;
    }catch(error){
      throw error;
    }
  }

  async updateDeviceState(id: number, state: DeviceState): Promise<DeviceLog[]>{
    try{
      const res = await this.api.patch(`/devices/${id}/state`, { state });
      if(!res.data.success){
        throw new Error('Failed to fetch data');
      }

      return res.data.data;
    }catch(error){
      throw error;
    }
  }

  async updateAllDeviceState(state: DeviceState): Promise<DeviceLog[]>{
    try{
      const res = await this.api.patch(`/devices/all/state`, { state });
      if(!res.data.success){
        throw new Error('Failed to fetch data');
      }

      return res.data.data;
    }catch(error){
      throw error;
    }
  }

  getUriImage(image: string): string{
    return `${process.env.EXPO_PUBLIC_API_BASE_URL}/${image}`;
  }

  onDeviceStateChange(callback: (device: Device) => void): () => void {
    this.deviceStateChangeCallbacks.push(callback);
    
    return () => {
      this.deviceStateChangeCallbacks = this.deviceStateChangeCallbacks.filter(cb => cb !== callback);
    };
  }

  disconnectSocket() {
    console.log('Client disconnected');
    this.socket.off('device_state_changed');
    this.deviceStateChangeCallbacks = [];
  }
}

export default new DeviceService();