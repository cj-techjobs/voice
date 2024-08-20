import React from 'react';
import { View, Text, StyleSheet, Dimensions,StatusBar,Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const CustomHeader = ({ title }) => {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#64030c" />
            <View style={styles.header}>
                {title == "Home" ?
                    <TouchableOpacity onPress={() => console.log('Menu')} style={styles.button}>
                        <Image resizeMode='contain' style={{height:25, width:25, tintColor:'white'}} source={require("../images/menuIcon.png")}/>
                    </TouchableOpacity> :
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.button}>
                        <Image resizeMode='contain' style={{height:25, width:25, tintColor:'white'}} source={require("../images/back.png")}/>
                    </TouchableOpacity>}
                <Text style={styles.title}>{title}</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.button}>
                    <Image resizeMode='contain' style={{height:25, width:25, tintColor:'white'}} source={title==="Home"? require("../images/dots.png"):require("../images/search.png")}/>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        height: windowHeight/10,
        backgroundColor: '#64030c',
        paddingHorizontal: 7,
        elevation: 0,
        justifyContent: "space-between",
    },
    title: {
        color: '#fff',
        fontSize: 22,
        fontWeight: '600',
    },
    button: {
        padding: 7,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
});

export default CustomHeader;
