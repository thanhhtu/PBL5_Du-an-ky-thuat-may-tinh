import axios from 'axios';
import { API_BASE_URL } from '@env';
import { Device, DeviceLog, DeviceState } from '@/app/types';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

class DeviceService{
  async getAllDevices(): Promise<Device[]>{
    try{
      const res = await api.get('/devices');
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
      const res = await api.get(`/devices/${id}`);
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
      const res = await api.get(`/devices/${id}/logs`);
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
      const res = await api.patch(`/devices/${id}/state`, { state });
      if(!res.data.success){
        throw new Error('Failed to fetch data');
      }

      return res.data.data;
    }catch(error){
      throw error;
    }
  }
}

export default new DeviceService();