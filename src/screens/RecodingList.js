import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ToastAndroid, Alert, TouchableOpacity, Dimensions, StyleSheet, Image, ActivityIndicator } from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import LinearGradient from 'react-native-linear-gradient';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import MusicVisualization from './MusicVisualization';
import { api, API_BASE_URL } from '../apiHandler/api';


const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const audioRecorderPlayer = new AudioRecorderPlayer();

const getFormattedTime = (millis) => {
  const minutes = Math.floor(millis / 60000);
  const seconds = ((millis % 60000) / 1000).toFixed(0);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};


const Recordings = () => {
  const [recordings, setRecordings] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(null);
  const [playingIndex, setPlayingIndex] = useState(null);
  const [loading, setLoading] = useState(null);
  const [homeLoading, setHomeLoading] = useState(false);
  const [recordTime, setRecordTime] = useState('00:00');

  useFocusEffect(
    React.useCallback(() => {
      fetchRecordings();
      console.log(API_BASE_URL);
      return () => {
        console.log('Screen is unfocused');
      };
    }, [])
  );

  const fetchRecordings = async () => {
    try {
      const response = await api.get('/recordings');
      setRecordings(response.data);
      console.log(response.data);
      setHomeLoading(false);
      console.log("testing", response.data); // Replace with your API endpoint
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

  const onPlayPause = async (uri, index) => {
    setLoading(index);
    setTimeout(() => {
      setLoading(null)
    }, 300);

    const serverUrl =`${API_BASE_URL}/recording/${recordings[index].file.filename}`;
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
        await audioRecorderPlayer.startPlayer(serverUrl);
        audioRecorderPlayer.addPlayBackListener((e) => {
          setRecordTime(getFormattedTime(e.currentPosition));
          if (getFormattedTime(e.currentPosition) === getFormattedTime(e.duration)) {
            audioRecorderPlayer.stopPlayer();
            audioRecorderPlayer.removePlayBackListener();
            setIsPlaying(false);
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


  const renderItem = ({ item, index }) => (
    <View style={styles.itemContainer}>
      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: "center" }}>
        {isPlaying && playingIndex === index ? (
          <>
            {loading === index ?
              <ActivityIndicator style={{ height: 40, width: 40 }} size='large' color="#51020a" />
              :
              <TouchableOpacity onPress={() => onPlayPause(item.filename, index)} style={styles.playButton}>
                <Image style={{ height: 40, width: 40 }} resizeMode='contain' source={require('../images/pauseButton.png')} />
              </TouchableOpacity>
            }</>
        ) : (
          <>
            {loading === index ?
              <ActivityIndicator style={{ height: 40, width: 40 }} size='large' color="#51020a" />
              :
              <TouchableOpacity onPress={() => onPlayPause(item.filename, index)} style={styles.playButton}>
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
        {/* <View style={{ height: 100, marginTop: 10 }}>
            <MusicVisualization isPlaying={true} />
        </View> */}
      </View>
      <TouchableOpacity onPress={() => confirmDelete(item._id)} style={styles.deleteButton}>
        <Image style={{ height: 20, width: 20 }} tintColor={'white'} resizeMode='contain' source={require('../images/dots.png')} />
      </TouchableOpacity>
    </View>
  );

  return (
    <LinearGradient
      colors={['#51020a', '#0a0001']} // Gradient colors
      style={styles.container}
    >
      <View style={styles.container}>

        {recordings.length === 0 ? (
          <Text style={styles.noRecordsText}>No records found</Text>
        ) : (
          <FlatList
            showsVerticalScrollIndicator={false}
            data={recordings}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
          />
        )}

        {homeLoading && (
          <View style={styles.loaderContainer}>
            <ActivityIndicator style={{ marginRight: 5 }} size='small' color="#51020a" />
            <Text style={styles.loaderText}>Loading...</Text>
          </View>
        )}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    height: windowHeight / 1,
    justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  list: {
    paddingBottom: windowHeight / 5,
    paddingTop: 15,
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
