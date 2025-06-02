import { Server } from 'socket.io';
import { getIO } from '../config/socket.config';
import { errorHandlerFunc } from '../providers/errorHandler.provider';
import weatherContentProvider from '../providers/weatherContent.provider';
import { ITempHumid } from '../types/device.interface';

class WeatherContentSocket {
  _io: Server | null = null;

  get io(): Server {
    if (!this._io) {
      this._io = getIO();
    }
    return this._io;
  }

  async emitLocationChange(): Promise<void> {
    return errorHandlerFunc(async () => {
      const location = await weatherContentProvider.getLocation();
      this.io.emit('location_changed', location);
    });
  }

  async emitDateChange(): Promise<void> {
    return errorHandlerFunc(async () => {
      const date = weatherContentProvider.getDate();
      this.io.emit('date_changed', date);
    });
  }

  async emitTimeOfDateChange(): Promise<void> {
    return errorHandlerFunc(async () => {
      const time = weatherContentProvider.getTimeOfDay();
      this.io.emit('time_of_date_changed', time);
    });
  }

  emitTempHumidChange(tempHumid: ITempHumid): void {
    this.io.emit('temp_humid_changed', tempHumid);
  }
}

export default new WeatherContentSocket();
