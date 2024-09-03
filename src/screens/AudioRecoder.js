import React, { useState, useEffect, useRef } from 'react';
import { View, ToastAndroid, StyleSheet, Dimensions, Image, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import Slider from '@react-native-community/slider';
import RNFS from 'react-native-fs';
import RecordingModal from './RecordingSaveModal';
import { api } from '../apiHandler/api';
import PitchVisualization from './PitchVisualization';
import { YIN } from 'pitchfinder';
import { mediaDevices } from 'react-native-webrtc';


const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
const audioRecorderPlayer = new AudioRecorderPlayer();

const getFormattedTime = (millis) => {
    const minutes = Math.floor(millis / 60000);
    const seconds = ((millis % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};


const App = ({setIsNewRecording}) => {
    const [loading, setLoading] = useState(false);
    const [recordSecs, setRecordSecs] = useState(0);
    const [recordTime, setRecordTime] = useState('00:00');
    const [recordingName, setRecordingName] = useState("");
    const [duration, setDuration] = useState('00:00');
    const [isRecording, setIsRecording] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const maxRecordingDuration = 60000; // 2 minutes in milliseconds
    const [recordingDuration, setRecordingDuration] = useState(0); // Duration in milliseconds
    const [isSave, setIsSave] = useState(false);
    const [fileUri, setFileUri] = useState();
    const [recordingPath, setRecordingPath] = useState();
    const [pitchData, setPitchData] = useState([]);
    const [isUploaded, setIsUploaded] = useState(false);
    const [metering, setMetering] = useState(0);
    const [meteringData, setMeteringData] = useState([]);

    const intervalRef = useRef(null); // Reference for the interval timer
    const yin = new YIN();


    useEffect(() => {
        return () => {
            clearInterval(intervalRef.current);
            audioRecorderPlayer.removeRecordBackListener();
            audioRecorderPlayer.stopRecorder();
            if (isRecording) {
                onStopRecord();
            }
        };
    }, []);




    const onStartRecord = async () => {
        setIsPaused(false);
        setIsRecording(true);
        const urlPath = `${RNFS.DocumentDirectoryPath}/recording.mp3`;
        const audioSet = {
            AudioEncoderAndroid: 3, // or another encoder
            OutputFormatAndroid: 2,
            AudioSourceAndroid: 1,
            AVEncoderAudioQualityKeyIOS: 'high',
            AVNumberOfChannelsKeyIOS: 2,
            AVFormatIDKeyIOS: 'aac',
        };
        const meteringEnabled = true;

        try {
            const result = await audioRecorderPlayer.startRecorder(urlPath, audioSet, meteringEnabled);
            console.log(urlPath, 'Recording started:', result);
            setFileUri(result)
            setRecordingPath(result);

        } catch (error) {
            console.error('Error starting recording:', error);
        }
        var tempArray = [];
        tempArray.push
        audioRecorderPlayer.addRecordBackListener((e) => {
            setRecordSecs(e.currentPosition);
            setRecordTime(getFormattedTime(e.currentPosition));
            setDuration(e.currentPosition);
            const pitch = calculatePitch(e.currentMetering);
            setMetering(pitch)
            // tempArray.push(pitch)
            setPitchData((prevData) => [...prevData, pitch]);
            // setMeteringData(tempArray)
            setMeteringData((prevValues) => [...prevValues, pitch]);
            if (e.currentPosition >= maxRecordingDuration) {
                onStopRecord();
            }
            return;
        });

    };

      

    const pauseRecording = async () => {
        console.log("pauseRecording");
        setIsPaused(true);
        setIsRecording(false);
        await audioRecorderPlayer.pauseRecorder();
        clearInterval(intervalRef.current); // Stop the timer

    };

    const resumeRecording = async () => {
        console.log("resumeRecording");
        setIsPaused(false);
        setIsRecording(true);
        await audioRecorderPlayer.resumeRecorder();
        startTimer(); // Restart the timer

    };


    const onStopRecord = async (stopped) => {
        // if (!recordingPath) {
        //     setRecordingPath('')
        //     return
        // }
        setIsRecording(false);
        setIsPaused(false);
        clearInterval(intervalRef.current);
        const result = await audioRecorderPlayer.stopRecorder();
        audioRecorderPlayer.removeRecordBackListener();
        if (stopped) {
            setRecordSecs(0);
            setRecordTime(0)
        }
        setIsSave(false)
        console.log(`Recording stopped: ${result}`);
    };


    const startTimer = () => {
        intervalRef.current = setInterval(() => {
            setRecordingDuration((prevDuration) => {
                const newDuration = prevDuration + 1000; // Increment by 1 second
                if (newDuration >= maxRecordingDuration) {
                    stopRecording();
                    return maxRecordingDuration;
                }
                return newDuration;
            });
        }, 1000);
    };

    const saveModal = () => {
        if (recordingPath) setIsSave(true)
    }

    async function uploadRecording() {
        onStopRecord();
        setRecordingName('');
        setLoading(true);
        const formData = new FormData();
        formData.append('file', {
            uri: fileUri,
            type: 'audio/mp3',
            name: 'recording.mp3',
        });
        formData.append('fileName', recordingName);
        formData.append('pitchData', meteringData);
        formData.append('duration', duration);
        try {
            const response = await api.post('/upload', formData);
            console.log(response.data);
            setRecordSecs(0);
            setRecordTime(0)
            setIsSave(false)
            setIsNewRecording(true)
            setTimeout(() => {
                setLoading(false);
                setIsUploaded(true)
                ToastAndroid.showWithGravity(
                    response.data.message,
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER,
                );
            }, 300);

        } catch (error) {
            console.error(error);
            setIsSave(false)
            setTimeout(() => {
                setLoading(false);
            }, 300);
        }
    }


    const calculatePitch = (metering) => {
        const data = Array(50).fill(metering);
        return Math.max(...data);
    };

    return (
        <View style={styles.container}>
            <View style={{ height: windowHeight / 4, marginTop: windowHeight / 5, justifyContent: 'center', alignItems: 'center' }}>
                <PitchVisualization data={pitchData} isRecording={isRecording} metering={metering} isUploaded={isUploaded} />
            </View>
            <View style={{ justifyContent: "center", alignItems: 'center', marginTop: windowHeight / 80 }}>
                {/* <Text style={styles.progressLabel}>{"Audio"}</Text> */}
                <Slider
                    style={styles.progressBar}
                    value={recordSecs}
                    minimumValue={0}
                    maximumValue={maxRecordingDuration}
                    minimumTrackTintColor="#64030c"
                    maximumTrackTintColor="White"
                    thumbTintColor={"red"}

                // disabled
                />

                <View style={{ flexDirection: "row", width: windowWidth / 1.11, justifyContent: "space-between", bottom: 2 }}>
                    <Text style={{ color: "white" }}>{recordTime}</Text>
                    <Text style={{ color: "white" }}>{getFormattedTime(maxRecordingDuration)}</Text>
                </View>

                <View style={styles.buttonContainer}>

                    <TouchableOpacity onPress={() => onStopRecord(true)}>
                        <Image style={{ height: 25, width: 25 }} tintColor={'white'} resizeMode='contain' source={require('../images/cross.png')} />
                    </TouchableOpacity>

                    {isRecording ? (
                        <TouchableOpacity onPress={pauseRecording}>
                            <Image style={{ height: 60, width: 60 }} resizeMode='contain' source={require('../images/pauseButton.png')} />
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity onPress={isPaused ? resumeRecording : onStartRecord}>
                            <Image style={{ height: 60, width: 60 }} resizeMode='contain' source={!isPaused ? require('../images/playButton.png') : require('../images/resumeButton.png')} />
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity onPress={() => { saveModal() }}>
                        <Image style={{ height: 25, width: 25 }} tintColor={'white'} resizeMode='contain' source={require('../images/check.png')} />
                    </TouchableOpacity>

                </View>
                {isSave &&
                    <RecordingModal
                        setRecordingName={setRecordingName}
                        recordingName={recordingName}
                        uploadfiles={uploadRecording}
                        setIsSave={setIsSave}
                    />}

                {loading && (
                    <View style={styles.loaderContainer}>
                        <ActivityIndicator style={{ marginRight: 5 }} size='small' color="#51020a" />
                        <Text style={styles.loaderText}>Loading...</Text>
                    </View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: windowHeight / 5,
        justifyContent: 'center',
        alignItems: 'center',
        // marginTop:windowHeight/9,
        padding: 16,
    },
    progressBar: {
        width: windowWidth / 1.1,
        height: 40,
        transform: [{ scaleX: 1.09 }, { scaleY: 1.5 }]
    },
    progressLabel: {
        fontSize: 18,
        color: "white",
        fontWeight: "450",
        marginVertical: 8,
    },
    buttonContainer: {
        height: windowHeight / 9, paddingTop: 15,
        width: windowWidth / 1.5, alignItems: 'center',
        flexDirection: 'row', justifyContent: "space-between"
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
});

export default App;
