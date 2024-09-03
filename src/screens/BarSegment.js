import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, Dimensions, FlatList, StyleSheet } from 'react-native';
import CustomHeader from './CustomHeader';
import LinearGradient from 'react-native-linear-gradient';
import { getFormattedTime, onPause, onPlayPause } from '../utils/helpers';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import { useNavigation } from '@react-navigation/native';
import BarSegVoicePitch from './BarSegVoicePitch';
import Equalizer from '../components/EqualizerVoice';
import PitchVisualization from './PitchVisualization';
import PlaybackSegments from '../components/PlaybackSegments';
import { API_BASE_URL } from '../apiHandler/api';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const audioRecorderPlayer = new AudioRecorderPlayer();


const BarSegment = ({ route }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isSegement, setIsSegement] = useState(null);

    const [recordTime, setRecordTime] = useState('00:00');
    const [isRepeat, setIsRepeat] = useState(false);
    const [segmentStart, setSegmentStart] = useState(null); // Start time in seconds
    const [segmentEnd, setSegmentEnd] = useState(null); // End time in seconds
    const [repeatCount, setRepeatCount] = useState(0); // Counter for repeats
    const [maxRepeats, setMaxRepeats] = useState(3);


    const { itemData } = route.params || {};
    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentPosition, setCurrentPosition] = useState(0);

    const [currentSegment, setCurrentSegment] = useState(0);
    const [segments, setSegments] = useState([currentPosition]);
    const items = itemData.pitchData[0].split(',').map(Number);
    const [duration, setDuration] = useState(Number(itemData.duration));
    const [pitchData, setPitchData] = useState(items);
    const navigation = useNavigation();

    useEffect(() => {
        const unsubscribe = navigation.addListener('blur', () => {
            audioRecorderPlayer.stopPlayer();
            audioRecorderPlayer.removePlayBackListener();
        });

        return unsubscribe;
    }, [navigation]);



    const generateNewSegment = () => {
        if (currentSegment + 10 <= itemData.duration) {
            setSegments([...segments, currentPosition]);
            // setSegmentEnd(currentPosition)
            setCurrentSegment(currentSegment + 10);
            setCurrentIndex(currentIndex + 1)
        }
    };


    const handlePlayPause = (isPlay) => {
        setIsPlaying(!isPlaying);
        setIsSegement(isPlay)
        if (isPlay) {
            onPlayPause(itemData, setRecordTime, setCurrentPosition, audioRecorderPlayer, setIsPlaying)
        } else {
            onPause(audioRecorderPlayer);
        }

    };

    const handleSegementPlay = async (item) => {
        const serverUrl = `${API_BASE_URL}/recording/${itemData.file.filename}`;
        if (isPlaying) {
            await audioRecorderPlayer.pausePlayer();
        } else {
            await audioRecorderPlayer.startPlayer(serverUrl);
            handleSeek(item)
        }
    };
    const handleSeek = (item) => {
        if (audioRecorderPlayer && typeof item === 'number') {
            audioRecorderPlayer.seekToPlayer(item).catch((error) => {
                console.error('Failed to seek player:', error);
            });
        } else {
            console.error('audioRecorderPlayer is not initialized or item is invalid');
        }
    };

    const selectSegement = (item, index) => {
        setIsPlaying(false);
        setIsSegement(true)
        setCurrentIndex(index)
        setSegmentStart(item)
        handleSegementPlay(item);
        if (item < segments[index + 1]) {
            setSegmentEnd(segments[index + 1])
        } else {
            setSegmentEnd(segments[index - 1])
        }
    }

    const handleRepeatPress = () => {
        setIsRepeat(!isRepeat);
        if (isRepeat) {
            createRepeatSegment(segmentStart, segmentEnd);
        }
    };

    const createRepeatSegment = (start, end) => {
        const serverUrl = `${API_BASE_URL}/recording/${itemData.file.filename}`;
        console.log(start, "---------", end);
        audioRecorderPlayer.startPlayer(serverUrl);
        audioRecorderPlayer.seekToPlayer(start);
        audioRecorderPlayer.addPlayBackListener((e) => {
            if (e.currentPosition >= end) {
                audioRecorderPlayer.seekToPlayer(start); // Loop the segment
            }
        });
    };

    const renderItem = ({ item, index }) => (
        <TouchableOpacity onPress={() => selectSegement(item, index)} style={[styles.segmentContainer, index == currentIndex && {
            borderWidth: 0.5,
            borderColor: "white"
        }]}>
            {isPlaying && index == currentIndex ? (
                <Text style={styles.segmentTitle}>{index == currentIndex && getFormattedTime(item)} </Text>
            ) : (
                <Text style={styles.segmentTitle}>{getFormattedTime(item)}</Text>
            )}

        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <CustomHeader
                title={'Testing'}
                isModalVisible={false}
            />
            <LinearGradient
                colors={['#51020a', '#0a0001']} // Gradient colors
                style={styles.container}
            >
                <FlatList
                    data={segments}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContainer}
                />

                {(isPlaying || isSegement) && <View style={{ position: "absolute", bottom: windowHeight / 7, width: windowWidth / 1 }}>
                    <Equalizer
                        pitchData={pitchData}
                        currentPosition={currentPosition}
                    />
                </View>}
                <View style={{
                    backgroundColor: '#1c1c1c',
                    height: 100,
                    width: windowWidth / 1,
                    position: "absolute", bottom: 0
                }}>
                    <PlaybackSegments
                        currentPosition={currentPosition}
                        duration={duration}
                        recordTime={recordTime}
                        setIsRepeat={setIsRepeat}
                        isRepeat={isRepeat}
                        setSegmentEnd={setSegmentEnd}
                        handleRepeatPress={handleRepeatPress}
                    />
                </View>
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.controlButton}>
                        <Image tintColor={"white"} style={{ height: 25, width: 25 }} resizeMode='contain' source={require('../images/rewind.png')} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.controlButton} onPress={() => handlePlayPause(isPlaying ? false : true)}>
                        <Image style={{ height: 30, width: 30 }} resizeMode='contain' source={(isPlaying || isSegement) ? require('../images/pauseButton.png') : require('../images/playButton.png')} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.controlButton}>
                        <Image tintColor={"white"} style={{ height: 25, width: 25 }} resizeMode='contain' source={require('../images/musicNext.png')} />
                    </TouchableOpacity>
                </View>
                <View style={{ position: 'absolute', width: windowWidth / 5, right: 0, bottom: 0, alignItems: 'center', justifyContent: "center", backgroundColor: '#1c1c1c', height: 60 }}>
                    <TouchableOpacity onPress={generateNewSegment}>
                        <Image tintColor={"white"} style={{ height: 25, width: 25 }} resizeMode='contain' source={require('../images/cut.png')} />
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    segmentContainer: {
        padding: 10,
        borderRadius: 5,
        marginHorizontal: 3
    },
    segmentTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#f9f9f9'
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        width: windowWidth / 1.1,
        height: 60,
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        backgroundColor: '#1c1c1c',
        padding: 15,
    },
    controlButton: {
        padding: 10,
    },
    listContainer: {
        paddingVertical: 4
    },
});

export default BarSegment;
