import { BackHandler } from 'react-native';

/**
 * RN 0.77+ removed BackHandler.removeEventListener; NativeBase 3.x still uses it.
 * Track subscriptions from addEventListener so removeEventListener can call .remove().
 */
const backHandlerCompat = BackHandler as typeof BackHandler & {
  removeEventListener?: (
    eventName: 'hardwareBackPress',
    handler: () => boolean | null | undefined
  ) => void;
};

if (typeof backHandlerCompat.removeEventListener !== 'function') {
  const subs = new WeakMap<
    () => boolean | null | undefined,
    { remove: () => void }
  >();
  const origAdd = BackHandler.addEventListener.bind(BackHandler);

  backHandlerCompat.addEventListener = ((
    eventName: 'hardwareBackPress',
    handler: () => boolean | null | undefined
  ) => {
    const sub = origAdd(eventName, handler);
    subs.set(handler, sub);
    return sub;
  }) as typeof BackHandler.addEventListener;

  backHandlerCompat.removeEventListener = (
    _eventName: 'hardwareBackPress',
    handler: () => boolean | null | undefined
  ) => {
    const sub = subs.get(handler);
    sub?.remove();
    if (sub) subs.delete(handler);
  };
}
