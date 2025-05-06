import { Audio, InterruptionModeIOS, InterruptionModeAndroid } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import axios, { AxiosInstance } from 'axios';
import { Platform } from 'react-native';

const SILENCE_THRESHOLD = -20; // dBFS threshold, adjust based on testing
const SILENCE_DURATION_THRESHOLD = 1000; // Stop recording after 2 seconds of silence

export interface AudioServiceCallbacks {
  onRecordingStart?: () => void;
  onRecordingStop?: () => void;
  onPermissionStatus?: (granted: boolean) => void;
  onError?: (error: Error) => void;
}

class AudioService {
  api: AxiosInstance;
  recordingRef: Audio.Recording | null = null;
  silenceTimerRef: NodeJS.Timeout | null = null;
  isStoppingRef: boolean = false;
  hasPermission: boolean = false;
  callbacks: AudioServiceCallbacks = {};

  constructor() {
    this.api = axios.create({
      baseURL: process.env.EXPO_PUBLIC_API_BASE_URL,
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
    console.log('AudioService initialized with base URL:', process.env.EXPO_PUBLIC_API_BASE_URL);
  }

  setCallbacks(callbacks: AudioServiceCallbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  // Handle errors by passing them to the callback if available, otherwise just throw them
  handleError(error: Error): void {
    if (this.callbacks.onError) {
      this.callbacks.onError(error);
    } else {
      throw error;
    }
  }

  isRecording(): boolean {
    return this.recordingRef !== null;
  }

  hasAudioPermission(): boolean {
    return this.hasPermission;
  }

  cleanup(): void {
    console.log('AudioService cleanup...');
    this.stopRecording(false).catch(err => console.error('Error during cleanup:', err));
    
    if (this.silenceTimerRef) {
      clearTimeout(this.silenceTimerRef);
      this.silenceTimerRef = null;
    }
  }

  async setupAudioPermissions(): Promise<boolean> {
    try {
      console.log('Requesting audio permissions...');
      const { status } = await Audio.requestPermissionsAsync();
      this.hasPermission = status === 'granted';
      console.log('Permission status:', status);

      if (this.callbacks.onPermissionStatus) {
        this.callbacks.onPermissionStatus(this.hasPermission);
      }

      if (status === 'granted') {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
          interruptionModeIOS: InterruptionModeIOS.DoNotMix,
          interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
          staysActiveInBackground: true,
        });
        console.log('Audio mode set');
      } else {
        throw new Error('Microphone access is needed to record audio');
      }
      
      return this.hasPermission;
    } catch (error) {
      console.error('Error setting up audio permissions/mode: ', error);
      this.handleError(error instanceof Error ? error : new Error(`Could not start recording: ${error}`));
      return false;
    }
  }

  onRecordingStatusUpdate = (status: Audio.RecordingStatus) => {
    if (!status.isRecording || this.isStoppingRef) {
      return;
    }

    if (status.metering === undefined) {
      return;
    }

    const metering = status.metering;
    console.log(`Audio level: ${metering.toFixed(2)} dBFS`);

    // If audio level is below threshold (silence detected)
    if (metering < SILENCE_THRESHOLD) {
      if (!this.silenceTimerRef) {
        console.log(`Silence detected at ${metering.toFixed(2)} dBFS. Starting silence timer...`);
        
        this.silenceTimerRef = setTimeout(() => {
          console.log(`Silence continued for ${SILENCE_DURATION_THRESHOLD}ms. Auto-stopping recording.`);
          this.stopRecording(true);
        }, SILENCE_DURATION_THRESHOLD);
      }
    } else {
      // If we hear sound again, clear the silence timer
      if (this.silenceTimerRef) {
        console.log(`Sound detected at ${metering.toFixed(2)} dBFS. Resetting silence timer.`);
        
        clearTimeout(this.silenceTimerRef);
        this.silenceTimerRef = null;
      }
    }
  };

  async startRecording(): Promise<boolean> {
    if (!this.hasPermission) {
      this.handleError(new Error('Microphone access is needed'));
      return false;
    }
    
    if (this.recordingRef) {
      console.warn('Start recording blocked: Already recording or recording object exists');
      return false;
    }

    // Notify recording started
    if (this.callbacks.onRecordingStart) {
      this.callbacks.onRecordingStart();
    }

    try {
      this.isStoppingRef = false;
      console.log('Preparing to record...');

      // Create the recording object first
      const recording = new Audio.Recording();
      this.recordingRef = recording; // Assign to ref IMMEDIATELY

      console.log('Recording object created. Preparing...');

      // Get base options from preset
      const baseOptions = Audio.RecordingOptionsPresets.HIGH_QUALITY;

      // Prepare recording with correct options structure
      await recording.prepareToRecordAsync({
        // Top-level Options
        isMeteringEnabled: true, // This is a top-level option

        // Android options
        android: {
          ...baseOptions.android,
          extension: '.m4a',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
        },
        // iOS options
        ios: {
          ...baseOptions.ios,
          extension: '.m4a',
          outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
          audioQuality: Audio.IOSAudioQuality.MAX,
        },
        // Web options
        web: {
          ...baseOptions.web,
          mimeType: 'audio/mp4',
        },
      });
      console.log('Recording prepared');

      // Set status update callback AFTER preparation succeeds
      recording.setOnRecordingStatusUpdate(this.onRecordingStatusUpdate);
      console.log('Status update callback set');

      // Start recording
      await recording.startAsync();
      console.log('Recording started successfully');
      return true;

    } catch (error) {
      console.error('Failed to start recording:', error);
      
      // Cleanup on start failure
      if (this.recordingRef) {
        console.warn('Attempting cleanup after failed recording start...');
        try {
          this.recordingRef.setOnRecordingStatusUpdate(null); // Remove callback if set
        } catch (cleanupError) {
          console.error('Minor error during start recording cleanup (removing callback):', cleanupError);
        } finally {
          this.recordingRef = null;
          if (this.callbacks.onRecordingStop) {
            this.callbacks.onRecordingStop();
          }
          console.log('Reset recording state after start failure');
        }
      }

      this.isStoppingRef = false; // Reset stopping flag
      if (this.silenceTimerRef) { // Clear silence timer if active
        clearTimeout(this.silenceTimerRef);
        this.silenceTimerRef = null;
      }
      
      this.handleError(error instanceof Error ? error : new Error('Could not start recording'));
      return false;
    }
  }
  
  async stopRecording(sendFile = true): Promise<void> {
    if (!this.recordingRef || this.isStoppingRef) {
      return;
    }

    this.isStoppingRef = true;
    console.log(`Stopping recording... Send file: ${sendFile}`);

    // Clear silence detection timer
    if (this.silenceTimerRef) {
      clearTimeout(this.silenceTimerRef);
      this.silenceTimerRef = null;
    }

    const currentRecording = this.recordingRef;
    let recordingUri = null;

    try {
      // Remove status update callback
      try {
        currentRecording.setOnRecordingStatusUpdate(null);
      } catch (e) {
        console.error('Error removing status callback:', e);
      }

      // Check if recording is active before stopping
      const status = await currentRecording.getStatusAsync();
      
      if (status.isRecording) {
        await currentRecording.stopAndUnloadAsync();
        console.log('Recording stopped successfully');
        recordingUri = currentRecording.getURI();
      } else {
        console.log('Recording was not active, just unloading');
        await currentRecording.stopAndUnloadAsync();
      }

      // Reset state
      this.recordingRef = null;
      
      // Notify recording stopped
      if (this.callbacks.onRecordingStop) {
        this.callbacks.onRecordingStop();
      }

      // Process the recorded file if requested
      if (recordingUri && sendFile) {
        console.log('Recording URI:', recordingUri);
        
        if (Platform.OS === 'android' || Platform.OS === 'ios') {
          await this.sendAudioToBackend(recordingUri);
        } else {
          // For web or other platforms
          const localUri = await this.convertBlobToFile(recordingUri);
          await this.sendAudioToBackend(localUri);
        }
      }

    } catch (error) {
      console.error('Error during stop recording:', error);
      
      // Reset state even on error
      this.recordingRef = null;
      if (this.callbacks.onRecordingStop) {
        this.callbacks.onRecordingStop();
      }
      
      this.handleError(error instanceof Error ? error : new Error('Failed to properly stop recording'));
    } finally {
      this.isStoppingRef = false;
    }
  }

  async convertBlobToFile(blobUri: string): Promise<string> {
    try {
      console.log('Converting blob URI to file...');
      const response = await fetch(blobUri);
      const blob = await response.blob();
      const reader = new FileReader();
      
      return new Promise((resolve, reject) => {
        reader.onloadend = async () => {
          const base64data = (reader.result as string).split(',')[1];
          const filePath = `${FileSystem.cacheDirectory}audio_recording_${Date.now()}.m4a`;
          
          try {
            await FileSystem.writeAsStringAsync(filePath, base64data, { encoding: FileSystem.EncodingType.Base64 });
            console.log('File saved:', filePath);
            resolve(filePath);
          } catch (writeError) {
            console.error('Error writing file:', writeError);
            reject(writeError);
          }
        };
        
        reader.onerror = (error) => {
          console.error('Error reading blob:', error);
          reject(error);
        };
        
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error converting blob to file:', error);
      throw error; // Let caller handle this error
    }
  }

  async sendAudioToBackend(filePath: string): Promise<void> {
    try {
      // Check if file exists
      const fileInfo = await FileSystem.getInfoAsync(filePath);
      if (!fileInfo.exists || fileInfo.isDirectory) {
        console.error(`File not found: ${filePath}`);
        throw new Error('Recording file is missing or invalid');
      }
      
      console.log(`Sending file: ${filePath}, Size: ${fileInfo.size} bytes`);
      
      const formData = new FormData();
      const audioFile = {
        uri: Platform.OS === 'android' ? filePath : filePath.replace('file://', ''),
        name: `recording_${Date.now()}.m4a`,
        type: 'audio/m4a',
      } as any;
  
      formData.append('audio', audioFile);
  
      console.log('Attempting to send audio to server...');
  
      const response = await this.api.post('/ai/transcribe', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
  
      console.log('Server Response:', response.status, response.data);
      return response.data;
  
    } catch (error: any) {
      console.error('Audio Upload Error Details:', error);
      
      let errorMessage = 'Failed to upload audio';
      
      // Check for specific error types and create appropriate error messages
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request took too long. Server might be busy or slow network connection';
      } else if (error.code === 'ENOTFOUND') {
        errorMessage = 'Could not find server. Check server address';
      } else if (error.code === 'ECONNREFUSED') {
        errorMessage = 'Server refused connection. Make sure server is running';
      } else if (error.response) {
        errorMessage = `Failed to process audio. Status: ${error.response.status}`;
      } else if (error.request) {
        errorMessage = 'Could not reach server. Check that server is running and you\'re on the same network';
      } else if (error.message) {
        errorMessage = `Failed to upload: ${error.message}`;
      }
      
      // Create and throw a new error with appropriate message
      throw new Error(errorMessage);
    }
  }
}

export default AudioService;