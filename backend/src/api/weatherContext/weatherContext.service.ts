import { getLatestEsp32Data } from '../../iot/socket.iot';
import weatherContentIot from '../../iot/weatherContent.iot';
import { errorHandlerFunc } from '../../providers/errorHandler.provider';
import { ITempHumid } from '../../types/device.interface';

class WeatherContextService {
  async getTempHumid(): Promise<ITempHumid> {
    return errorHandlerFunc(async () => {
      // const data: ITempHumid = await weatherContentIot.getTempHumid();
      
      // return data;

      const data = getLatestEsp32Data();
      if (data.temperature === '' || data.humidity === '') {
        console.warn('getTempHumid called, but temperature/humidity data is not yet available from ESP32.');
      }      
      return data;
    });
  }
}

export default new WeatherContextService();
