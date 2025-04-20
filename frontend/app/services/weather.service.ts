import axios, { AxiosInstance } from 'axios';
import { io, Socket } from 'socket.io-client';

class WeatherService{
  api: AxiosInstance;
  socket: Socket;
  locationChangeCallbacks: ((loc: string) => void)[] = [];
  dateChangeCallbacks: ((date: string) => void)[] = [];
  timeOfDateChangeCallbacks: ((time: string) => void)[] = [];

  constructor(){
    this.api = axios.create({
      baseURL: process.env.EXPO_PUBLIC_API_BASE_URL,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    this.socket = io(process.env.EXPO_PUBLIC_API_BASE_URL);

    this.socket.on('location_changed', (loc: string) => {
      console.log('Client connected socket - location: ', this.socket.id);
      this.locationChangeCallbacks.forEach(callback => callback(loc));
    });

    this.socket.on('date_changed', (date: string) => {
      console.log('Client connected socket - date: ', this.socket.id);
      this.dateChangeCallbacks.forEach(callback => callback(date));
    });

    this.socket.on('time_of_date_changed', (time: string) => {
      console.log('Client connected socket - time: ', this.socket.id);
      this.timeOfDateChangeCallbacks.forEach(callback => callback(time));
    });
  }

  onLocationChange(callback: (loc: string) => void): () => void {
    this.locationChangeCallbacks.push(callback);
    
    return () => {
      this.locationChangeCallbacks = this.locationChangeCallbacks.filter(cb => cb !== callback);
    };
  }

  onDateChange(callback: (date: string) => void): () => void {
    this.dateChangeCallbacks.push(callback);
    
    return () => {
      this.dateChangeCallbacks = this.dateChangeCallbacks.filter(cb => cb !== callback);
    };
  }

  onTimeOfDateChange(callback: (time: string) => void): () => void {
    this.timeOfDateChangeCallbacks.push(callback);
    
    return () => {
      this.timeOfDateChangeCallbacks = this.timeOfDateChangeCallbacks.filter(cb => cb !== callback);
    };
  }

  disconnectSocket() {
    console.log('Client disconnected');
    this.socket.off('device_state_changed');
    this.dateChangeCallbacks = [];
  }
  
  async getTempHumid(): Promise<any>{
    try{
      const res = await this.api.get('/temp-humid');
      if(!res.data.success){
        throw new Error('Failed to fetch data');
      }

      console.log('data: ', res.data.data);

      return res.data.data;
    }catch(error){
      throw error;
    }
  }
}

export default new WeatherService();