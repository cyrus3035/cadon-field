import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const CalibrationScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>配准页面</Text>
      <Text style={styles.subText}>坐标转换配置</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  text: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 16,
  },
  subText: {
    fontSize: 16,
    color: '#666666',
  },
});

export default CalibrationScreen;
