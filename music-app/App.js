import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LibraryScreen from './screens/LibraryScreen';
import PlayerScreen from './screens/PlayerScreen';
import SettingsScreen from './screens/SettingsScreen';
import Snackbar from './components/Snackbar';  // Importa el nuevo componente Snackbar
import axios from 'axios';
import { Alert } from 'react-native';
import { Audio } from 'expo-av';

const Tab = createBottomTabNavigator();

const App = () => {
  const [loading, setLoading] = useState(true);
  const [sound, setSound] = useState();
  const [currentSong, setCurrentSong] = useState(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false); // Controla la visibilidad del Snackbar
  const [configurations, setConfigurations] = useState({
    serverUrl: ""
  });
  const [songList, setsongList] = useState([])


  const GetServerUrl = async () => {
    const savedUrl = await AsyncStorage.getItem('SERVER_URL');
    return savedUrl || ""; 
  }

  const SetServerUrl = async (serverUrl) => {
    await AsyncStorage.setItem('SERVER_URL', serverUrl);
    setConfigurations({
      ...configurations,
      serverUrl
    });
    setSnackbarVisible(true);
  }

  const fetchSongs = async () => {
    const url = configurations.serverUrl
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
        headers: {
          'ngrok-skip-browser-warning': 'true',  // Agregar este encabezado
        }
      });
      setsongList(response.data)
    } catch (error) {
      console.error('Error fetching songs:', error);
      Alert.alert('Error', 'Could not load songs. Please check your connection and credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fetchServerUrl = async () => {
    const savedUrl = await GetServerUrl();
    setConfigurations((prev) => ({
      ...prev,
      serverUrl: savedUrl,
    }));
    setLoading(false); 
  };

  const nextSong = () => {
    const currentIndex = songList.findIndex(({name}) => name === currentSong)
    if (currentIndex < songList.length - 1) {
      const next = songList[currentIndex + 1]
      return next
    } else {
      return null
    }
  }

  const previousSong = () => {
    const currentIndex = songList.findIndex(({name}) => name === currentSong)
    if (currentIndex > 0) {
      const prev = songList[currentIndex - 1]
      return prev
    } else {
      return null
    }
  }

  const playSong = async (rawUrl, name) => {
    console.log(rawUrl, name);
    setCurrentSong(name);  // Actualiza el nombre de la canción actual
    const url = encodeURI(rawUrl);
    // Cargar y reproducir la nueva canción
    try {
      // Si hay una canción sonando, deténla antes de reproducir la nueva
      if (sound) {
        await sound.stopAsync(); // Detener la canción actual
        await sound.unloadAsync(); // Descargar recursos
        setSound(null); // Restablecer el estado
      }
  
      // Cargar y reproducir la nueva canción
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: url },  // Usa la URL de la canción que se pasa como argumento
        { shouldPlay: true }
      );
      setSound(newSound);  // Establece el nuevo sonido
  
      // Si deseas ejecutar alguna acción al finalizar la canción
      newSound.setOnPlaybackStatusUpdate(status => {
        if (status.didJustFinish) {
          newSound.unloadAsync(); // Descartar recursos
          setSound(null);  // Restablecer estado cuando termine la reproducción
          setCurrentSong(null);
        }
      });
  
  
    } catch (error) {
      console.error('Error playing the song:', error);
      Alert.alert('Error', 'Could not play the song.');
    }
  };
  
  

  const stopSong = async () => {
    try {
      if (sound) {
        console.log('Stopping the current song...');
        await sound.stopAsync();  // Detener la canción
        await sound.unloadAsync();  // Descargar recursos
        setSound(null);  // Actualizar el estado para reflejar que no hay canción en reproducción
        setCurrentSong(null)
      console.log('Song stopped and resources unloaded');
      } else {
        console.log('No song is currently playing');
      }
    } catch (error) {
      console.error('Error stopping the song:', error);
    }
  };
  
  const pauseSong = async () => {
    try {
      if (sound) {
          sound.pauseAsync();
      } else {
        console.log('No song is currently playing');
      }
    } catch (error) {
      console.error('Error pausing the song:', error);
    }
  };
  

  useEffect(() => {
    fetchServerUrl();
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  useEffect(() => {
    if (configurations.serverUrl) {
      fetchSongs()
    }
  }, [configurations.serverUrl])

  useEffect(() => {
  }, [sound])

  useEffect(() => {
  }, [currentSong])

  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen
          name="Library"
          children={({navigation}) => <LibraryScreen songList={songList} playSong={playSong} navigation={navigation}/>}
          options={{
            tabBarIcon: ({ color }) => <Ionicons name="musical-notes" size={25} color={color} />,
          }}
        />
        <Tab.Screen
          name="Player"
          children={({navigation}) => <PlayerScreen previousSong={previousSong} playSong={playSong} nextSong={nextSong} currentSong={currentSong} stopSong={stopSong} pauseSong={pauseSong} sound={sound} navigation={navigation}/>}
          initialParams={{ currentSong }}
          options={{
            tabBarIcon: ({ color }) => <Ionicons name="play-circle" size={25} color={color} />,
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          
          initialParams={{ serverUrl: configurations.serverUrl, updateServerUrl: SetServerUrl }}
          options={{
            tabBarIcon: ({ color }) => <Ionicons name="settings" size={25} color={color} />,
          }}
        />
      </Tab.Navigator>
      
      {/* Snackbar */}
      <Snackbar 
        message="Server URL updated successfully!" 
        visible={snackbarVisible} 
        onDismiss={() => setSnackbarVisible(false)} 
      />
    </NavigationContainer>
  );
};

export default App;
