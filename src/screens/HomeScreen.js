import React, { useState, useEffect } from 'react';
import { View, Text, Button, Dimensions, StyleSheet, Image } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import AudioRecoder from './AudioRecoder';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

function HomeScreen({ navigation }) {

    const requestPermissions = async () => {
        if (Platform.OS === 'android') {
            try {
                const recordAudioPermission = await request(PERMISSIONS.ANDROID.RECORD_AUDIO);
                const writeStoragePermission = await request(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE);
                const readStoragePermission = await request(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);

                if (
                    recordAudioPermission !== RESULTS.GRANTED ||
                    writeStoragePermission !== RESULTS.GRANTED ||
                    readStoragePermission !== RESULTS.GRANTED
                ) {
                    // alert('Permission Denied', 'You need to grant all permissions to use this feature.');
                }
            } catch (err) {
                console.warn(err);
            }
        } else if (Platform.OS === 'ios') {
            const micPermission = await request(PERMISSIONS.IOS.MICROPHONE);

            if (micPermission !== RESULTS.GRANTED) {
                alert('Permission Denied', 'You need to grant microphone permission to use this feature.');
            }
        }
    };

    useEffect(() => {
        requestPermissions();
    }, []);





    return (
        <LinearGradient
            colors={['#51020a', '#0a0001']} // Gradient colors
            style={styles.gradient}
        >
            <View style={{ height: windowHeight/1, paddingHorizontal: 15, paddingTop: 20,marginTop:20 }}>
                <Text style={{ color: "white", fontSize: 20, paddingTop: 7, fontWeight: '500' }}>Monday at 07:00 PM</Text>
                <Text style={{ color: "white", fontSize: 16, paddingTop: 7, fontWeight: '500' }}>01 July 2024</Text>
                
                <View style={{ alignItems: "center", height: windowHeight/5,marginTop:20 }}>
                    <Image resizeMode='contain' style={{ height: windowHeight/5, width:windowWidth/1.08 }} source={require("../images/pitch.png")} />
                </View>
                <AudioRecoder />
            </View>

            {/* <PitchVisualization pitchData={samplePitchData} /> */}

        </LinearGradient>
    );
}

export default HomeScreen;

const styles = StyleSheet.create({
    gradient: {
        height: windowHeight/1,
        justifyContent: 'center',
    },
    content: {
        // Your content styles here
    },
    text: {
        fontSize: 24,
        color: '#fff',
    },
    progressBar: {
        width: '80%',
        height: 40,
        marginVertical: 16,
    },
    progressLabel: {
        fontSize: 16,
        marginVertical: 8,
    },
});