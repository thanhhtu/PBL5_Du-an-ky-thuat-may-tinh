import { Repository } from 'typeorm';
import { Device } from '../entities/Device';
import { AppDataSource } from '../../config/orm.config';
import { errorHandlerFunc } from '../../providers/errorHandler.provider';
import { DeviceAction, DeviceState } from '../../types/device.enum';
import deviceLogRepo from './deviceLog.repo';

class DeviceRepo {
  private readonly deviceRepo: Repository<Device>;

  constructor() {
    this.deviceRepo = AppDataSource.getRepository(Device);
  }

  async findAll(): Promise<Device[]> {
    return errorHandlerFunc(async () => {
      return this.deviceRepo.find();
    });
  }

  async findById(id: number): Promise<Device | null> {
    return errorHandlerFunc(async () => {
      return this.deviceRepo.findOneBy({ id });
    });
  }

  async create(deviceData: Partial<Device>): Promise<Device> {
    return errorHandlerFunc(async () => {
      const device = await this.deviceRepo.create(deviceData);
      await this.deviceRepo.save(device);
      return device;
    });
  }

  async delete(id: number): Promise<boolean> {
    return errorHandlerFunc(async () => {
      const result = await this.deviceRepo.delete(id);
      return (result.affected ?? 0) > 0;
    });
  }

  async updateState(
    id: number,
    state: DeviceState,
    ipAddress: string | null
  ): Promise<Device | null> {
    return errorHandlerFunc(async () => {
      const device = await this.deviceRepo.findOneBy({ id });

      if (!device) {
        return null;
      }

      const previousState = device.state;

      device.state = state;
      await this.deviceRepo.save(device);

      const action =
        state === DeviceState.ON ? DeviceAction.TURN_ON : DeviceAction.TURN_OFF;
      await deviceLogRepo.saveLog(device, action, previousState, ipAddress);

      return device;
    });
  }

  async updateAllState(
    state: DeviceState,
    ipAddress: string | null
  ): Promise<Device[] | null> {
    return errorHandlerFunc(async () => {
      const devices = await this.deviceRepo.find();
      if (!devices) {
        return null;
      }

      let updatedDevices: Device[] = [];

      for(const device of devices) {
        const previousState = device.state;

        device.state = state;
        await this.deviceRepo.save(device);

        const action = state === DeviceState.ON ? DeviceAction.TURN_ON : DeviceAction.TURN_OFF;

        await deviceLogRepo.saveLog(device, action, previousState, ipAddress);

        updatedDevices.push(device);
      }

      return updatedDevices;
    });
  }
}

export default new DeviceRepo();
