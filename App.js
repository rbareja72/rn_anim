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
  decay,
  Clock,
  and,
  clockRunning,
  stopClock,
  Value,
  startClock,
  not,
  neq,
} = Animated;

const withDecay = (config) => {
  const {value, velocity, state, offset, deceleration} = {
    offset: new Value(0),
    deceleration: 0.998,
    ...config,
  };
  const clock = new Clock();
  const decayState = {
    finished: new Value(0),
    velocity: new Value(0),
    position: new Value(0),
    time: new Value(0),
  };

  const isDecayInterrupted = and(eq(state, State.BEGAN), clockRunning(clock));
  const finishDecay = [set(offset, decayState.position), stopClock(clock)];

  return block([
    cond(isDecayInterrupted, finishDecay),
    cond(neq(state, State.END), [
      set(decayState.finished, 0),
      set(decayState.position, add(offset, value)),
    ]),
    cond(eq(state, State.END), [
      cond(and(not(clockRunning(clock)), not(decayState.finished)), [
        set(decayState.velocity, velocity),
        set(decayState.time, 0),
        startClock(clock),
      ]),
      decay(clock, decayState, {deceleration}),
      cond(decayState.finished, finishDecay),
    ]),
    decayState.position,
  ]);
};
const App = () => {
  // scale
  const pinchGestureState = useValue(-1);
  const pinchScale = useValue(1);
  const pinchEvent = event(
    [{nativeEvent: {scale: pinchScale, state: pinchGestureState}}],
    {useNativeDriver: true},
  );
  const lastScale = useValue(1);
  const scale = cond(
    eq(pinchGestureState, State.ACTIVE),
    cond(
      greaterThan(multiply(lastScale, pinchScale), 2),
      [set(lastScale, 2)],
      cond(
        lessThan(multiply(lastScale, pinchScale), 1),
        [set(lastScale, 1)],
        [set(lastScale, multiply(lastScale, pinchScale))],
      ),
    ),
    lastScale,
  );

  // drag events
  const offsetX = useValue(0);
  const offsetY = useValue(0);
  const dragX = useValue(0);
  const dragY = useValue(0);
  const velocityX = useValue(0);
  const velocityY = useValue(0);
  const panGestureState = useValue(-1);
  const panEvent = event(
    [
      {
        nativeEvent: {
          translationX: dragX,
          translationY: dragY,
          state: panGestureState,
          velocityX,
          velocityY,
        },
      },
    ],
    {useNativeDriver: true},
  );

  const midTransX = withDecay({
    value: dragX,
    velocity: velocityX,
    state: panGestureState,
  });
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
  // without animation
  // const midTransY = cond(
  //   eq(panGestureState, State.ACTIVE),
  //   add(offsetY, dragY),
  //   set(offsetY, add(offsetY, dragY)),
  // );

  //with animation
  const midTransY = withDecay({
    value: dragY,
    velocity: velocityY,
    state: panGestureState,
  });
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
              minPointers={2}
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
