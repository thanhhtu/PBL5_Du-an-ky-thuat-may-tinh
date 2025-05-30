import axios from 'axios';
import 'dotenv/config';
import { errorHandlerFunc } from '../providers/errorHandler.provider';
import { DeviceState } from '../types/device.enum';

class DeviceIoT {
  async controlDevice(id: number, state: DeviceState): Promise<void> {
    return errorHandlerFunc(async () => {
      const espUrl = `${process.env.IOT_URI}/control?id=${id}&state=${state.toLowerCase()}`;
      await axios.get(espUrl, { timeout: 2000 });
    });
  }
}

export default new DeviceIoT();
