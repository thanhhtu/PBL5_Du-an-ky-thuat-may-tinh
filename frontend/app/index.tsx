import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import MenuScreen from './screens/MenuScreen';
import Navigation from './components/Navigation';

const App = () => {
  return (
    <SafeAreaProvider>
      {/* <MenuScreen /> */}
      <Navigation />
    </SafeAreaProvider>
  );
};

export default App;