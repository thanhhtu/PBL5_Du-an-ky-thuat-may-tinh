import { StatusCodes } from 'http-status-codes';
import { Device } from '../../models/entities/Device';
import deviceRepo from '../../models/repositories/device.repo';
import CustomError from '../../providers/customError.provider';
import { errorHandlerFunc } from '../../providers/errorHandler.provider';
import { IDevice, IDeviceLog } from '../../types/device.interface';
import { DeviceLog } from '../../models/entities/DeviceLog';
import deviceLogRepo from '../../models/repositories/deviceLog.repo';
import { DeviceState } from '../../types/device.enum';
import deviceSocket from '../../socket/device.socket';
import httpIot from '../../iot/http.iot';

class DeviceService {
  deviceInfo(device: Device): IDevice {
    return {
      id: Number(device.id),
      name: device.name,
      label: device.label,
      image: device.image,
      state: device.state,
      createdAt: device.createdAt,
    };
  }

  async deviceLogInfo(deviceLog: DeviceLog): Promise<IDeviceLog> {
    return {
      id: Number(deviceLog.id),
      deviceId: Number(deviceLog.device.id),
      device: deviceLog.device.name,
      action: deviceLog.action,
      timestamp: deviceLog.timestamp,
      previousState: deviceLog.previousState,
      ipAddress: deviceLog.ipAddress || 'unknown',
    };
  }

  async getAllDevices(): Promise<IDevice[]> {
    return errorHandlerFunc(async () => {
      const devices = await deviceRepo.findAll();

      return await Promise.all(
        devices.map((device) => this.deviceInfo(device))
      );
    });
  }

  async getDeviceById(id: number): Promise<IDevice> {
    return errorHandlerFunc(async () => {
      const device = await deviceRepo.findById(id);
      if (!device) {
        throw new CustomError(StatusCodes.NOT_FOUND, 'Device not found');
      }
      return this.deviceInfo(device);
    });
  }

  async createDevice(deviceData: any, img: Express.Multer.File | undefined): Promise<IDevice> {
    return errorHandlerFunc(async () => {
      if (!img) {
        throw new CustomError(StatusCodes.NOT_FOUND, 'Image not found');
      }

      deviceData.image = img.filename;

      const device = await deviceRepo.create(deviceData);
      return this.deviceInfo(device);
    });
  }

  async deleteDevice(id: number): Promise<boolean> {
    return errorHandlerFunc(async () => {
      await this.getDeviceById(id);

      const result = await deviceRepo.delete(id);

      if (!result) {
        throw new CustomError(StatusCodes.NOT_FOUND, 'No device deleted');
      }

      return result;
    });
  }

  async getLogsByDeviceId(id: number): Promise<IDeviceLog[]> {
    return errorHandlerFunc(async () => {
      await this.getDeviceById(id);

      const logs = await deviceLogRepo.getLogsByDeviceId(id);

      return await Promise.all(logs.map((log) => this.deviceLogInfo(log)));
    });
  }

  async getAllLogs(): Promise<IDeviceLog[]> {
    return errorHandlerFunc(async () => {
      const logs = await deviceLogRepo.getAllLogs();

      return await Promise.all(logs.map((log) => this.deviceLogInfo(log)));
    });
  }

  async updateDeviceState(id: number, state: DeviceState, ipAddress: string | null): Promise<IDevice> {
    return errorHandlerFunc(async () => {
      await this.getDeviceById(id);

      const updatedDevice = await deviceRepo.updateState(id, state, ipAddress);
      if (!updatedDevice) {
        throw new CustomError(StatusCodes.NOT_FOUND, 'Device not found');
      }

      await deviceSocket.emitDeviceStateChange(updatedDevice);

      // iot
      await httpIot.controlDevice(id, state);

      const deviceInfo = this.deviceInfo(updatedDevice);
      return deviceInfo;
    });
  }

  async updateAllDeviceState(state: DeviceState, ipAddress: string | null): Promise<IDevice[]> {
    return errorHandlerFunc(async () => {
      const updatedDevices = await deviceRepo.updateAllState(state, ipAddress);
      if (!updatedDevices) {
        throw new CustomError(StatusCodes.NOT_FOUND, 'Devices not found');
      }

      await Promise.all(updatedDevices.map(async (updatedDevice) => {
        await deviceSocket.emitDeviceStateChange(updatedDevice);

        // iot
        httpIot.controlDevice(updatedDevice.id, state);
      }));

      const devicesInfo: IDevice[] = await Promise.all(
        updatedDevices.map((device) => this.deviceInfo(device))
      );

      return devicesInfo;
    });
  }
}

export default new DeviceService();
