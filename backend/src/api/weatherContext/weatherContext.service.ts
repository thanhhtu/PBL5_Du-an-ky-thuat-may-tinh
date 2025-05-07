import weatherContentIot from '../../iot/weatherContent.iot';
import { errorHandlerFunc } from '../../providers/errorHandler.provider';
import { ITempHumid } from '../../types/device.interface';

class WeatherContextService {
  async getTempHumid(): Promise<ITempHumid> {
    return errorHandlerFunc(async () => {
      const data: ITempHumid = await weatherContentIot.getTempHumid();
      
      return data;
    });
  }
}

export default new WeatherContextService();
