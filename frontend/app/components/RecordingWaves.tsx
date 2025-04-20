import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle } from 'react-native';
import { RecordingWavesProps , AnimatedValues } from '../types/index';

const RecordingWaves: React.FC<RecordingWavesProps> = ({
  isRecording,
  baseSize = 70,
  waveColor
}) => {
  
  const animatedValues = useRef<AnimatedValues>({
    wave1: new Animated.Value(0),
    wave2: new Animated.Value(0),
    wave3: new Animated.Value(0),
  }).current;

  useEffect(() => {
    if (isRecording) {
      startWaveAnimation();
    } else {
      resetWaveAnimation();
    }

    return () => {
      // Cleanup animations when component unmounts
      resetWaveAnimation();
    };
  }, [isRecording]);

  // Wave animation functions
  const startWaveAnimation = (): void => {
    // Reset values
    animatedValues.wave1.setValue(0);
    animatedValues.wave2.setValue(0);
    animatedValues.wave3.setValue(0);

    // Create sequential wave animations
    const createWaveAnimation = (value: Animated.Value): Animated.CompositeAnimation => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(value, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: false,
          }),
          Animated.timing(value, {
            toValue: 0,
            duration: 0,
            useNativeDriver: false,
          }),
        ])
      );
    };

    const wave1Animation = createWaveAnimation(animatedValues.wave1);
    const wave2Animation = Animated.sequence([
      Animated.delay(300),
      createWaveAnimation(animatedValues.wave2)
    ]);
    const wave3Animation = Animated.sequence([
      Animated.delay(600),
      createWaveAnimation(animatedValues.wave3)
    ]);

    Animated.parallel([
      wave1Animation,
      wave2Animation,
      wave3Animation
    ]).start();
  };

  const resetWaveAnimation = (): void => {
    // Stop all animations
    animatedValues.wave1.stopAnimation();
    animatedValues.wave2.stopAnimation();
    animatedValues.wave3.stopAnimation();
    
    // Reset values
    animatedValues.wave1.setValue(0);
    animatedValues.wave2.setValue(0);
    animatedValues.wave3.setValue(0);
  };

  // Dynamic styles for the wave circles
  const waveStyle = (animValue: Animated.Value, size: number, opacity: number): Animated.WithAnimatedObject<ViewStyle> => ({
    position: 'absolute',
    width: animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [baseSize, size],
    }),
    height: animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [baseSize, size],
    }),
    borderRadius: animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [baseSize / 2, size / 2],
    }),
    opacity: animValue.interpolate({
      inputRange: [0, 0.4, 1],
      outputRange: [0, opacity, 0],
    }),
    backgroundColor: waveColor,
    transform: [{ scale: animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 1.8],
    })}],
  });

  if (!isRecording) return null;

  return (
    <>
      <Animated.View style={waveStyle(animatedValues.wave1, baseSize * 1.8, 0.4)} />
      <Animated.View style={waveStyle(animatedValues.wave2, baseSize * 2.1, 0.3)} />
      <Animated.View style={waveStyle(animatedValues.wave3, baseSize * 2.4, 0.2)} />
    </>
  );
};

export default RecordingWaves;