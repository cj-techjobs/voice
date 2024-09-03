import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ToastAndroid, Alert, TouchableOpacity, Animated, Dimensions, StyleSheet, Image, ActivityIndicator } from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import LinearGradient from 'react-native-linear-gradient';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import { api, API_BASE_URL } from '../apiHandler/api';
import AudioRecoder from './AudioRecoder';
import PitchVisualization from './PitchVisualization';
import CustomHeader from './CustomHeader';
import DocumentPicker from 'react-native-document-picker';
import Equalizer from '../components/EqualizerVoice';
import DragList, { DragListRenderItemInfo } from 'react-native-draglist';
import { useNavigation } from '@react-navigation/native';


const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const audioRecorderPlayer = new AudioRecorderPlayer();

const getFormattedTime = (millis) => {
  const minutes = Math.floor(millis / 60000);
  const seconds = ((millis % 60000) / 1000).toFixed(0);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};


const Recordings = () => {
  const [isNewRecording, setIsNewRecording] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [barHeights, setBarHeights] = useState(new Array(10).fill(0).map(() => new Animated.Value(0)));
  const [meteringData, setMeteringData] = useState([]);

  const [recordings, setRecordings] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(null);
  const [playingIndex, setPlayingIndex] = useState(null);
  const [loading, setLoading] = useState(null);
  const [homeLoading, setHomeLoading] = useState(false);
  const [recordTime, setRecordTime] = useState('00:00');
  const [pitchData, setPitchData] = useState([]);
  const [metering, setMetering] = useState(0);

  const navigation = useNavigation();

  useFocusEffect(
    React.useCallback(() => {
      fetchRecordings();
      console.log(API_BASE_URL);
      return () => {
        console.log('Screen is unfocused');
      };
    }, [isNewRecording])
  );

  const pickAudioFile = async () => {
    setIsModalVisible(false)
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.audio],
      });
      console.log("====document", res[0].uri);
      if (res) uploadRecording(res)
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // User cancelled the picker
      } else {
        throw err;
      }
    }
  };

  async function uploadRecording(res) {
    const formData = new FormData();
    formData.append('file', {
      uri: res[0].uri,
      type: res[0].type,
      name: res[0].name,
    });
    formData.append('fileName', res[0].name);
    formData.append('pitchData', []);
    formData.append('duration', res[0].size);
    try {
      const response = await api.post('/upload', formData);
      console.log(response.data);
      setTimeout(() => {
        setLoading(false);
        ToastAndroid.showWithGravity(
          response.data.message,
          ToastAndroid.SHORT,
          ToastAndroid.CENTER,
        );
      }, 300);

    } catch (error) {
      console.error(error);
      setTimeout(() => {
        setLoading(false);
      }, 300);
    }
  }

  const openNewRecording = () => {
    setIsNewRecording(!isNewRecording)
    setIsModalVisible(false)

  }

  const fetchRecordings = async () => {
    try {
      const response = await api.get('/recordings');
      setRecordings(response.data);
      console.log(response.data);
      setHomeLoading(false);
      // const stringArray = response.data[7].pitchData[0];

      // console.log("testing", stringArray); // Replace with your API endpoint
    } catch (err) {
      setHomeLoading(false);
      console.error(err)
    } finally {
      setHomeLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      audioRecorderPlayer.removeRecordBackListener();
      audioRecorderPlayer.stopRecorder();
    };
  }, []);


  const [currentIndex, setCurrentIndex] = useState(0);


  const rawData = `-27
 -16
 -13
 0
 -7
 -24
 -19
 -10
 -13
 -18
 -15
 -12
 -13
 -10
 -11
 -16
 -10
 -16
 -15
 -16
 -13
 -15
 -15
 -14
 -16
 -9
 -14
 -6
 -4
 -8
 -8
 -7
 -15
 -1
 -2
 -18
 -16
 -3
 -7
 -20
 -17
 -15
 -14
 -12
 0
 -14
 -22
 -11
 -16
 0
 0
 -22
 -22
 -1
 0
 0
 0
 -23
 -16
 -19
 -16
 -14
 -17
 -16
 -16
 -15
 -14
 -11
 -14
 -15
 -17
 -17
 -18
 -14
 -14
 -16
 -16
 -16
 -17
 -16
 -16
 -17
 -16
 -16
 -16
 -15
 -16
 -16
 -16
 -13
 -17
 -16
 -17
 -11
 -17
 -16
 -14
 -15
 -6
 -9
 -14
 -15
 -17
 -16
 -11
 -9
 -17
 -17
 -16
 -16
 -16
 -18
 -16
 -15
 -14
 -15
 -16
 -13
 -12
 -16`
  const items = rawData.split(/\s+/).map(Number);


  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % items.length;
          setMetering(items[nextIndex])
          setPitchData((prevData) => [...prevData, items[nextIndex]]);
          return nextIndex;
        });
      }, 480); // Runs every 2 seconds
      return () => clearInterval(interval); // Cleanup on component unmount
    }
  }, [isPlaying]);

  const onPlayPause = async (uri, index, pitchData) => {
    setLoading(index);
    setTimeout(() => {
      setLoading(null)
    }, 300);
    const serverUrl = `${API_BASE_URL}/recording/${recordings[index].file.filename}`;
    if (playingIndex === index && isPlaying) {
      await audioRecorderPlayer.pausePlayer();
      setPlayingIndex(null);
      setIsPlaying(false);
    } else {
      if (playingIndex !== null) {
        await audioRecorderPlayer.stopPlayer();
      }
      try {
        if (isPaused !== index) {
          setRecordTime("00:00")
          audioRecorderPlayer.stopPlayer();
          audioRecorderPlayer.removePlayBackListener();
        }
        audioRecorderPlayer.setVolume(1.0);
        await audioRecorderPlayer.startPlayer(serverUrl);
        startEqualizer(pitchData);

        audioRecorderPlayer.addPlayBackListener((e) => {
          setRecordTime(getFormattedTime(e.currentPosition));
          if (getFormattedTime(e.currentPosition) === getFormattedTime(e.duration)) {
            audioRecorderPlayer.stopPlayer();
            audioRecorderPlayer.removePlayBackListener();
            setIsPlaying(false);
            stopEqualizer();
          }
        });
      } catch (error) {
        console.error('Error during playback:', error);
      }
      setIsPlaying(true);
      setPlayingIndex(index);
      setIsPaused(index)
    }
  };


  const deleteRecording = async (id) => {
    setHomeLoading(true);
    try {
      const response = await api.delete(`/recording/${id}`);
      if (response) {
        fetchRecordings();
        setTimeout(() => {
          setHomeLoading(false);
          ToastAndroid.showWithGravity(
            response.data.message,
            ToastAndroid.SHORT,
            ToastAndroid.CENTER,
          );
        }, 300);
      } else {
        setHomeLoading(false);
      }
    } catch (error) {
      setHomeLoading(false);
      ToastAndroid.showWithGravity(
        error,
        ToastAndroid.SHORT,
        ToastAndroid.CENTER,
      );
    }
  };

  const confirmDelete = (id) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this recording?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: () => deleteRecording(id),
        },
      ],
      { cancelable: false }
    );
  };

  const onPressPlusIcon = () => {
    setIsModalVisible(!isModalVisible)
  }

  const startEqualizer = (rawData) => {
    // const items = rawData[0].split(',').map(Number);
    // setMeteringData(items);




    // console.log(rawData,"---------",items);

    barHeights.forEach((height, index) => {
      const animateBar = () => {
        Animated.sequence([
          Animated.timing(height, {
            toValue: Math.random() * 100, // Random height between 0 and 100
            duration: 300, // Duration of animation
            useNativeDriver: false,
          }),
          Animated.timing(height, {
            toValue: Math.random() * 100, // Another random height
            duration: 300,
            useNativeDriver: false,
          }),
        ]).start(animateBar); // Loop the animation
      };

      animateBar(); // Start the animation loop
    });
  };


  const onPressBarSegmentScreen=(item)=>{
    navigation.navigate('BarSegment', { itemData: item })
  }

  const stopEqualizer = () => {
    setBarHeights(Array(10).fill().map(() => new Animated.Value(10)));
  };

  function renderItem(info) {
    const { item, onDragStart, onDragEnd, index, isActive } = info;
    return (
      <TouchableOpacity
        key={item}
        onPress={() => onPressBarSegmentScreen(item)}
        onLongPress={onDragStart}
        onPressOut={onDragEnd}>
        <View style={styles.itemContainer}>
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: "center" }}>
            {isPlaying && playingIndex === index ? (
              <>
                {loading === index ?
                  <ActivityIndicator style={{ height: 40, width: 40 }} size='large' color="#51020a" />
                  :
                  <TouchableOpacity onPress={() => onPlayPause(item.filename, index, item.pitchData)} style={styles.playButton}>
                    <Image style={{ height: 40, width: 40 }} resizeMode='contain' source={require('../images/pauseButton.png')} />
                  </TouchableOpacity>
                }</>
            ) : (
              <>
                {loading === index ?
                  <ActivityIndicator style={{ height: 40, width: 40 }} size='large' color="#51020a" />
                  :
                  <TouchableOpacity onPress={() => onPlayPause(item.filename, index, item.pitchData)} style={styles.playButton}>
                    <Image style={{ height: 40, width: 40 }} resizeMode='contain' source={require('../images/playButton.png')} />
                  </TouchableOpacity>
                }
              </>
            )}
             <View style={{ height: 50, justifyContent: 'center' }}>
                <Text style={styles.recordingName}>{item.filename}</Text>
                {isPlaying && index === playingIndex ?
                  <Text style={styles.recordingDuration}>{recordTime} </Text>
                  :
                  <Text style={styles.recordingDuration}>{getFormattedTime(item.duration)} </Text>
                }
              </View>
          </View>

          <TouchableOpacity onPress={() => confirmDelete(item._id)} style={styles.deleteButton}>
            <Image style={{ height: 20, width: 20 }} tintColor={'white'} resizeMode='contain' source={require('../images/dots.png')} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    )
  };


  async function onReordered(fromIndex, toIndex) {
    const copy = [...recordings]; // Don't modify react data in-place
    const removed = copy.splice(fromIndex, 1);

    copy.splice(toIndex, 0, removed[0]); // Now insert at the new pos
    setRecordings(copy);
  }
  return (
    <>
      <CustomHeader
        title="Recordings"
        onPressPlusIcon={onPressPlusIcon}
        isModalVisible={isModalVisible}
        setIsModalVisible={setIsModalVisible}
        pickAudioFile={pickAudioFile}
        setIsNewRecording={openNewRecording}
        isNewRecording={isNewRecording}
      />
      <LinearGradient
        colors={['#51020a', '#0a0001']} // Gradient colors
        style={styles.container}
      >
        <View style={styles.container}>

          {isNewRecording || recordings.length === 0 ?
            <View style={{ height: windowHeight / 2.3 }}>
              <AudioRecoder
                setIsNewRecording={setIsNewRecording}
              />
            </View>
            :
            <>
              {recordings.length === 0 ? (
                <Text style={styles.noRecordsText}>No records found</Text>
              ) : (
                <>
                  {/* <FlatList
                    showsVerticalScrollIndicator={false}
                    data={recordings}
                    renderItem={renderItem}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.list}
                  /> */}
                  <DragList
                    data={recordings}
                    keyExtractor={(item) => item._id}
                    onReordered={onReordered}
                    renderItem={renderItem}
                  />
                </>
              )}

              {homeLoading && (
                <View style={styles.loaderContainer}>
                  <ActivityIndicator style={{ marginRight: 5 }} size='small' color="#51020a" />
                  <Text style={styles.loaderText}>Loading...</Text>
                </View>
              )}
            </>}
        </View>
      </LinearGradient>
    </>

  );
};

const styles = StyleSheet.create({
  container: {
    height: windowHeight,
    justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  list: {
    paddingBottom: windowHeight / 9,
    paddingTop: 20,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: windowHeight / 9,
    justifyContent: 'space-between',
    backgroundColor: '#050001',
    borderWidth: 0.5,
    borderColor: "grey",
    padding: 15,
    marginBottom: 8,
    borderRadius: 8,
    elevation: 2,
  },
  recordingName: {
    fontSize: 18,
    width: windowWidth / 1.5,
    paddingHorizontal: 7, marginLeft: 10,
    color: "white"
  },
  recordingDuration: {
    fontSize: 13,
    color: '#fff',
    paddingTop: 3,
    marginLeft: 17,
  },
  playButton: {
    borderRadius: 4,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
  },
  loaderContainer: {
    backgroundColor: 'white',
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    position: "absolute",
    alignItems: 'center',
    height: 40,
    borderRadius: 30,
    width: 120,
    elevation: 6
  },
  loaderText: {
    color: "#51020a",
    marginLeft: 5,
    fontSize: 16,
  },
  noRecordsText: {
    fontSize: 18,
    color: '#fff',
  },
});

export default Recordings;
