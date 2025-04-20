import axios from 'axios';
import 'dotenv/config';
import { errorHandlerFunc } from '../providers/errorHandler.provider';
import CustomError from '../providers/customError.provider';
import { StatusCodes } from 'http-status-codes';

class WeatherContentIoT {
  async getTempHumid(): Promise<any> {
    return errorHandlerFunc(async () => {
      const espUrl = `http://${process.env.AXIOS_IOT_URI}/weather}`;
      const res = await axios.get(espUrl, { timeout: 1000 });

      if(!res){
        throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, 'Can not get data from iot');
      }
      
      return res.data;
    });
  }
}

export default new WeatherContentIoT();
