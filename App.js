import React from 'react';
import {SafeAreaView, Image, StyleSheet, Dimensions} from 'react-native';

const App = () => {
  return (
    <>
      <SafeAreaView style={styles.flex}>
        <Image source={require('./image.png')} resizeMode={'stretch'} style={[
          styles.image,
        ]} />
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: '#000',
  },
  image: {
    width: Dimensions.get('screen').width,
    height: Dimensions.get('screen').height - 90,
  }
});

export default App;
