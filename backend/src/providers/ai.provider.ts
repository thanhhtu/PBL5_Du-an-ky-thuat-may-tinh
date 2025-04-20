import fs from 'fs';
import { io, Socket } from 'socket.io-client';
import { errorHandlerFunc } from './errorHandler.provider';
import CustomError from './customError.provider';
import { StatusCodes } from 'http-status-codes';
import 'dotenv/config';
import connectAISocket from '../socket/connectAI.socket';

class AIProvider {
  private socket: Socket;

  constructor(){
    this.socket = io(process.env.AI_SERVER_URL);

    connectAISocket.onConnectAI(this.socket);
  }

  async sendAudioForTranscription(audioFilePath: string): Promise<string> {
    return errorHandlerFunc(async () => {
      if (!fs.existsSync(audioFilePath)) {
        throw new CustomError(StatusCodes.NOT_FOUND, `File not found: ${audioFilePath}`);
      }
  
      const audioBuffer = fs.readFileSync(audioFilePath);
      console.log(`Sending audio file: ${audioFilePath} to AI server`);
  
      const result = await connectAISocket.emitAudioAndWait(
        this.socket,
        audioFilePath,
        audioBuffer
      );

      return result;
    });
  }
}
export default new AIProvider();