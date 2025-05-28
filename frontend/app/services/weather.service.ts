import axios, { AxiosInstance } from 'axios';
import { io, Socket } from 'socket.io-client';
import { ITempHumid } from '../types';

class WeatherService{
  api: AxiosInstance;
  socket: Socket | null = null;
  locationChangeCallbacks: ((loc: string) => void)[] = [];
  dateChangeCallbacks: ((date: string) => void)[] = [];
  timeOfDateChangeCallbacks: ((time: string) => void)[] = [];
  tempHumidChangeCallbacks: ((tempHumid: ITempHumid) => void)[] = [];
  private isConnected = false;
  private isInitialized = false;

  constructor(){
    this.api = axios.create({
      baseURL: process.env.EXPO_PUBLIC_API_BASE_URL,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Initialize socket immediately and only once
    if (!this.isInitialized) {
      this.initializeSocket();
      this.isInitialized = true;
    }
  }

  private initializeSocket() {
    if (this.socket && this.isConnected) {
      console.log('Socket already connected, skipping initialization');
      return;
    }

    console.log('Initializing WeatherService socket connection...');

    this.socket = io(process.env.EXPO_PUBLIC_API_BASE_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('WeatherService socket connected:', this.socket?.id);
      this.isConnected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('WeatherService socket disconnected');
      this.isConnected = false;
    });

    this.socket.on('location_changed', (loc: string) => {
      this.locationChangeCallbacks.forEach(callback => callback(loc));
    });

    this.socket.on('date_changed', (date: string) => {
      this.dateChangeCallbacks.forEach(callback => callback(date));
    });

    this.socket.on('time_of_date_changed', (time: string) => {
      this.timeOfDateChangeCallbacks.forEach(callback => callback(time));
    });

    this.socket.on('temp_humid_updated', (tempHumid: ITempHumid) => {
      this.tempHumidChangeCallbacks.forEach(callback => callback(tempHumid));
    });
  }

  onLocationChange(callback: (loc: string) => void): () => void {
    // Prevent duplicate callbacks
    if (!this.locationChangeCallbacks.includes(callback)) {
      this.locationChangeCallbacks.push(callback);
    }
    
    return () => {
      this.locationChangeCallbacks = this.locationChangeCallbacks.filter(cb => cb !== callback);
    };
  }

  onDateChange(callback: (date: string) => void): () => void {
    if (!this.dateChangeCallbacks.includes(callback)) {
      this.dateChangeCallbacks.push(callback);
    }
    
    return () => {
      this.dateChangeCallbacks = this.dateChangeCallbacks.filter(cb => cb !== callback);
    };
  }

  onTimeOfDateChange(callback: (time: string) => void): () => void {
    if (!this.timeOfDateChangeCallbacks.includes(callback)) {
      this.timeOfDateChangeCallbacks.push(callback);
    }
    
    return () => {
      this.timeOfDateChangeCallbacks = this.timeOfDateChangeCallbacks.filter(cb => cb !== callback);
    };
  }

  onTempHumidChange(callback: (tempHumid: ITempHumid) => void): () => void {
    if (!this.tempHumidChangeCallbacks.includes(callback)) {
      this.tempHumidChangeCallbacks.push(callback);
    }
    
    return () => {
      this.tempHumidChangeCallbacks = this.tempHumidChangeCallbacks.filter(cb => cb !== callback);
    };
  }

  disconnectSocket() {
    if (this.socket) {
      console.log('Disconnecting WeatherService socket...');
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.isInitialized = false;
    }
    
    // Clear all callbacks
    this.locationChangeCallbacks = [];
    this.dateChangeCallbacks = [];
    this.timeOfDateChangeCallbacks = [];
    this.tempHumidChangeCallbacks = [];
  }
  
  async getTempHumid(): Promise<any>{
    try{
      const res = await this.api.get('/weatherContext');
      if(!res.data.success){
        throw new Error('Failed to fetch data');
      }

      return res.data.data;
    }catch(error){
      throw error;
    }
  }
}

export default new WeatherService();