import { Server } from "socket.io";
import { getIO } from "../config/socket.config";
import { IDevice } from "../types/device.interface";
import { errorHandlerFunc } from "../service/errorHandler.service";

class DeviceSocket{
  _io: Server | null = null;

  get io(): Server {
    if (!this._io) {
      this._io = getIO();
    }
    return this._io;
  }

  async emitDeviceStateChange(updateDevice: IDevice): Promise<void>{
    return errorHandlerFunc(async () => {
      this.io.emit('device_state_changed', updateDevice);
    });
    
  }
}

export default new DeviceSocket();