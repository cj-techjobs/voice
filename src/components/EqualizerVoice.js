import React, { useEffect, useRef, useState } from 'react';
import { Animated, View, StyleSheet, Dimensions, ScrollView } from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';

const windowWidth = Dimensions.get('window').width;
const audioRecorderPlayer = new AudioRecorderPlayer();

const Equalizer = ({ pitchData, currentPosition }) => {
    const scrollViewRef = useRef(null);
    const barAnimations = useRef(pitchData.map((item) => new Animated.Value(item))).current;

    useEffect(() => {
        const animateBars = () => {
            barAnimations.forEach((height, index) => {
                const animateBar = () => {
                    Animated.sequence([
                        Animated.timing(height, {
                            toValue: Math.random() * 30, // Random height between 0 and 100
                            duration: 1000,
                            useNativeDriver: false, // Disable native driver for height animation
                        }),
                        Animated.timing(height, {
                            toValue: Math.random() * 30, // Another random height
                            duration: 1000,
                            useNativeDriver: false,
                        }),
                    ]).start(animateBar); // Loop the animation
                };

                animateBar(); // Start the animation loop
            });
        };

        animateBars();
    }, [barAnimations]);


    useEffect(() => {
        const interval = setInterval(() => {
            if (scrollViewRef.current) {
                scrollViewRef.current.scrollTo({
                    x: currentPosition / 120, // Adjust scrolling speed
                    animated: true,
                })
            }
        }, 100); // Adjust the interval to control update frequency

        return () => clearInterval(interval);
    }, [currentPosition]);

    return (
        <ScrollView
            ref={scrollViewRef}
            horizontal
            // scrollEventThrottle={16}
            style={styles.scrollView}
            contentContainerStyle={styles.contentContainer}
        >
            {barAnimations && barAnimations.map((animatedValue, index) => (
                <Animated.View
                    key={index}
                    style={[styles.bar, { height: animatedValue }]}
                />
            ))}
        </ScrollView>
    );
};

// const Equalizer = ({metering}) => {
//     console.log("Equalizer",metering);
//     // Initialize animated values for each bar
//     const barHeights = useRef(
//         Array.from({ length: 100 }).map(() => new Animated.Value(0))
//     ).current;

//     useEffect(() => {
//         // Function to animate each bar in a loop
//         const animateBars = () => {
//             barHeights.forEach((height, index) => {
//                 const animateBar = () => {
//                     Animated.sequence([
//                         Animated.timing(height, {
//                             toValue: Math.random() * 50, // Random height between 0 and 100
//                             duration: 300,
//                             useNativeDriver: false, // Disable native driver for height animation
//                         }),
//                         Animated.timing(height, {
//                             toValue: Math.random() * 50, // Another random height
//                             duration: 300,
//                             useNativeDriver: false,
//                         }),
//                     ]).start(animateBar); // Loop the animation
//                 };

//                 animateBar(); // Start the animation loop
//             });
//         };

//         animateBars();
//     }, [barHeights]);

//     return (
//         <View style={styles.container}>
//             {barHeights.map((height, index) => (
//                 <EqualizerBar key={index} value={height} />
//             ))}
//         </View>
//     );
// };

const styles = StyleSheet.create({
    scrollView: {
        height: 60, // Set this according to your design
    },
    contentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor:'white',
        height:50
    },
    bar: {
        width: 4,
        backgroundColor: '#51020a',
        margin: 2,
    },
});

export default Equalizer;
