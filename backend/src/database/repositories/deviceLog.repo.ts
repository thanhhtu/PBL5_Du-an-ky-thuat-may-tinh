import { Repository } from 'typeorm'
import { DeviceLog } from '../entities/DeviceLog';
import { AppDataSource } from '../../config/orm.config';
import { Device } from '../entities/Device';
import { DeviceAction, DeviceState } from '../../types/device.enum';
import { errorHandlerFunc } from '../../service/errorHandler.service';

class DeviceLogRepo {
  private readonly deviceLogRepo:Repository<DeviceLog>;

  constructor(){
    this.deviceLogRepo = AppDataSource.getRepository(DeviceLog);
  }
  
  async saveLog(
    device: Device, 
    action: DeviceAction, 
    previousState: DeviceState, 
    ipAddress: string| null): Promise<any>{
    return errorHandlerFunc(async () => {
      if(!ipAddress){
        ipAddress = 'unknown';
      }
      const deviceLog = await this.deviceLogRepo.create({
        device,
        action,
        previousState,
        ipAddress
      })

      await this.deviceLogRepo.save(deviceLog);

      return;
    });
  }

  async getDeviceLogs(deviceId: number): Promise<DeviceLog[]>{
    return errorHandlerFunc(async () => {
      return this.deviceLogRepo.find({
        where: { device: { id: deviceId } },
        relations: ['device'],
        order: { timestamp: 'DESC' }
      });
    })
  }
}

export default new DeviceLogRepo();