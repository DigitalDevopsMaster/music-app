import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Audio } from 'expo-av';

// Default URL is initially empty
const DEFAULT_SERVER_URL = "";

const App = () => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sound, setSound] = useState(null);
  const [currentSong, setCurrentSong] = useState(null);
  const [serverUrl, setServerUrl] = useState(DEFAULT_SERVER_URL); // Server URL
  const [tempUrl, setTempUrl] = useState(DEFAULT_SERVER_URL); // Temporary URL for the modal
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    const fetchSavedUrl = async () => {
      try {
        const savedUrl = await AsyncStorage.getItem('SERVER_URL');
        if (savedUrl) {
          setServerUrl(savedUrl);
          setTempUrl(savedUrl); // Load the saved URL into the input
          fetchSongs(savedUrl);
        } else {
          setIsModalVisible(true); // Show the modal if there is no URL
        }
      } catch (error) {
        console.error('Error fetching saved URL:', error);
      } finally {
        setLoading(false); // Ensure loading indicator is hidden
      }
    };

    fetchSavedUrl();

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const fetchSongs = async (url) => {
    if (!url) {
      console.log('No URL found, skipping song fetch');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.get(`${url}/api/songs`, {
        auth: {
          username: 'username',
          password: 'password',
        },
      });
      setSongs(response.data);
    } catch (error) {
      console.error('Error fetching songs:', error);
      Alert.alert('Error', 'Could not load songs. Please check your connection and credentials.');
    } finally {
      setLoading(false);
    }
  };

  const playSong = async (url, name) => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: true }
      );

      setSound(newSound);
      setCurrentSong(name);

      newSound.setOnPlaybackStatusUpdate(status => {
        if (status.didJustFinish) {
          setCurrentSong(null);
          newSound.unloadAsync();
        }
      });
    } catch (error) {
      console.error('Error playing the song:', error);
      Alert.alert('Error', 'Could not play the song.');
    }
  };

  const stopSong = async () => {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      setSound(null);
      setCurrentSong(null);
    }
  };

  const saveUrl = async () => {
    // If the URL is the same, just close the modal
    if (tempUrl === serverUrl) {
      setIsModalVisible(false);
      return;
    }

    try {
      await AsyncStorage.setItem('SERVER_URL', tempUrl);
      setServerUrl(tempUrl);
      fetchSongs(tempUrl); // Fetch songs again with the new URL
    } catch (error) {
      console.error('Error saving the URL:', error);
      Alert.alert('Error', 'Could not save the URL.');
    } finally {
      setIsModalVisible(false);
    }
  };

  const renderSong = ({ item }) => (
    <TouchableOpacity
      style={styles.songItem}
      onPress={() => playSong(item.url, item.name)}
    >
      <Text style={styles.songText}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setIsModalVisible(true)} style={styles.configButton}>
        <Text style={styles.configText}>Configure</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Local Music Player</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : serverUrl ? (
        <FlatList
          data={songs}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderSong}
        />
      ) : (
        <Text>No configured URL. Please configure the URL.</Text>
      )}

      {currentSong && (
        <View style={styles.playingContainer}>
          <Text>Playing: {currentSong}</Text>
          <TouchableOpacity onPress={stopSong} style={styles.stopButton}>
            <Text style={styles.stopText}>Stop</Text>
          </TouchableOpacity>
        </View>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Configure Server URL</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter the server URL"
              value={tempUrl}
              onChangeText={setTempUrl}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity onPress={saveUrl} style={styles.saveButton}>
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setIsModalVisible(false)} style={styles.cancelButton}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  songItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  songText: {
    fontSize: 18,
  },
  playingContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#eee',
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stopButton: {
    backgroundColor: '#ff0000',
    padding: 10,
    borderRadius: 5,
  },
  stopText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  configButton: {
    backgroundColor: '#007bff',
    padding: 10,
    marginTop: 20,
    borderRadius: 5,
    alignItems: 'center',
  },
  configText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  saveButton: {
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 5,
  },
  saveText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#ff0000',
    padding: 10,
    borderRadius: 5,
  },
  cancelText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
