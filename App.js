import React from 'react';
import {SafeAreaView, StyleSheet, Dimensions} from 'react-native';

import {
  PinchGestureHandler,
  State,
  PanGestureHandler,
} from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
const screenWidth = Dimensions.get('screen').width;
const screenHeight = Dimensions.get('screen').height;
const IMAGE_WIDTH = screenWidth;
const IMAGE_HEIGHT = screenHeight - 90;
const {
  cond,
  eq,
  add,
  greaterThan,
  set,
  event,
  useValue,
  multiply,
  Image,
  call,
  lessThan,
  sub,
  divide,
  block,
} = Animated;

const App = () => {
  // scale
  const pinchGestureState = useValue(-1);
  const pinchScale = useValue(1);
  const pinchEvent = event([
    {nativeEvent: {scale: pinchScale, state: pinchGestureState}},
  ]);
  const lastScale = useValue(1);
  const scale = cond(
    greaterThan(multiply(lastScale, pinchScale), 2),
    block([set(lastScale, 2), set(pinchScale, 2)]),
    cond(
      lessThan(multiply(lastScale, pinchScale), 1),
      block([set(lastScale, 1), set(pinchScale, 1)]),
      set(lastScale, multiply(lastScale, pinchScale)),
    ),
  );

  // drag events
  const offsetX = useValue(0);
  const offsetY = useValue(0);
  const dragX = useValue(0);
  const dragY = useValue(0);
  const panGestureState = useValue(-1);
  const panEvent = event([
    {
      nativeEvent: {
        translationX: dragX,
        translationY: dragY,
        state: panGestureState,
      },
    },
  ]);
  const midTransX = cond(
    eq(panGestureState, State.ACTIVE),
    add(offsetX, dragX),
    set(offsetX, add(offsetX, dragX)),
  );
  const translateX = cond(
    lessThan(midTransX, 0),
    cond(
      lessThan(
        sub(0, divide(multiply(IMAGE_WIDTH, sub(scale, 1)), 2)),
        midTransX,
      ), // (414 * (scale - 1)) / 2
      midTransX,
      set(offsetX, sub(0, divide(multiply(IMAGE_WIDTH, sub(scale, 1)), 2))),
    ),
    cond(
      lessThan(midTransX, divide(multiply(IMAGE_WIDTH, sub(scale, 1)), 2)), // (414 * (scale - 1)) / 2
      midTransX,
      set(offsetX, divide(multiply(IMAGE_WIDTH, sub(scale, 1)), 2)),
    ),
  );
  const midTransY = cond(
    eq(panGestureState, State.ACTIVE),
    add(offsetY, dragY),
    set(offsetY, add(offsetY, dragY)),
  );
  const translateY = cond(
    lessThan(midTransY, 0),
    cond(
      lessThan(
        sub(0, divide(multiply(IMAGE_HEIGHT, sub(scale, 1)), 2)),
        midTransY,
      ), // (414 * (scale - 1)) / 2
      midTransY,
      set(offsetY, sub(0, divide(multiply(IMAGE_HEIGHT, sub(scale, 1)), 2))),
    ),
    cond(
      lessThan(midTransY, divide(multiply(IMAGE_HEIGHT, sub(scale, 1)), 2)), // (414 * (scale - 1)) / 2
      midTransY,
      set(offsetY, divide(multiply(IMAGE_HEIGHT, sub(scale, 1)), 2)),
    ),
  );

  return (
    <>
      <SafeAreaView style={styles.flex}>
        <PanGestureHandler
          maxPointers={1}
          onGestureEvent={panEvent}
          onHandlerStateChange={panEvent}>
          <Animated.View style={styles.flex}>
            <PinchGestureHandler
              onHandlerStateChange={pinchEvent}
              onGestureEvent={pinchEvent}>
              <Image
                source={require('./image.png')}
                resizeMode={'stretch'}
                style={[
                  styles.image,
                  {
                    transform: [
                      {perspective: 200},
                      {translateX},
                      {translateY},
                      {scale},
                    ],
                  },
                ]}
              />
            </PinchGestureHandler>
            <Animated.Code>
              {() =>
                call([pinchScale], ([pinchScale]) => console.log(pinchScale))
              }
            </Animated.Code>
          </Animated.View>
        </PanGestureHandler>
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
    width: IMAGE_WIDTH,
    height: IMAGE_HEIGHT,
  },
});

export default App;
