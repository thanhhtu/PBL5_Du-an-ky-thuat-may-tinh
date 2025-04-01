import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import aiCommunicationService from '../../service/aiCommunication.service';
class AIService {
  async convertAudioToWav(inputFilePath: string, outputDir: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const outputFilePath = path.resolve(outputDir, 'audio.wav');

      // Tạo thư mục nếu chưa tồn tại
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // Chuyển đổi tệp m4a sang wav
      ffmpeg(inputFilePath)
        .toFormat('wav')
        .audioCodec('pcm_s16le')
        .audioFrequency(16000)
        .on('end', () => {
          console.log('Conversion completed:', outputFilePath);
          resolve(outputFilePath);
        })
        .on('error', (err) => {
          console.error('Error converting file:', err);
          reject(new Error('Failed to convert audio file'));
        })
        .save(outputFilePath);
    });
  }

  async transcribeAudio(filePath: string): Promise<string> {
    try {
      // Gửi tệp WAV đến dịch vụ xử lý phiên âm
      const transcription = await aiCommunicationService.sendAudioForTranscription(filePath);
      console.log('Transcription result:', transcription);

      // Dọn dẹp tệp sau khi xử lý
      fs.unlinkSync(filePath);

      return transcription;
    } catch (error) {
      console.error('Error during transcription:', error);
      throw new Error('Failed to transcribe audio');
    }
  }
}

export default new AIService();