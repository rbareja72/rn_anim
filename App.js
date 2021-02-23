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
  and,
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
  max,
  divide,
} = Animated;

const App = () => {
  const baseScale = useValue(1);
  const offsetX = useValue(0);
  const offsetY = useValue(0);
  const dragX = useValue(0);
  const dragY = useValue(0);
  const gestureState = useValue(-1);
  const baseScaleValue = React.useRef(1);
  call([baseScale], (baseScale) => {
    baseScaleValue.current = baseScale;
  });
  const pinchScale = useValue(1);
  const scale = multiply(baseScale, pinchScale);
  const lastScale = React.useRef(1);
  const midTransX = cond(
    eq(gestureState, State.ACTIVE),
    add(offsetX, dragX),
    set(offsetX, add(offsetX, dragX)),
  );
  const translateX = cond(
    lessThan(midTransX, divide(multiply(IMAGE_WIDTH, sub(scale, 1)), 2)), // (414 * (scale - 1)) / 2
    midTransX,
    set(offsetX, divide(multiply(IMAGE_WIDTH, sub(scale, 1)), 2)),
  );
  const minTransY = cond(
    eq(gestureState, State.ACTIVE),
    add(offsetY, dragY),
    set(offsetY, add(offsetY, dragY)),
  );
  const translateY = cond(
    lessThan(minTransY, divide(multiply(IMAGE_HEIGHT, sub(scale, 1)), 2)), // (414 * (scale - 1)) / 2
    minTransY,
    set(offsetY, divide(multiply(IMAGE_HEIGHT, sub(scale, 1)), 2)),
  );
  const onHandlerStateChange = (event) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      if (event.nativeEvent.scale < 1 && baseScaleValue.current <= 1) {
        lastScale.current = 1;
        baseScale.setValue(1);
        baseScaleValue.current = 1;
        pinchScale.setValue(1);
      } else {
        pinchScale.setValue(1);
        if (lastScale.current * event.nativeEvent.scale > 2) {
          lastScale.current = 2;
        } else {
          lastScale.current *= event.nativeEvent.scale;
        }
        baseScaleValue.current = lastScale.current;
        baseScale.setValue(lastScale.current);
      }
    }
  };

  return (
    <>
      <SafeAreaView style={styles.flex}>
        <PanGestureHandler
          maxPointers={1}
          onGestureEvent={event([
            {
              nativeEvent: {
                translationX: dragX,
                translationY: dragY,
                state: gestureState,
              },
            },
          ])}
          onHandlerStateChange={event([
            {
              nativeEvent: {
                translationX: dragX,
                translationY: dragY,
                state: gestureState,
              },
            },
          ])}>
          <Animated.View style={styles.flex}>
            <PinchGestureHandler
              onHandlerStateChange={onHandlerStateChange}
              onGestureEvent={event([{nativeEvent: {scale: pinchScale}}])}>
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
