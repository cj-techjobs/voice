import React, { useState } from 'react';
import { Modal, View,ToastAndroid, Text, Button, StyleSheet, Dimensions, TextInput } from 'react-native';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const RecordingModal = ({setRecordingName, recordingName, uploadfiles,setIsSave}) => {
    const [modalVisible, setModalVisible] = useState(true);
    const openModal = () => {
        if (!recordingName){
            ToastAndroid.showWithGravity(
                "Please enter the recording name",
                ToastAndroid.SHORT,
                ToastAndroid.CENTER,
            );
            return
        } 
        setModalVisible(false);
        uploadfiles();
    };

    const closeModal = () => {
        setModalVisible(false);
        setIsSave(false);
    };
   
    return (
        <View style={styles.container}>
            <Modal
                animationType="slide" // Can be 'slide', 'fade', or 'none'
                transparent={true} // Set to true if you want a transparent background
                visible={modalVisible}
                onRequestClose={closeModal} // Android back button handling
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Hello, Please Enter the recording name</Text>
                        <TextInput
                            style={styles.input}
                            placeholderTextColor={'#adabab'}
                            placeholder="Enter the recording name"
                            value={recordingName}
                            onChangeText={setRecordingName}

                        />
                        <View style={{ flexDirection: "row", marginTop: 20, justifyContent: "space-between", marginHorizontal: 10 }}>
                            <Button color="#ff5c5c" title="Cancel" onPress={closeModal} />
                            <Button color="#ff5c5c" title="Save" onPress={openModal} />
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
    },
    modalContainer: {
        width: 300,
        height: 200,
        padding: 20,
        backgroundColor: '#9e0414',
        borderRadius: 10,
        elevation: 5, // Shadow for Android
        shadowColor: '#000', // Shadow for iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    modalTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 10,
    },
    modalContent: {
        fontSize: 16,
        marginBottom: 20,
    },
    input: {
        height: 40,
        borderColor: 'white',
        borderWidth: 0.3,
        marginBottom: 15,
        padding: 10,
        borderRadius: 4
    }
});

export default RecordingModal;
