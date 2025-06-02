import axios, { AxiosInstance, AxiosError } from 'axios';
import { io, Socket } from 'socket.io-client';
import { Device, DeviceLog, DeviceState } from '@/app/types';

class DeviceService {
  api: AxiosInstance;
  socket: Socket | null = null;
  private deviceStateChangeCallbacks: ((device: Device) => void)[] = [];
  private isConnected: boolean = false;
  private isInitialized: boolean = false;

  constructor() {
    this.api = axios.create({
      baseURL: process.env.EXPO_PUBLIC_API_BASE_URL,
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    // Initialize socket immediately and only once
    if (!this.isInitialized) {
      this.initializeSocket();
      this.isInitialized = true;
    }
  }

  private initializeSocket(): void {
    if (this.socket && this.isConnected) {
      console.log('DeviceService socket already connected, skipping initialization');
      return;
    }

    console.log('Initializing DeviceService socket connection...');

    this.socket = io(process.env.EXPO_PUBLIC_API_BASE_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.setupSocketListeners();
  }

  private setupSocketListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('DeviceService socket connected:', this.socket?.id);
      this.isConnected = true;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('DeviceService socket disconnected:', reason);
      this.isConnected = false;
    });

    // this.socket.on('connect_error', (error) => {
    //   console.error('DeviceService socket connection error:', error);
    //   this.isConnected = false;
    // });

    this.socket.on('device_state_changed', (updatedDevice: Device) => {
      console.log('Device state changed received:', updatedDevice);
      this.executeCallbacks(this.deviceStateChangeCallbacks, updatedDevice);
    });
  }

  private executeCallbacks<T>(callbacks: ((data: T) => void)[], data: T): void {
    callbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error executing callback:', error);
      }
    });
  }

  private addCallback<T>(
    callbacks: ((data: T) => void)[], 
    callback: (data: T) => void
  ): () => void {
    if (!callbacks.includes(callback)) {
      callbacks.push(callback);
    }

    return () => {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    };
  }

  async getAllDevices(): Promise<Device[]> {
    try {
      const response = await this.api.get('/devices');
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch devices');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error fetching all devices:', error);
      throw error;
    }
  }

  async getDeviceById(id: number): Promise<Device> {
    try {
      const response = await this.api.get(`/devices/${id}`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch device');
      }

      return response.data.data;
    } catch (error) {
      console.error(`Error fetching device ${id}:`, error);
      throw error;
    }
  }

  async getAllLogs(): Promise<DeviceLog[]> {
    try {
      const response = await this.api.get(`/devices/all/logs`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch all logs');
      }

      return response.data.data;
    } catch (error) {
      console.error(`Error fetching all logs:`, error);
      throw error;
    }
  }

  async getLogsByDeviceId(id: number): Promise<DeviceLog[]> {
    try {
      const response = await this.api.get(`/devices/${id}/logs`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch device logs');
      }

      return response.data.data;
    } catch (error) {
      console.error(`Error fetching logs for device ${id}:`, error);
      throw error;
    }
  }

  async updateDeviceState(id: number, state: DeviceState): Promise<DeviceLog[]> {
    try {
      const response = await this.api.patch(`/devices/${id}/state`, { state });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update device state');
      }

      return response.data.data;
    } catch (error) {
      console.error(`Error updating state for device ${id}:`, error);
      throw error;
    }
  }

  async updateAllDeviceState(state: DeviceState): Promise<DeviceLog[]> {
    try {
      const response = await this.api.patch('/devices/all/state', { state });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update all devices state');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error updating all devices state:', error);
      throw error;
    }
  }

  getUriImage(image: string): string {
    if (!image) return '';
    
    // Handle case where image already includes base URL
    if (image.startsWith('http')) {
      return image;
    }
    
    return `${process.env.EXPO_PUBLIC_API_BASE_URL}/${image}`;
  }

  onDeviceStateChange(callback: (device: Device) => void): () => void {
    return this.addCallback(this.deviceStateChangeCallbacks, callback);
  }

  getSocketStatus(): boolean {
    return this.isConnected;
  }

  reconnectSocket(): void {
    if (!this.isConnected && this.socket) {
      console.log('Attempting to reconnect DeviceService socket...');
      this.socket.connect();
    }
  }

  disconnectSocket(): void {
    if (this.socket) {
      console.log('Disconnecting DeviceService socket...');
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.isInitialized = false;
    }
    
    this.deviceStateChangeCallbacks = [];
  }

  // Cleanup method for when service is no longer needed
  destroy(): void {
    console.log('Destroying DeviceService...');
    this.disconnectSocket();
  }
}

export default new DeviceService();