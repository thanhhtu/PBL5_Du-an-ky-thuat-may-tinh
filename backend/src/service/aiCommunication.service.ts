import fs from "fs"
import {io, Socket} from "socket.io-client"
class AICommunicationService {
    private socket : Socket;
    constructor(){
        // Initialize the socket connection to AI server
        this.socket = io("http://localhost:5000");
        this. socket.on("connect", () => {
            console.log("Connected to AI server");
        });
        this.socket.on("disconnect", () => {
            console.log("Disconnected from AI server");
        });
    }
    async sendAudioForTranscription(audioFilePath: string): Promise<string> {
        if (!fs.existsSync(audioFilePath)) {
          throw new Error(`File not found: ${audioFilePath}`);
        }
    
        const audioBuffer = fs.readFileSync(audioFilePath);
        console.log(`Sending audio file: ${audioFilePath} to AI server`);
    
        return new Promise((resolve, reject) => {
          this.socket.emit('transcribe_audio', {
            filename: audioFilePath.split('/').pop(),
            audio: audioBuffer,
          });
    
         // this.socket.once('transcription_complete', (data) => resolve(data.text));
         // Handle successful transcription
          this.socket.once('transcription_complete', (data) => {
            console.log("Received transcription result:", data);
            
            // Return the complete data object with command_code
            resolve(data);
          });
          this.socket.once('transcription_error', (error) => reject(new Error(error.message)));
    
          setTimeout(() => reject(new Error('Transcription request timed out')), 30000);
        });
      }
}
export default new AICommunicationService();