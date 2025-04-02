

// import { Request, Response } from 'express';
// import fs from 'fs';
// import ffmpeg from 'fluent-ffmpeg';
// import path from 'path';
// import aiCommunicationService from '../../service/aiCommunication.service';
// import { errorHandlerRes } from '../../service/errorHandler.service';
// import ControlIoTService  from '../../service/controlIoT.service';


// class AIController {
//     async transcribeAudio(req: Request, res: Response): Promise<void> {
//         try {
//             if (!req.file) {
//                 res.status(400).json({ error: 'No audio file uploaded' });
//                 return;
//             }

//             console.log('Received file:', req.file);

//             const inputFilePath = req.file.path;
//             const uploadDir = path.join(__dirname, '../../uploads');

//             // Tạo thư mục nếu chưa tồn tại
//             if (!fs.existsSync(uploadDir)) {
//                 fs.mkdirSync(uploadDir, { recursive: true });
//             }

//             const outputFilePath = path.resolve(uploadDir, 'audio.wav');

//             // Chuyển đổi tệp m4a sang wav với cấu hình cụ thể
//             ffmpeg(inputFilePath)  // Use just the input path without appending anything
//                 .toFormat('wav')
//                 .audioCodec('pcm_s16le')
//                 .audioFrequency(16000)   // Tần số âm thanh
//                 .on('end', async () => {
//                     console.log('Conversion completed:', outputFilePath);

//                     try {
//                         // Gửi tệp WAV đến dịch vụ xử lý
//                         const transcription = await aiCommunicationService.sendAudioForTranscription(outputFilePath);

//                         // Dọn dẹp tệp sau khi xử lý
//                         fs.unlinkSync(inputFilePath);
//                         fs.unlinkSync(outputFilePath);

//                         //Gửi lệnh cho frontend
//                          res.json({ transcription });
//                         console.log("transcription: ",transcription);

//                        // ControlIoTService.controlDevice(1, transcription)
                       
//                     } catch (error) {
//                         console.error('Error during transcription:', error);
//                         res.status(500).json({ error: 'Failed to transcribe audio' });
//                     }
//                 })
//                 .on('error', (err) => {
//                     console.error('Error converting file:', err);
//                     res.status(500).json({ error: 'Failed to process audio' });
//                 })
//                 .save(outputFilePath); // Lưu tệp WAV
//         } catch (error) {
//             errorHandlerRes(error, res);
//         }
//     }
// }

// export default new AIController();


import { Request, Response } from 'express';
import path from 'path';
import AIService from './ai.service';
import { errorHandlerRes } from '../../service/errorHandler.service';
import { Device } from '../../database/entities/Device';
import { DeviceState } from '../../types/device.enum';
import controlIoTService from '../../service/controlIoT.service';
import deviceService from '../devices/device.service';
import deviceRepo from '../../database/repositories/device.repo';
import CustomError from '../../service/customError.service';
import { StatusCodes } from 'http-status-codes';
import deviceSocket from '../../socket/device.socket';

// Map command codes to their corresponding actions
const COMMAND_MAP: Record<number, string> = {
  1: "Mở cửa",
  2: "Đóng cửa",
  3: "Bật đèn",
  4: "Tắt đèn",
  5: "Mở màn",
  6: "Đóng màn",
  7: "Bật quạt",
  8: "Tắt quạt",
  [-1]: "Không nhận diện được lệnh"
};

class AIController {
  async transcribeAudio(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No audio file uploaded' });
        return;
      }
      
      console.log('Received file:', req.file);
      const inputFilePath = req.file.path;
      const uploadDir = path.join(__dirname, '../../uploads');
      
      // Chuyển đổi tệp sang định dạng WAV
      const outputFilePath = await AIService.convertAudioToWav(inputFilePath, uploadDir);
      
      // Gửi tệp WAV để phiên âm
      const result = await AIService.transcribeAudio(outputFilePath);
      // Lấy command_code từ kết quả
      const commandCode = typeof result === 'object' && result.command_code !== undefined 
        ? result.command_code 
        : -1;
      
      // Lấy lệnh tương ứng với command_code
      const commandText = COMMAND_MAP[commandCode] || COMMAND_MAP[-1];
      
      // Log thông tin
      console.log(`Command Code: ${commandCode}, Command: ${commandText}`);
      
      let deviceId;
      let status;
      if(commandCode == 1){
        deviceId = 1;
        status = DeviceState.ON;
      }else if(commandCode == 2){
        deviceId = 1;
        status = DeviceState.OFF;
      }else if(commandCode == 3){
        deviceId = 2;
        status = DeviceState.ON;
      }else if(commandCode == 4){
        deviceId = 2;
        status = DeviceState.OFF;
      }
      else if(commandCode == 5){
        deviceId = 3;
        status = DeviceState.ON;
      }else if(commandCode == 6){
        deviceId = 3;
        status = DeviceState.OFF;
      }else if(commandCode == 7){
        deviceId = 4;
        status = DeviceState.ON;
      }else if(commandCode == 8){
        deviceId = 4;
        status = DeviceState.OFF;
      }

      if(status && deviceId){
        await deviceRepo.findById(deviceId);;

        const updateDevice = await deviceRepo.updateState(deviceId, status, null);
        if(!updateDevice){
          throw new CustomError(StatusCodes.NOT_FOUND, 'Device not found');
        }
        await deviceSocket.emitDeviceStateChange(updateDevice);
          await controlIoTService.controlDevice(deviceId, status);
        }
      
      // Trả về kết quả
      res.json({
        command_code: commandCode,
        command: commandText,
        success: commandCode !== -1
      });
      
      // Gửi lệnh điều khiển thiết bị (nếu cần)
      // ControlIoTService.controlDevice(commandCode, commandText);
      
    } catch (error) {
      errorHandlerRes(error, res);
    }
  }
}

export default new AIController();