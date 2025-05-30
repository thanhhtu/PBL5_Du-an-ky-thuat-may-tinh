import { io, Socket } from 'socket.io-client';
import { ITempHumid } from '../types';

class WeatherService {
  socket: Socket | null = null;
  locationChangeCallbacks: ((loc: string) => void)[] = [];
  dateChangeCallbacks: ((date: string) => void)[] = [];
  timeOfDateChangeCallbacks: ((time: string) => void)[] = [];
  tempHumidChangeCallbacks: ((tempHumid: ITempHumid) => void)[] = [];

  private isConnected = false;
  private isInitialized = false;

  constructor() {
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

    this.setupSocketListeners();
  }

  private setupSocketListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('WeatherService socket connected:', this.socket?.id);
      this.isConnected = true;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WeatherService socket disconnected:', reason);
      this.isConnected = false;
    });

    // this.socket.on('connect_error', (error) => {
    //   console.error('WeatherService socket connection error:', error);
    //   this.isConnected = false;
    // });

    // Data events với error handling từ Code 1
    this.socket.on('location_changed', (loc: string) => {
      console.log('Location changed received:', loc);
      this.executeCallbacks(this.locationChangeCallbacks, loc);
    });

    this.socket.on('date_changed', (date: string) => {
      console.log('Date changed received:', date);
      this.executeCallbacks(this.dateChangeCallbacks, date);
    });

    this.socket.on('time_of_date_changed', (time: string) => {
      console.log('Time changed received:', time);
      this.executeCallbacks(this.timeOfDateChangeCallbacks, time);
    });

    this.socket.on('temp_humid_changed', (tempHumid: ITempHumid) => {
      console.log('Temp-humid changed received:', tempHumid);
      this.executeCallbacks(this.tempHumidChangeCallbacks, tempHumid);
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

  onLocationChange(callback: (loc: string) => void): () => void {
    return this.addCallback(this.locationChangeCallbacks, callback);
  }

  onDateChange(callback: (date: string) => void): () => void {
    return this.addCallback(this.dateChangeCallbacks, callback);
  }

  onTimeOfDateChange(callback: (time: string) => void): () => void {
    return this.addCallback(this.timeOfDateChangeCallbacks, callback);
  }

  onTempHumidChange(callback: (tempHumid: ITempHumid) => void): () => void {
    return this.addCallback(this.tempHumidChangeCallbacks, callback);
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  reconnectSocket(): void {
    if (!this.isConnected && this.socket) {
      console.log('Attempting to reconnect socket...');
      this.socket.connect();
    }
  }

  disconnectSocket() {
    if (this.socket) {
      console.log('Disconnecting WeatherService socket...');
      
      // Remove all listeners trước khi disconnect
      this.socket.removeAllListeners();
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
}

export default new WeatherService();