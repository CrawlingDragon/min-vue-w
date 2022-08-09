import { isObject } from './../shared/index';
import { track, trigger } from './effect';
import { ReactiveFlags, reactive, readonly } from './reactive';
// 缓存get，和set 在代码刚进来的时候就执行get，和set
const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);
function createGetter(isReadonly = false, shallow = false) {
  return function get(target, key) {
    if (key === ReactiveFlags.isReactive) {
      return !isReadonly;
    } else if (key === ReactiveFlags.isReadonly) {
      return isReadonly;
    }
    //target == {foo:1}; key = foo
    //todo 依赖收集
    let res = Reflect.get(target, key);

    if (shallow) {
      // 如果是浅只读，shallow 为true
      return res;
    }
    if (isObject(res)) {
      return isReadonly ? readonly(res) : reactive(res);
    }
    if (!isReadonly) {
      track(target, key);
    }

    return res;
  };
}

function createSetter() {
  return function set(target, key, value) {
    //value 就是新值
    const res = Reflect.set(target, key, value);
    // todo 触发依赖
    trigger(target, key);
    return res;
  };
}

export const mutableHandlers = {
  get,
  set,
};

export const readonlyHandlers = {
  get: readonlyGet,
  set(target, key, value) {
    console.warn(`warn key:${key} set fail,因为 ${key} is readonly`);
    return true;
  },
};

export const shallowReadonlyHandlers = Object.assign({}, readonlyHandlers, {
  get: shallowReadonlyGet,
});
