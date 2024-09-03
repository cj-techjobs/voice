import React from 'react';
import { Modal, View, Text, StyleSheet,Dimensions } from 'react-native';
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
const MenuModal = ({pickAudioFile, visible, onClose,setIsNewRecording,isNewRecording }) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.miniContainer}>
          <Text onPress={pickAudioFile} style={styles.textStyle}>Upload Recording</Text>
          <Text onPress={setIsNewRecording} style={styles.textStyle}>{isNewRecording?"All Recording":"New Recording"}</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container:{
     flex: 1, alignItems: 'flex-end'
  },
  miniContainer:{
            justifyContent:"center",
            paddingLeft:10,
            backgroundColor: '#f5524b',
            padding: 10,
            borderRadius: 4,
            marginRight: 10,
            marginTop: 50,
            width: windowWidth/2.4,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
  },
  textStyle:{
    fontSize:16,
    paddingVertical:5,
    color:"white"
  }
})
export default MenuModal