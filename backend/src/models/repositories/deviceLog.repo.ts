import { Repository } from 'typeorm';
import { DeviceLog } from '../entities/DeviceLog';
import { AppDataSource } from '../../config/orm.config';
import { Device } from '../entities/Device';
import { DeviceAction, DeviceState } from '../../types/device.enum';
import { errorHandlerFunc } from '../../providers/errorHandler.provider';

class DeviceLogRepo {
  private readonly deviceLogRepo: Repository<DeviceLog>;

  constructor() {
    this.deviceLogRepo = AppDataSource.getRepository(DeviceLog);
  }

  async saveLog(
    device: Device,
    action: DeviceAction,
    previousState: DeviceState,
    ipAddress: string | null
  ): Promise<any> {
    return errorHandlerFunc(async () => {
      if (!ipAddress) {
        ipAddress = 'unknown';
      }
      const deviceLog = this.deviceLogRepo.create({
        device,
        action,
        previousState,
        ipAddress,
      });

      await this.deviceLogRepo.save(deviceLog);
    });
  }

  async getLogsByDeviceId(deviceId: number): Promise<DeviceLog[]> {
    return errorHandlerFunc(async () => {
      return await this.deviceLogRepo.find({
        where: { device: { id: deviceId } },
        relations: ['device'],
        order: { timestamp: 'DESC' },
      });
    });
  }

  async getAllLogs(): Promise<DeviceLog[]> {
    return errorHandlerFunc(async () => {
      return await this.deviceLogRepo.find({
        relations: ['device'],
        order: { timestamp: 'DESC' },
      });
    });
  }
}

export default new DeviceLogRepo();
