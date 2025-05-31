import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import aiProvider from '../../providers/ai.provider';
import { errorHandlerFunc } from '../../providers/errorHandler.provider';
import { COMMAND_DEVICE_MAP, COMMAND_MAP } from '../../types/device.mapping';
import deviceRepo from '../../models/repositories/device.repo';
import CustomError from '../../providers/customError.provider';
import { StatusCodes } from 'http-status-codes';
import deviceSocket from '../../socket/device.socket';
import deviceIot from '../../iot/device.iot';
import { Device } from '../../models/entities/Device';
import { IAudioDevice, IDevice } from '../../types/device.interface';
import ffmpegPath from 'ffmpeg-static';
import { DeviceState } from '../../types/device.enum';

class AIService {
  async convertAudioToWav(inputFilePath: string, outputDir: string): Promise<string> {
    return errorHandlerFunc<string>(() => {
      return new Promise((resolve, reject) => {
        const outputFilePath = path.resolve(outputDir, 'audio.wav');
  
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }
  
        ffmpeg.setFfmpegPath(ffmpegPath!);
        ffmpeg(inputFilePath)
          .toFormat('wav')
          .audioCodec('pcm_s16le')
          .audioFrequency(16000)
          .on('end', () => {
            resolve(outputFilePath);
          })
          .on('error', (err) => {
            reject(new Error(`Failed to convert audio file: ${err.message}`));
          })
          .save(outputFilePath);
      });
    });
  }  
  
  async transcribeAudio(filePath: string): Promise<any> {
    return errorHandlerFunc(async () => {
      const result = await aiProvider.sendAudioForTranscription(filePath);
      
      fs.unlinkSync(filePath);
      
      return result;
    });
  }

  async updateAllDevicesByCommandCode(commandCode: number, ipAddress: string | null): Promise<IAudioDevice > {
    return errorHandlerFunc(async () => {
      if(commandCode === 9){
        const areAllDevicesOn = await deviceRepo.checkAllDevicesOn();
        if(areAllDevicesOn){
          console.log(`All devices are already in state ON. No update needed.`);
          return {
            data: 'All devices are already in state ON. No update needed.',
            commandCode: commandCode,
          };
        }
      }else if(commandCode === 10) {
        const areAllDevicesOff = await deviceRepo.checkAllDevicesOff();
        if(areAllDevicesOff){
          console.log(`All devices are already in state OFF. No update needed.`);
          return {
            data: 'All devices are already in state OFF. No update needed.',
            commandCode: commandCode,
          };
        }
      }

      const state = commandCode === 9 ? DeviceState.ON : DeviceState.OFF;
      
      const updatedDevices = await deviceRepo.updateAllState(state, ipAddress);
      if (!updatedDevices) {
        throw new CustomError(StatusCodes.NOT_FOUND, 'Devices not found');
      }

      await Promise.all(updatedDevices.map(async (updatedDevice) => {
        await deviceSocket.emitDeviceStateChange(updatedDevice);

        // // iot
        // await deviceIot.controlDevice(updatedDevice.id, state);
      }));

      const devicesInfo: IDevice[] = await Promise.all(
        updatedDevices.map((device) => this.deviceInfo(device))
      );

      console.log('AI - Updated devices:', devicesInfo);
      
      return {
        data: devicesInfo,
        commandCode: commandCode,
      }
    });
  }

  async updateSingleDeviceByCommandCode(commandCode: number, ipAddress: string | null): Promise<IAudioDevice> {
    return errorHandlerFunc(async () => {
      const deviceInfo = COMMAND_DEVICE_MAP[commandCode];
      if (!deviceInfo) {
        throw new CustomError(StatusCodes.NOT_FOUND, 'Device not found');
      }

      const { deviceId, state } = deviceInfo;

      const existingDevice = await deviceRepo.findById(deviceId);
      if (!existingDevice) {
        throw new CustomError(StatusCodes.NOT_FOUND, 'Device not found');
      }

      if(existingDevice.state !== state) {
        const updatedDevice = await deviceRepo.updateState(deviceId, state, ipAddress);
        if (!updatedDevice) {
          throw new CustomError(StatusCodes.NOT_FOUND, 'Device not found');
        }

        await deviceSocket.emitDeviceStateChange(updatedDevice);

        // // iot
        // await deviceIot.controlDevice(deviceId, state);

        const deviceInfo = this.deviceInfo(updatedDevice);
        return {
          data: deviceInfo,
          commandCode: commandCode,
        };
      }

      console.log(`Device ${deviceId} is already in state ${state}. No update needed.`);
      return {
        data: `Device ${deviceId} is already in state ${state}. No update needed.`,
        commandCode: commandCode,
      };
    });
  }

  async updateDeviceState(inputFilePath: string, ipAddress: string | null): Promise<IAudioDevice> {
    return errorHandlerFunc(async () => {
      const uploadDir = path.join(__dirname, '../../uploads/audio/wav');
      
      const outputFilePath = await this.convertAudioToWav(inputFilePath, uploadDir);
      const result = await this.transcribeAudio(outputFilePath);
      
      // Get commandCode
      const commandCode = (typeof result === 'object') && (result.command_code !== undefined) 
        ? result.command_code 
        : -1;
      console.log(`Command Code: ${commandCode} - Command Message: ${COMMAND_MAP[commandCode]}`);

      if(commandCode === -1) {
        return {
          data: 'Command code not found',
          commandCode: commandCode,
        }
      }

      if(commandCode === 9 || commandCode === 10) {
        return await this.updateAllDevicesByCommandCode(commandCode, ipAddress);
      }

      return await this.updateSingleDeviceByCommandCode(commandCode, ipAddress);
    });
  }

  deviceInfo(device: Device): IDevice {
    return {
      id: Number(device.id),
      name: device.name,
      label: device.label,
      image: device.image,
      state: device.state,
      createdAt: device.createdAt,
    };
  }
}

export default new AIService();