import React from 'react';
import { View, Text, StyleSheet, Dimensions, Image, TouchableOpacity } from 'react-native';
import Slider from '@react-native-community/slider';
import { getFormattedTime } from '../utils/helpers';
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;


const PlaybackSegments = ({ recordTime, currentPosition, duration, setIsRepeat, isRepeat, setSegmentEnd, handleRepeatPress }) => {
  return (
    <View style={{ flexDirection: 'row', justifyContent: "space-evenly", alignItems: 'center', marginTop: windowHeight / 80 }}>
      <TouchableOpacity onPress={() => { handleRepeatPress() }}>
        <Image tintColor={"white"} style={{ height: 20, width: 20, paddingHorizontal: 10 }} resizeMode='contain' source={!isRepeat ? require('../images/repeatFalse.png') : require('../images/repeatTrue.png')} />
      </TouchableOpacity>
      <Text style={{ color: "white", fontSize: 12 }}>{recordTime}</Text>
      <Slider
        style={styles.progressBar}
        value={currentPosition}
        minimumValue={0}
        maximumValue={duration}
        minimumTrackTintColor="#64030c"
        maximumTrackTintColor="White"
        thumbTintColor={"red"}
      // disabled
      />
      <Text style={{ color: "white", fontSize: 12 }}>{getFormattedTime(duration)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  progressBar: {
    width: windowWidth / 1.8,
    height: 40,
    transform: [{ scaleX: 1.09 }, { scaleY: 1.5 }]
  },
  progressLabel: {
    fontSize: 18,
    color: "white",
    fontWeight: "450",
    marginVertical: 8,
  },
});

export default PlaybackSegments;
