import React, { useState, useEffect } from 'react';
import { View, Text, Button, Dimensions, StyleSheet, Image } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import AudioRecoder from './AudioRecoder';
import { useFocusEffect } from '@react-navigation/native';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const getCurrentDateTime = () => {
    const currentDate = new Date();
  
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDay = days[currentDate.getDay()];
  
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const currentDayOfMonth = currentDate.getDate();
  
    const currentHours = currentDate.getHours();
    const currentMinutes = currentDate.getMinutes();
    const currentSeconds = currentDate.getSeconds();
  
    const ampm = currentHours >= 12 ? 'PM' : 'AM';

    // Convert hours to 12-hour format
    const hours12 = currentHours % 12;
    const displayHours = hours12 === 0 ? 12 : hours12;


    const formattedDate = `${currentMonth}/${currentDayOfMonth}/${currentYear}`;
    const formattedTime = `${currentDay},  ${displayHours}:${currentMinutes}:${currentSeconds} ${ampm}`;
  
    return { formattedDate, formattedTime };
  };

function HomeScreen({ navigation }) {

    const { formattedDate, formattedTime } = getCurrentDateTime();
    const [currentTime,setCurrentTime]= useState(formattedTime);
    const [currentDate,setCurrentDate]= useState(formattedDate);

    useFocusEffect(
        React.useCallback(() => {
         return () => {
            setCurrentTime(formattedTime)
            setCurrentDate(formattedDate)
            console.log('Screen is unfocused');
          };
        }, [])
      );

    console.log(`Current Date: ${formattedDate}`);
    console.log(`Current Time: ${formattedTime}`);


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
                <Text style={{ color: "white", fontSize: 20, paddingTop: 7, fontWeight: '500' }}>{currentTime}</Text>
                <Text style={{ color: "white", fontSize: 16, paddingTop: 7, fontWeight: '500' }}>{currentDate}</Text>
                
                <AudioRecoder />
            </View>
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