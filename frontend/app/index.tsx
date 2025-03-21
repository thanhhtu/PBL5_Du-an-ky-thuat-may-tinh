import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import MenuScreen from './screens/MenuScreen';

const App = () => {
  return (
    <SafeAreaProvider>
      <MenuScreen />
    </SafeAreaProvider>
  );
};

export default App;