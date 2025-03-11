// import React, { useState } from 'react';
// import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
// import { Device } from '../types';

// const DeviceCard: React.FC<{ device: Device }> = ({ device }) => {
//   const [isActive, setIsActive] = useState(device.isActive);
  
//   const handleToggle = () => {
//     const newState = !isActive;
//     setIsActive(newState);
//     // Call parent callback if provided
//     if (device.onToggle) {
//       device.onToggle(device.id, newState);
//     }
//   };
  
//   return (
//     <View style={[
//       styles.container, 
//       isActive ? styles.activeContainer : styles.inactiveContainer
//     ]}>
//       <View style={styles.subContainer}>
//         <View style={styles.iconContainer}>
//           <Image source={device.state} style={styles.icon} resizeMode="contain" />
//         </View>
        
//         <TouchableOpacity 
//           style={styles.toggleContainer}
//           onPress={handleToggle}
//           activeOpacity={0.8}
//         >
//           <View style={[
//             styles.toggleTrack, 
//             isActive ? styles.activeToggleTrack : styles.inactiveToggleTrack
//           ]}>
//             <View style={[
//               styles.toggleThumb, 
//               isActive ? styles.activeToggleThumb : styles.inactiveToggleThumb
//             ]} />
//           </View>
//         </TouchableOpacity>
//       </View>

//       <View style={styles.contentContainer}>
//         <Text style={styles.title}>{device.name}</Text>
//         <Text style={styles.subtitle}>{device.label}</Text>
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     borderRadius: 16,
//     padding: 20,
//     height: 150,
//     marginBottom: 20,
//     // flexDirection: 'row',
//     // alignItems: 'center',
//     width: '47%', // Slightly smaller to ensure proper spacing
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.1,
//     shadowRadius: 3,
//     elevation: 3,
//   },
//   activeContainer: {
//     backgroundColor: '#F9BA59', // Orange/yellow for Smart AC
//   },
//   inactiveContainer: {
//     backgroundColor: '#FFFFFF', // White for inactive/Smart TV
//   },
//   iconContainer: {
//     width: 48,
//     height: 48,
//     borderRadius: 10,
//     backgroundColor: '#FFFFFF',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 12,
//   },

//   subContainer: {
//     flexDirection: 'row',
//   },

//   icon: {
//     width: 28,
//     height: 28,
//   },
//   contentContainer: {
//     // flex: 2,
//     // marginRight: 8,
//   },
//   title: {
//     fontSize: 17,
//     fontWeight: 'bold',
//     color: '#000000',
//     marginBottom: 4,
//   },
//   subtitle: {
//     fontSize: 14,
//     color: '#666666',
//   },
//   toggleContainer: {
//     width: 48,
//     height: 24,
//     justifyContent: 'center',
//   },
//   toggleTrack: {
//     width: 44,
//     height: 24,
//     borderRadius: 12,
//     justifyContent: 'center',
//   },
//   activeToggleTrack: {
//     backgroundColor: '#D9F9FE', // Light blue background for active track
//   },
//   inactiveToggleTrack: {
//     backgroundColor: '#E0E0E0', // Light gray for inactive track
//   },
//   toggleThumb: {
//     width: 18,
//     height: 18,
//     borderRadius: 9,
//     position: 'absolute',
//   },
//   activeToggleThumb: {
//     backgroundColor: '#56D9E9', // Teal color for active toggle
//     right: 3,
//   },
//   inactiveToggleThumb: {
//     backgroundColor: '#FFFFFF', // White thumb for inactive toggle
//     left: 3,
//     borderWidth: 0.5,
//     borderColor: '#CCCCCC',
//   },
// });

// export default DeviceCard;

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Device, DeviceCardProps, DeviceState } from '../types';

const DeviceCard: React.FC<DeviceCardProps> = ({ device, onToggle }) => {
  const isActive = device.state === DeviceState.ON;
  
  const handleToggle = () => {
    onToggle(device.id, isActive ? DeviceState.OFF : DeviceState.ON);
  };
  
  // Helper function to generate a placeholder icon based on device name
  const getDeviceIcon = () => {
    const name = device.name.toLowerCase();
    if (name.includes('light')) {
      return require('../assets/images/devices/light.png'); // Make sure you have these images
    } else if (name.includes('ac') || name.includes('air')) {
      return require('../assets/images/devices/ac.png');
    } else if (name.includes('tv') || name.includes('television')) {
      return require('../assets/images/devices/tv.png');
    } else if (name.includes('fan')) {
      return require('../assets/images/devices/fan.png');
    }
    return require('../assets/images/devices/default.png'); // Default icon
  };
  
  return (
    <View style={[
      styles.container, 
      isActive ? styles.activeContainer : styles.inactiveContainer
    ]}>
      <View style={styles.subContainer}>
        <View style={styles.iconContainer}>
          {/* Use image from API if it's valid, otherwise use placeholder */}
          <Image 
            source={getDeviceIcon()} 
            style={styles.icon} 
            resizeMode="contain" 
          />
        </View>
        
        <TouchableOpacity 
          style={styles.toggleContainer}
          onPress={handleToggle}
          activeOpacity={0.8}
        >
          <View style={[
            styles.toggleTrack, 
            isActive ? styles.activeToggleTrack : styles.inactiveToggleTrack
          ]}>
            <View style={[
              styles.toggleThumb, 
              isActive ? styles.activeToggleThumb : styles.inactiveToggleThumb
            ]} />
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.title}>{device.name}</Text>
        <Text style={styles.subtitle}>{device.label}</Text>
        <Text style={[
          styles.status, 
          isActive ? styles.activeStatus : styles.inactiveStatus
        ]}>
          {isActive ? DeviceState.ON : DeviceState.OFF}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 20,
    height: 150,
    marginBottom: 20,
    width: '47%', // Slightly smaller to ensure proper spacing
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  activeContainer: {
    backgroundColor: '#F9BA59', // Orange/yellow for active devices
  },
  inactiveContainer: {
    backgroundColor: '#FFFFFF', // White for inactive devices
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  subContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  icon: {
    width: 28,
    height: 28,
  },
  contentContainer: {
    marginTop: 5,
  },
  title: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  status: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  activeStatus: {
    color: '#2E7D32', // Dark green for ON
  },
  inactiveStatus: {
    color: '#C62828', // Dark red for OFF
  },
  toggleContainer: {
    width: 48,
    height: 24,
    justifyContent: 'center',
  },
  toggleTrack: {
    width: 44,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
  },
  activeToggleTrack: {
    backgroundColor: '#D9F9FE', // Light blue background for active track
  },
  inactiveToggleTrack: {
    backgroundColor: '#E0E0E0', // Light gray for inactive track
  },
  toggleThumb: {
    width: 18,
    height: 18,
    borderRadius: 9,
    position: 'absolute',
  },
  activeToggleThumb: {
    backgroundColor: '#56D9E9', // Teal color for active toggle
    right: 3,
  },
  inactiveToggleThumb: {
    backgroundColor: '#FFFFFF', // White thumb for inactive toggle
    left: 3,
    borderWidth: 0.5,
    borderColor: '#CCCCCC',
  },
});

export default DeviceCard;