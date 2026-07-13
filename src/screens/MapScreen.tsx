import React from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Region } from 'react-native-maps';

const MapScreen: React.FC = () => {
  const initialRegion: Region = {
    latitude: 30.6,
    longitude: 114.3,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={initialRegion}
        mapType="standard"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  map: {
    flex: 1,
  },
});

export default MapScreen;
