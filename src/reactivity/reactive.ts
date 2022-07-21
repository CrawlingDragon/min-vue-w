import { mutableHandlers, readonlyHandlers, shallowReadonlyHandlers } from './basehandlers';

export const enum ReactiveFlags {
  isReactive = '__v_isReactive',
  isReadonly = '__v_isReadonly',
}

function createReactiveObject(raw, handlers) {
  // 为了更加的语义化，知道函数在干什么
  return new Proxy(raw, handlers);
}

export function reactive(raw) {
  // raw ={foo:1}
  return createReactiveObject(raw, mutableHandlers);
}

export function readonly(raw) {
  return createReactiveObject(raw, readonlyHandlers);
}

export function isReactive(value) {
  return !!value[ReactiveFlags.isReactive];
}
export function isReadonly(value) {
  return !!value[ReactiveFlags.isReadonly];
}

export function shallowReadonly(raw) {
  return createReactiveObject(raw, shallowReadonlyHandlers);
}

export function isProxy(value) {
  return isReactive(value) || isReadonly(value);
}
