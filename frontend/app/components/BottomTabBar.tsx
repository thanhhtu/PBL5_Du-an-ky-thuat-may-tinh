// import React, { useState, useEffect } from 'react';
// import { View, StyleSheet, TouchableOpacity, Image, Alert, Platform } from 'react-native';
// import { Audio } from 'expo-av';
// import * as FileSystem from 'expo-file-system';
// import axios from 'axios';
// import { COLORS } from '../constants/colors';

// // Get backend URL from environment variable
// const backendUrl = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://10.0.2.2:3000';

// interface BottomTabBarProps {
//   activeTab: number;
//   onTabChange: (index: number) => void;
// }

// const BottomTabBar: React.FC<BottomTabBarProps> = ({ activeTab, onTabChange }) => {
//   const [isRecording, setIsRecording] = useState(false);
//   const [recording, setRecording] = useState<Audio.Recording | null>(null);
//   const [hasPermission, setHasPermission] = useState(false);
  
//   useEffect(() => {
//     const getPermissions = async () => {
//       try {
//         const { status } = await Audio.requestPermissionsAsync();
//         setHasPermission(status === 'granted');

//         if (status === 'granted') {
//           await Audio.setAudioModeAsync({
//             allowsRecordingIOS: true,
//             playsInSilentModeIOS: true,
//           });
//         } else {
//           Alert.alert('Permission Required', 'Microphone access is needed.');
//         }
//       } catch (error) {
//         console.error('Permission error:', error);
//       }
//     };
//     getPermissions();
//   }, []);

//   const handleMicPress = async () => {
//     if (!hasPermission) {
//       Alert.alert('Permission Required', 'Microphone access is needed.');
//       return;
//     }
//     try {
//       if (!isRecording) {
//         const { recording: newRecording } = await Audio.Recording.createAsync(
//           Audio.RecordingOptionsPresets.HIGH_QUALITY
//         );
//         setRecording(newRecording);
//         setIsRecording(true);
//       } else {
//         if (!recording) return;

//         await recording.stopAndUnloadAsync();
//         const uri = recording.getURI();
//         setIsRecording(false);
//         setRecording(null);

//         if (uri) {
//           console.log('🎤 Recorded file URI:', uri);

//           // For mobile platforms, directly use the file URI
//           if (Platform.OS === 'android' || Platform.OS === 'ios') {
//             await sendAudioToBackend(uri);
//           } else {
//             // For web or other platforms
//             const localUri = await convertBlobToFile(uri);
//             console.log('📁 Converted local file:', localUri);
//             await sendAudioToBackend(localUri);
//           }
//         }
//       }
//     } catch (error) {
//       console.error('Recording error:', error);
//     }
//   };

//   const convertBlobToFile = async (blobUri: string): Promise<string> => {
//     try {
//       console.log('🔄 Converting blob:', blobUri);
  
//       const response = await fetch(blobUri);
//       const blob = await response.blob();
  
//       const filePath = `${FileSystem.cacheDirectory}audio_recording.m4a`;
//       const base64 = await blobToBase64(blob); // Convert blob to base64
  
//       await FileSystem.writeAsStringAsync(filePath, base64, { encoding: FileSystem.EncodingType.Base64 });
  
//       console.log('✅ File saved:', filePath);
//       return filePath;
//     } catch (error) {
//       console.error('❌ Error converting blob to file:', error);
//       throw error;
//     }
//   };
  
//   // Helper function to convert blob to base64
//   const blobToBase64 = (blob: Blob): Promise<string> => {
//     return new Promise((resolve, reject) => {
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         // Extract only the base64 data part (remove the data:audio/m4a;base64, prefix)
//         const base64data = (reader.result as string).split(',')[1];
//         resolve(base64data);
//       };
//       reader.onerror = reject;
//       reader.readAsDataURL(blob);
//     });
//   };
  
//   const sendAudioToBackend = async (filePath: string) => {
//     try {
//       const formData = new FormData();
      
//       // Create file object for FormData
//       const audioFile = {
//         uri: filePath,
//         name: `audio_${Date.now()}.m4a`,
//         type: 'audio/m4a',
//       } as any;
      
//       formData.append('audio', audioFile);
      
//       console.log('📤 Sending file:', filePath);
  
//       const response = await axios.post(`${backendUrl}/ai/transcribe`, formData, {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//         },
//       });
      
//       console.log('✅ Response:', response.data);
//       Alert.alert('Command', response.data.command);
//     } catch (error) {
//     //  console.error('❌ Upload error:', error.response?.data || error.message);
//       Alert.alert('Error', 'Failed to send audio.');
//     }
//   };
  
//   return (
//     <View style={styles.container}>
//       <TouchableOpacity 
//         style={styles.tabButton} 
//         onPress={() => onTabChange(0)}
//       >
//         <Image 
//           source={require('../assets/icons/home.png')} 
//           style={[styles.iconHome, activeTab === 0 && styles.activeIcon]} 
//         />
//       </TouchableOpacity>
      
//       <TouchableOpacity 
//         style={styles.micButton}
//         onPress={handleMicPress}
//       >
//         <Image 
//           source={require('../assets/icons/microphone.png')} 
//           style={[styles.micIcon, isRecording && styles.recordingIcon]} 
//         />
//       </TouchableOpacity>
      
//       <TouchableOpacity 
//         style={styles.tabButton} 
//         onPress={() => onTabChange(1)}
//       >
//         <Image 
//           source={require('../assets/icons/profile.png')} 
//           style={[styles.iconProfile, activeTab === 1 && styles.activeIcon]} 
//         />
//       </TouchableOpacity>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flexDirection: 'row',
//     height: 75,
//     backgroundColor: COLORS.white,
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     shadowColor: COLORS.black,
//     shadowOffset: { 
//       width: 0, 
//       height: -2 
//     },
//     shadowOpacity: 0.1,
//     shadowRadius: 10,
//     elevation: 10,
//     paddingHorizontal: 30,
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },

//   tabButton: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     flex: 1,
//   },

//   iconHome: {
//     width: 28.5,
//     height: 25,
//     opacity: 0.5,
//   },

//   iconProfile: {
//     width: 24,
//     height: 27,
//     opacity: 0.5,
//   },

//   activeIcon: {
//     opacity: 1,
//     tintColor: COLORS.lightGreen
//   },

//   micButton: {
//     width: 65,
//     height: 65,
//     borderRadius: 30,
//     backgroundColor: COLORS.green,
//     justifyContent: 'center',
//     alignItems: 'center',
//     shadowColor: COLORS.darkGreen,
//     shadowOffset: { 
//       width: 0, 
//       height: 4 
//     },
//     shadowOpacity: 0.2,
//     shadowRadius: 8,
//     elevation: 10,
//     marginBottom: 30,
//   },

//   micIcon: {
//     width: 20,
//     height: 30,
//     tintColor: COLORS.white,
//   },

//   recordingIcon: {
//     tintColor: COLORS.red,
//   },
// });

// export default BottomTabBar;






import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Alert, Platform } from 'react-native';
import { Audio, InterruptionModeIOS, InterruptionModeAndroid } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import axios from 'axios';
import { COLORS } from '../constants/colors';

const backendUrl = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://10.0.2.2:3000';
//const backendUrl = "http://127.0.0.1:3000";
console.log('Backend URL:', backendUrl);


// Silence detection configuration
const SILENCE_THRESHOLD = -40; // dBFS threshold, adjust based on testing
const SILENCE_DURATION_THRESHOLD = 2000; // Stop recording after 2 seconds of silence
const METERING_INTERVAL = 300; // Check audio level every 300ms

interface BottomTabBarProps {
  activeTab: number;
  onTabChange: (index: number) => void;
}

const BottomTabBar: React.FC<BottomTabBarProps> = ({ activeTab, onTabChange }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  const recordingRef = useRef<Audio.Recording | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isStoppingRef = useRef(false);

  useEffect(() => {
    const getPermissions = async () => {
      try {
        console.log('Requesting audio permissions...');
        const { status } = await Audio.requestPermissionsAsync();
        setHasPermission(status === 'granted');
        console.log('Permission status:', status);

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
          console.log('Audio mode set.');
        } else {
          Alert.alert('Permission Required', 'Microphone access is needed to record audio.');
        }
      } catch (error) {
        console.error('Error setting up audio permissions/mode:', error);
        Alert.alert('Error', 'Failed to configure audio settings.');
      }
    };
    getPermissions();

    return () => {
      console.log('BottomTabBar unmounting. Cleaning up...');
      stopRecordingLogic(false);
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
    };
  }, []);

  const onRecordingStatusUpdate = (status: Audio.RecordingStatus) => {
    if (!status.isRecording || isStoppingRef.current) {
      return;
    }

    // Check if metering is available
    if (status.metering === undefined) {
      return;
    }

    const metering = status.metering;
    console.log(`Audio level: ${metering.toFixed(2)} dBFS`);

    // If audio level is below threshold (silence detected)
    if (metering < SILENCE_THRESHOLD) {
      if (!silenceTimerRef.current) {
        console.log(`Silence detected at ${metering.toFixed(2)} dBFS. Starting silence timer...`);
        silenceTimerRef.current = setTimeout(() => {
          console.log(`Silence continued for ${SILENCE_DURATION_THRESHOLD}ms. Auto-stopping recording.`);
          stopRecordingLogic(true);
        }, SILENCE_DURATION_THRESHOLD);
      }
    } else {
      // If we hear sound again, clear the silence timer
      if (silenceTimerRef.current) {
        console.log(`Sound detected at ${metering.toFixed(2)} dBFS. Resetting silence timer.`);
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
    }
  };
  // const startRecordingLogic = async () => {
  //   if (!hasPermission) {
  //     Alert.alert('Permission Required', 'Microphone access is needed.');
  //     return;
  //   }
  //   if (isRecording || recordingRef.current) { // Giữ nguyên kiểm tra này
  //     console.warn("Start recording blocked: Already recording or recording object exists.");
  //     return;
  //   }

  //   setIsRecording(true); // Đặt state ngay lập tức

  //   try {
  //     isStoppingRef.current = false;
  //     console.log('Preparing to record...');

  //     // **KHỞI TẠO ĐỐI TƯỢNG GHI ÂM TRƯỚC**
  //     const recording = new Audio.Recording();
  //     recordingRef.current = recording; // Gán vào ref NGAY LẬP TỨC

  //     console.log('Recording object created. Preparing...');

  //     // Lấy các tùy chọn cơ bản từ preset
  //     const baseOptions = Audio.RecordingOptionsPresets.HIGH_QUALITY;

  //     // **CHUẨN BỊ GHI ÂM VỚI OPTIONS ĐÚNG**
  //     await recording.prepareToRecordAsync({
  //           // Android options
  //           android: {
  //               ...baseOptions.android,
  //               extension: '.m4a',
  //               outputFormat: Audio.AndroidOutputFormat.MPEG_4,
  //               audioEncoder: Audio.AndroidAudioEncoder.AAC,
  //           },
  //           // iOS options
  //           ios: {
  //               ...baseOptions.ios,
  //               extension: '.m4a',
  //               outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
  //               audioQuality: Audio.IOSAudioQuality.MAX,
  //           },
  //           // Web options
  //           web: {
  //              ...baseOptions.web,
  //               mimeType: 'audio/mp4',
  //           },
  //           // **CÁC TÙY CHỌN CẤP CAO NHẤT ĐÚNG**
  //           isMeteringEnabled: true,
  //           meteringIntervalMillis: METERING_INTERVAL // <-- SỬA TÊN Ở ĐÂY
  //       });
  //     console.log('Recording prepared.');

  //     // Gắn callback SAU KHI prepare thành công
  //     recording.setOnRecordingStatusUpdate(onRecordingStatusUpdate);
  //     console.log('Status update callback set.');

  //     // Bắt đầu ghi âm
  //     await recording.startAsync();
  //     console.log('Recording started successfully.');

  //   } catch (error) {
  //     console.error('Failed to start recording:', error);
  //     Alert.alert('Error', 'Could not start recording.');

  //     // Cleanup khi start thất bại (Giữ nguyên logic cleanup đã sửa)
  //     if (recordingRef.current) {
  //       console.warn("Attempting cleanup after failed recording start...");
  //       try {
  //         recordingRef.current.setOnRecordingStatusUpdate(null);
  //       } catch (cleanupError) {
  //         console.error("Minor error during start recording cleanup (removing callback):", cleanupError);
  //       } finally {
  //         recordingRef.current = null;
  //         setIsRecording(false);
  //         console.log("Reset recording state after start failure.");
  //       }
  //     } else {
  //        setIsRecording(false);
  //     }

  //     isStoppingRef.current = false;
  //     if (silenceTimerRef.current) {
  //       clearTimeout(silenceTimerRef.current);
  //       silenceTimerRef.current = null;
  //     }
  //   }
  // };

  const startRecordingLogic = async () => {
    if (!hasPermission) {
      Alert.alert('Permission Required', 'Microphone access is needed.');
      return;
    }
    if (isRecording || recordingRef.current) {
      console.warn("Start recording blocked: Already recording or recording object exists.");
      return;
    }

    setIsRecording(true); // Set state immediately

    try {
      isStoppingRef.current = false;
      console.log('Preparing to record...');

      // Create the recording object first
      const recording = new Audio.Recording();
      recordingRef.current = recording; // Assign to ref IMMEDIATELY

      console.log('Recording object created. Preparing...');

      // Get base options from preset
      const baseOptions = Audio.RecordingOptionsPresets.HIGH_QUALITY;

      // **PREPARE RECORDING WITH CORRECT OPTIONS STRUCTURE**
      await recording.prepareToRecordAsync({
        // **Top-level Options**
        isMeteringEnabled: true, // Correct: This is a top-level option

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
            // **** LIKELY FIX: TRY THIS NAME INSTEAD ****
            // audioMeteringInterval: METERING_INTERVAL, // Changed from meteringIntervalMillis
        },
        // Web options
        web: {
           ...baseOptions.web,
            mimeType: 'audio/mp4',
        },
    });
      console.log('Recording prepared.');

      // Set status update callback AFTER preparation succeeds
      recording.setOnRecordingStatusUpdate(onRecordingStatusUpdate);
      console.log('Status update callback set.');

      // Start recording
      await recording.startAsync();
      console.log('Recording started successfully.');

    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Could not start recording.');

      // Cleanup on start failure
      if (recordingRef.current) {
        console.warn("Attempting cleanup after failed recording start...");
        try {
          // No need to check for null again, already inside the if block
          recordingRef.current.setOnRecordingStatusUpdate(null); // Remove callback if set
        } catch (cleanupError) {
          console.error("Minor error during start recording cleanup (removing callback):", cleanupError);
        } finally {
          // Ensure ref and state are reset even if unload fails (though unload is not called here on failure)
          recordingRef.current = null;
          setIsRecording(false);
          console.log("Reset recording state after start failure.");
        }
      } else {
         // If ref was never assigned (error happened very early)
         setIsRecording(false);
      }

      isStoppingRef.current = false; // Reset stopping flag
      if (silenceTimerRef.current) { // Clear silence timer if active
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
    }
  };
  
  const stopRecordingLogic = async (sendFile = true) => {
    if (!recordingRef.current || isStoppingRef.current) {
      return;
    }

    isStoppingRef.current = true;
    console.log(`Stopping recording... Send file: ${sendFile}`);

    // Clear silence detection timer
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    const currentRecording = recordingRef.current;
    let recordingUri = null;

    try {
      // Remove status update callback
      try {
        currentRecording.setOnRecordingStatusUpdate(null);
      } catch (e) {
        console.error("Error removing status callback:", e);
      }

      // Check if recording is active before stopping
      const status = await currentRecording.getStatusAsync();
      
      if (status.isRecording) {
        await currentRecording.stopAndUnloadAsync();
        console.log('Recording stopped successfully.');
        recordingUri = currentRecording.getURI();
      } else {
        console.log('Recording was not active, just unloading.');
        await currentRecording.stopAndUnloadAsync();
      }

      // Reset state
      recordingRef.current = null;
      setIsRecording(false);

      // Process the recorded file if requested
      if (recordingUri && sendFile) {
        console.log('Recording URI:', recordingUri);
        
        if (Platform.OS === 'android' || Platform.OS === 'ios') {
          await sendAudioToBackend(recordingUri);
        } else {
          // For web or other platforms
          const localUri = await convertBlobToFile(recordingUri);
          await sendAudioToBackend(localUri);
        }
      }

    } catch (error) {
      console.error('Error during stop recording:', error);
      Alert.alert('Error', 'Failed to properly stop recording.');
      
      // Reset state even on error
      recordingRef.current = null;
      setIsRecording(false);
    } finally {
      isStoppingRef.current = false;
    }
  };

  const handleMicPress = async () => {
    if (isRecording) {
      await stopRecordingLogic(true);
    } else {
      await startRecordingLogic();
    }
  };

  const convertBlobToFile = async (blobUri: string): Promise<string> => {
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
      throw error;
    }
  };

  // const sendAudioToBackend = async (filePath: string) => {
  //   try {
  //     // Verify the file exists
  //     const fileInfo = await FileSystem.getInfoAsync(filePath);
  //     if (!fileInfo.exists || fileInfo.isDirectory) {
  //       console.error(`File not found: ${filePath}`);
  //       Alert.alert('Error', 'Recording file is missing or invalid.');
  //       return;
  //     }
      
  //     console.log(`Sending file: ${filePath}, Size: ${fileInfo.size} bytes`);

  //     const formData = new FormData();
  //     const audioFile = {
  //       uri: filePath,
  //       name: `recording_${Date.now()}.m4a`,
  //       type: 'audio/m4a',
  //     } as any;

  //     formData.append('audio', audioFile);

  //     Alert.alert('Processing...', 'Sending audio for transcription.');

  //     const response = await axios.post(`${backendUrl}/ai/transcribe`, formData, {
  //       headers: {},
  //       timeout: 30000,
  //     });

  //     console.log('Server Response:', response.status, response.data);
  //     Alert.alert('Command Received', response.data?.command || 'Processing complete.');

  //   } catch (error: any) {
  //     console.error('Audio Upload Error:', error);
      
  //     if (error.response) {
  //       Alert.alert('Server Error', `Failed to process audio. Status: ${error.response.status}`);
  //     } else if (error.request) {
  //       Alert.alert('Network Error', 'Could not reach the server. Please check your connection.');
  //     } else {
  //       Alert.alert('Error', `An error occurred: ${error.message}`);
  //     }
  //   }
  // };
  const sendAudioToBackend = async (filePath: string) => {
    try {
      // Kiểm tra xem file tồn tại không
      const fileInfo = await FileSystem.getInfoAsync(filePath);
      if (!fileInfo.exists || fileInfo.isDirectory) {
        console.error(`File not found: ${filePath}`);
        Alert.alert('Error', 'Recording file is missing or invalid.');
        return;
      }
      
      console.log(`Sending file: ${filePath}, Size: ${fileInfo.size} bytes`);
      console.log(`Using backend URL: ${backendUrl}`);
  
      const formData = new FormData();
      const audioFile = {
        uri: Platform.OS === 'android' ? filePath : filePath.replace('file://', ''),
        name: `recording_${Date.now()}.m4a`,
        type: 'audio/m4a',
      } as any;
  
      formData.append('audio', audioFile);
  
      // Không hiển thị alert ở đây để tránh chặn UI
      console.log('Attempting to send audio to server...');
  
      const response = await axios.post(`${backendUrl}/ai/transcribe`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000,
      });
  
      console.log('Server Response:', response.status, response.data);
      Alert.alert('Command Received', response.data?.command || 'Processing complete.');
  
    } catch (error: any) {
      console.error('Audio Upload Error Details:', error);
      
      // Kiểm tra xem có phải lỗi timeout không
      if (error.code === 'ECONNABORTED') {
        Alert.alert('Timeout Error', 'Request took too long. Server might be busy or slow network connection.');
        return;
      }
      
      // Kiểm tra xem có phải lỗi DNS không
      if (error.code === 'ENOTFOUND') {
        Alert.alert('Server Not Found', `Could not find server at ${backendUrl}. Check server address.`);
        return;
      }
  
      // Kiểm tra xem có phải lỗi kết nối bị từ chối không
      if (error.code === 'ECONNREFUSED') {
        Alert.alert('Connection Refused', `Server at ${backendUrl} refused connection. Make sure server is running.`);
        return;
      }
  
      // Xử lý các loại lỗi khác nhau
      if (error.response) {
        Alert.alert('Server Error', `Failed to process audio. Status: ${error.response.status}`);
      } else if (error.request) {
        Alert.alert('Network Error', `Could not reach server at ${backendUrl}. Check that server is running and you're on the same network.`);
      } else {
        Alert.alert('Error', `Failed to upload: ${error.message}`);
      }
    }
  };

  // Render component
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.tabButton}
        onPress={() => !isRecording && onTabChange(0)}
        disabled={isRecording}
      >
        <Image
          source={require('../assets/icons/home.png')}
          style={[styles.iconHome, activeTab === 0 && !isRecording && styles.activeIcon, isRecording && styles.disabledIcon]}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.micButton}
        onPress={handleMicPress}
        disabled={!hasPermission}
      >
        <Image
          source={require('../assets/icons/microphone.png')}
          style={[styles.micIcon, isRecording ? styles.recordingIcon : styles.idleIcon]}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tabButton}
        onPress={() => !isRecording && onTabChange(1)}
        disabled={isRecording}
      >
        <Image
          source={require('../assets/icons/profile.png')}
          style={[styles.iconProfile, activeTab === 1 && !isRecording && styles.activeIcon, isRecording && styles.disabledIcon]}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 75,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: -3
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 12,
    paddingHorizontal: 20,
    justifyContent: 'space-around',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: '100%',
  },
  iconHome: {
    width: 28,
    height: 28,
    opacity: 0.6,
  },
  iconProfile: {
    width: 26,
    height: 29,
    opacity: 0.6,
  },
  activeIcon: {
    opacity: 1,
    tintColor: COLORS.lightGreen,
  },
  disabledIcon: {
    opacity: 0.3,
    tintColor: COLORS.gray,
  },
  micButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.green,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    bottom: 25,
    shadowColor: COLORS.darkGreen,
    shadowOffset: {
      width: 0,
      height: 5
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 15,
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  micIcon: {
    width: 28,
    height: 32,
  },
  idleIcon: {
    tintColor: COLORS.white,
  },
  recordingIcon: {
    tintColor: COLORS.red,
  },
});

export default BottomTabBar;