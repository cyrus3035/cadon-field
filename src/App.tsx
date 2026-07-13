import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';

import DrawingsScreen from './screens/DrawingsScreen';
import MapScreen from './screens/MapScreen';
import CalibrationScreen from './screens/CalibrationScreen';

const Tab = createBottomTabNavigator();

const App: React.FC = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            const iconName = route.name === '图纸' 
              ? (focused ? 'folder-open' : 'folder')
              : route.name === '地图' 
                ? (focused ? 'map' : 'map-outline')
                : (focused ? 'settings' : 'settings-outline');

            return <Ionicons name={iconName as any} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: '#8E8E93',
          tabBarLabelStyle: {
            fontSize: 12,
          },
          headerStyle: {
            backgroundColor: '#ffffff',
          },
          headerTitleStyle: {
            fontWeight: '600',
          },
        })}
      >
        <Tab.Screen name="图纸" component={DrawingsScreen} />
        <Tab.Screen name="地图" component={MapScreen} />
        <Tab.Screen name="配准" component={CalibrationScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default App;
