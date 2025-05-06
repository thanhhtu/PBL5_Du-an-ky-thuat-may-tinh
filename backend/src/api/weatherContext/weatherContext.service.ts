import weatherContentIot from '../../iot/weatherContent.iot';
import { errorHandlerFunc } from '../../providers/errorHandler.provider';

class WeatherContextService {
  async getTempHumid(): Promise<any> {
    return errorHandlerFunc(async () => {
      const data = await weatherContentIot.getTempHumid();
      return data;
    });
  }
}

export default new WeatherContextService();
