import React, { useState, useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

const BarSegVoicePitch = ({metering}) => {
  const animatedHeight = useRef(new Animated.Value(2)).current;

  useEffect(() => {
    Animated.timing(animatedHeight, {
      toValue: Math.max(2, metering * 2),
      duration: 100,
      useNativeDriver: false,
    }).start();
  }, [metering]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.bar, { height: 100 }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 400,
    width: '100%',
    padding: 10,
    backgroundColor: '#fff',
  },
  bar: {
    width: 4,
    backgroundColor: '#0f0',
    margin: 2,
  },
});

export default BarSegVoicePitch;
