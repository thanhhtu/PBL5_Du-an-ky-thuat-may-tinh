import { Socket } from 'socket.io-client';
import CustomError from '../providers/customError.provider';
import { StatusCodes } from 'http-status-codes';

class ConnectAISocket {
  onConnectAI(socket: Socket){
    socket.on('connect', () => {
      console.log('Connected to AI server');
    });
  
    socket.on('disconnect', () => {
      console.log('Disconnected from AI server');
    });
  }

  emitAudioAndWait(
    socket: Socket,
    audioFilePath: string,
    audioBuffer: Buffer
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      socket.emit('transcribe_audio', {
        filename: audioFilePath.split('/').pop(),
        audio: audioBuffer,
      });
  
      socket.once('transcription_complete', (data) => {
        console.log('Received transcription result:', data);
        resolve(data);
      });
  
      socket.once('transcription_error', (error) => {
        console.log('Received transcription error:', error);
        reject(new Error(error.message));
      });
  
      setTimeout(() => reject(
        new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, 'Transcription request timed out')
      ), 30000);
    });
  }
}

export default new ConnectAISocket();
