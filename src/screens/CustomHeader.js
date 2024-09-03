import React from 'react';
import { View, Text, StyleSheet, Dimensions,StatusBar,Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MenuModal from '../components/MenuModal';
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const CustomHeader = ({ title,onPressPlusIcon,isModalVisible,setIsModalVisible,pickAudioFile,setIsNewRecording,isNewRecording }) => {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#64030c" />
            <View style={styles.header}>
                {title !== "Recordings" ?
                    <TouchableOpacity onPress={() => console.log('Menu')} style={styles.button}>
                        <Image resizeMode='contain' style={{height:25, width:25, tintColor:'white'}} source={require("../images/menuIcon.png")}/>
                    </TouchableOpacity> :
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.button}>
                        <Image resizeMode='contain' style={{height:20, width:20, tintColor:'white'}} source={require("../images/back.png")}/>
                    </TouchableOpacity>}
                <Text style={styles.title}>{title}</Text>
                <TouchableOpacity onPress={onPressPlusIcon} style={styles.button}>
                    <Image resizeMode='contain' style={{height:20, width:20, tintColor:'white'}} source={title==="Home"? require("../images/dots.png"):require("../images/add.png")}/>
                </TouchableOpacity>
            </View>
            <MenuModal setIsNewRecording={()=>setIsNewRecording(true)} pickAudioFile={pickAudioFile} visible={isModalVisible} onClose={() => setIsModalVisible(false)} isNewRecording={isNewRecording} />

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
