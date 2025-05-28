// import axios from 'axios';
// import 'dotenv/config';
// import { errorHandlerFunc } from '../providers/errorHandler.provider';
// import { DeviceState } from '../types/device.enum';

// class DeviceIoT {
//   async controlDevice(id: number, state: DeviceState): Promise<void> {
//     return errorHandlerFunc(async () => {
//       const espUrl = `http://${process.env.AXIOS_IOT_URI}/control?id=${id}&state=${state.toLowerCase()}`;
//       await axios.get(espUrl, { timeout: 2000 });
//     });
//   }
// }

// export default new DeviceIoT();

import axios from 'axios';
import 'dotenv/config';
import { errorHandlerFunc } from '../providers/errorHandler.provider';
import { DeviceState } from '../types/device.enum';

class DeviceIoT {
  async controlDevice(id: number, state: DeviceState): Promise<void> {
    return errorHandlerFunc(async () => {
      // Convert WebSocket URL to HTTP URL for device control
      const httpUrl = process.env.AXIOS_IOT_URI?.replace('ws://', 'http://').replace(':81', ':80') || 'http://192.168.1.56';
      const espUrl = `${httpUrl}/control?id=${id}&state=${state.toLowerCase()}`;
      
      console.log(`Controlling device ${id} to ${state} via: ${espUrl}`);
      
      try {
        const response = await axios.get(espUrl, { 
          timeout: 5000,
          headers: {
            'User-Agent': 'SmartHome-Backend/1.0'
          }
        });
        console.log(`Device ${id} control response:`, response.data);
      } catch (error: any) {
        console.error(`Failed to control device ${id}:`, error.message);
        // Don't throw error to prevent 500 - device control is optional
        // Just log the error and continue
      }
    });
  }
}

export default new DeviceIoT();
