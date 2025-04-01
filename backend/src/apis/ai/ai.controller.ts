

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
        const transcription = await AIService.transcribeAudio(outputFilePath);

        // Trả về kết quả phiên âm
        res.json({ transcription });
        console.log('Transcription:', transcription);

        // Gửi lệnh điều khiển thiết bị (nếu cần)
        // ControlIoTService.controlDevice(1, transcription);

    } catch (error) {
     errorHandlerRes(error, res);
    }
  }
}

export default new AIController();