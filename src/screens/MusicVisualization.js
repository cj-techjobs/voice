import React, { useEffect, useState } from 'react';
import { View ,Animated } from 'react-native';
import Svg, { Line } from 'react-native-svg';

const MusicVisualization = ({ isPlaying }) => {
  const [animation, setAnimation] = useState(new Animated.Value(0));

  useEffect(() => {
    if (isPlaying) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(animation, {
            toValue: 100,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(animation, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      animation.stopAnimation();
    }
  }, [isPlaying]);

  return (
    <Svg height="100%" width="100%">
      <Line
        x1="10"
        y1="100"
        x2="10"
        y2={animation.interpolate({
          inputRange: [0, 100],
          outputRange: [100, 0],
        })}
        stroke="blue"
        strokeWidth="5"
      />
    </Svg>
  );
};

export default MusicVisualization;
