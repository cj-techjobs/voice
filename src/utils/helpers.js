import { API_BASE_URL } from "../apiHandler/api";



export const capitalize = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

export const getFormattedTime = (millis) => {
    const minutes = Math.floor(millis / 60000);
    const seconds = ((millis % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

export const onPlayPause = async (data, setRecordTime, setCurrentPosition,audioRecorderPlayer,setIsPlaying) => {
    const serverUrl = `${API_BASE_URL}/recording/${data.file.filename}`;
    try {
        // audioRecorderPlayer.setVolume(1.0);
        await audioRecorderPlayer.startPlayer(serverUrl);
        audioRecorderPlayer.addPlayBackListener((e) => {
            setRecordTime(getFormattedTime(e.currentPosition));
            setCurrentPosition(e.currentPosition);
            if (getFormattedTime(e.currentPosition) === getFormattedTime(e.duration)) {
                audioRecorderPlayer.stopPlayer();
                audioRecorderPlayer.removePlayBackListener();
                setIsPlaying(false);
              }
        });
    } catch (error) {
        console.error('Error during playback:', error);
    }
};
export const onPause = async (audioRecorderPlayer) => {
    await audioRecorderPlayer.pausePlayer();
};

export default {
    capitalize,
    getFormattedTime,
    onPlayPause,
    onPause
}; 