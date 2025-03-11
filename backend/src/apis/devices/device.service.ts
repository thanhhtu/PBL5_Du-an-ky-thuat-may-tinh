import { StatusCodes } from 'http-status-codes';
import { Device } from '../../database/entities/Device';
import deviceRepo from '../../database/repositories/device.repo';
import CustomError from '../../service/customError.service';
import { errorHandlerFunc } from '../../service/errorHandler.service';
import { IDevice, IDeviceLog } from '../../types/device.interface';
import { DeviceLog } from '../../database/entities/DeviceLog';
import deviceLogRepo from '../../database/repositories/deviceLog.repo';
import { DeviceState } from '../../types/device.enum';
import { getIO } from '../../config/socket.config';

class DeviceService{
  async deviceInfo(device: Device): Promise<IDevice>{
    return {
      id: Number(device.id),
      name: device.name,
      label: device.label,
      image: device.image,
      state: device.state,
      createdAt: device.createdAt,
    }
  }

  async deviceLogInfo(deviceLog: DeviceLog): Promise<IDeviceLog>{
    return {
      id: Number(deviceLog.id),
      device: deviceLog.device.name,
      action: deviceLog.action,
      timestamp: deviceLog.timestamp,
      previousState: deviceLog.previousState,
      ipAddress: deviceLog.ipAddress || 'unknown',
    }
  }

  async getAllDevices(): Promise<IDevice[]>{
    return errorHandlerFunc(async () => {
      const devices =  await deviceRepo.findAll();
      
      return await Promise.all(
        devices.map(device => this.deviceInfo(device))
      );
    });
  }

  async getDeviceById(id: number): Promise<IDevice>{
    return errorHandlerFunc(async () => {
      const device = await deviceRepo.findById(id);
      if(!device){
        throw new CustomError(StatusCodes.NOT_FOUND, 'Device not found');
      }
      return this.deviceInfo(device);
    });
  }

  async createDevice(deviceData: any, img: Express.Multer.File | undefined): Promise<IDevice>{
    return errorHandlerFunc(async () => {
      if(!img){
        throw new CustomError(StatusCodes.NOT_FOUND, 'Image not found'); 
      }

      deviceData.image = img.filename;

      const device = await deviceRepo.create(deviceData);
      return this.deviceInfo(device);
    });
  }

  async deleteDevice(id:number): Promise<boolean>{
    return errorHandlerFunc(async () => {
      await this.getDeviceById(id);

      const result = await deviceRepo.delete(id);
      
      if(!result){
        throw new CustomError(StatusCodes.NOT_FOUND, 'No device deleted');
      }

      return result;
    });
  }

  async getDeviceLogs(id: number): Promise<IDeviceLog[]>{
    return errorHandlerFunc(async () => {
      await this.getDeviceById(id);

      const logs = await deviceLogRepo.getDeviceLogs(id);

      return await Promise.all(
        logs.map(log => this.deviceLogInfo(log))
      );
    });
  }

  async updateDeviceState(id: number, state: DeviceState, ipAddress: string | null): Promise<IDevice>{
    return errorHandlerFunc(async () => {
      await this.getDeviceById(id);

      const updateDevice = await deviceRepo.updateState(id, state, ipAddress);

      if(!updateDevice){
        throw new CustomError(StatusCodes.NOT_FOUND, 'Device not found');
      }

      const io = getIO();
      io.emit('device_state_changed', updateDevice);

      return this.deviceInfo(updateDevice);
    });
  }
}

export default new DeviceService();