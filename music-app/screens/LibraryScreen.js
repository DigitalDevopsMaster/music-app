import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';

const LibraryScreen = (props) => {
  const { songList, playSong, navigation } = props;

  const handlePlaySong = (song) => {
    playSong(song.url, song.name);
    navigation.navigate('Player')
  };

  const renderSongItem = ({ item }) => (
    <View style={styles.songContainer}>
      <Text style={styles.songTitle}>{item.name}</Text>
      <TouchableOpacity style={styles.playButton} onPress={() => handlePlaySong(item)}>
        <Text style={styles.playButtonText}>Play</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={songList}
        renderItem={renderSongItem}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212', // Fondo oscuro
    padding: 20,
  },
  header: {
    fontSize: 28,
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  listContainer: {
    paddingBottom: 20,
  },
  songContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1E1E1E', // Fondo de cada canción
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  songTitle: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  playButton: {
    backgroundColor: '#1DB954',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  playButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default LibraryScreen;
