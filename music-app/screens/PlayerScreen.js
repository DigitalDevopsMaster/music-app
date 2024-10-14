import React, { useEffect, useState } from 'react';
import { TouchableOpacity, StyleSheet, View, Text, Image } from 'react-native';
import Slider from '@react-native-community/slider';
import Ionicons from 'react-native-vector-icons/Ionicons'; // Importar Ionicons

const PlayerScreen = (props) => {
  const { stopSong, currentSong, sound, nextSong, previousSong, navigation, playSong } = props;
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);

  useEffect(() => {
    if (sound) {
      sound.setOnPlaybackStatusUpdate(status => {
        if (status.isLoaded) {
          setDuration(status.durationMillis);
          setPosition(status.positionMillis);
          setIsPlaying(status.isPlaying);
        }

        if (status.didJustFinish) {
            if (nextSong()) {
                onNextSong()
            } else {
                onStopSong()
            }
            setIsPlaying(false);
        }
      });
    }

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const togglePlayPause = async () => {
    if (isPlaying) {
      await sound.pauseAsync();
    } else {
      await sound.playAsync();
    }
    setIsPlaying(!isPlaying);
  };

  const seekTo = async (value) => {
    const newPosition = value;
    await sound.setPositionAsync(newPosition);
    setPosition(newPosition);
  };

  const onStopSong = () => {
    stopSong()
    navigation.navigate('Library')
  }

  const onNextSong = () => {
    const nextSongData = nextSong()
    if (nextSong()) {
        playSong( nextSongData.url, nextSongData.name)
    } else {
        onStopSong()
    }
  }

  const onPreviousSong = () => {
    const prevSongData = previousSong()
    if (prevSongData) {
        playSong( prevSongData.url, prevSongData.name)
    } else {
        onStopSong()
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.coverImage} >
            <Ionicons name="musical-notes" size={100} color="white" />   
      </View>
      <Text style={styles.songTitle}>{currentSong ? currentSong : 'No song playing'}</Text>

      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={duration}
        value={position}
        onValueChange={setPosition}
        onSlidingComplete={seekTo}
        minimumTrackTintColor="#1DB954"
        maximumTrackTintColor="#B3B3B3"
        thumbTintColor="#1DB954"
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={onPreviousSong} style={styles.button}>
            <Ionicons name="play-skip-back" size={40} color="white" />   
        </TouchableOpacity>
        <TouchableOpacity onPress={togglePlayPause} style={styles.button}>
            {
                isPlaying
                ? <Ionicons name="pause" size={40} color="white" />   
                : <Ionicons name="play" size={40} color="white" />   
            }
        </TouchableOpacity>
        <TouchableOpacity onPress={onStopSong} style={styles.button}>
            <Ionicons name="stop" size={40} color="white" />   
        </TouchableOpacity>
        <TouchableOpacity onPress={onNextSong} style={styles.button}>
            <Ionicons name="play-skip-forward" size={40} color="white" />   
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#121212', // Fondo oscuro
    padding: 20,
  },
  coverImage: {
    width: 250,
    height: 250,
    borderRadius: 12,
    marginBottom: 20,
    borderColor: '#1DB954',
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center"
  },
  songTitle: {
    fontSize: 24,
    color: '#FFFFFF',
    marginBottom: 5,
    textAlign: 'center',
  },
  artistName: {
    fontSize: 16,
    color: '#B3B3B3',
    marginBottom: 20,
    textAlign: 'center',
  },
  slider: {
    width: '100%',
    height: 40,
    marginVertical: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    flex: 1,
    padding: 10,
    backgroundColor: '#1DB954',
    borderRadius: 5,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
  },
});

export default PlayerScreen;
