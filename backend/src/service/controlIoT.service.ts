import axios from 'axios';
import 'dotenv/config';
import { errorHandlerFunc } from './errorHandler.service';
import { DeviceState } from '../types/device.enum';

class ControlIoTService{
  async controlDevice(id: number, state: DeviceState): Promise<void>{
    return errorHandlerFunc(async () => {
      const espUrl = `http://${process.env.AXIOS_IOT_URI}/control?id=${id}&state=${state.toLowerCase()}`;
      console.log(espUrl);
      
      await axios.get(espUrl, { timeout: 3000 });
    });
  }
}

export default new ControlIoTService();