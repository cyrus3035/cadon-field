import React from 'react';
import { View, StyleSheet } from 'react-native';
import CadViewer from '../components/CadViewer';

const DrawingsScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <CadViewer />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});

export default DrawingsScreen;
