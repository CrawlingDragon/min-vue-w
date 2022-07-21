import { trackEffects, triggerEffects, isTracking } from './effect';
import { hasChanged, isObject } from '../shared/index';
import { reactive } from './reactive';
class RefImpl {
  private _value;
  public dep;
  private rawValue; //用来保存，未被处理的value
  public __is_Ref = true;
  constructor(value) {
    this.rawValue = value;
    this._value = convert(value);
    this.dep = new Set(); //用来保存依赖收集，和触发依赖
  }
  get value() {
    if (!isTracking()) {
      return this._value;
    }
    trackEffects(this.dep);
    return this._value;
  }
  set value(newValue) {
    if (!hasChanged(newValue, this.rawValue)) return;
    this.rawValue = newValue;
    this._value = convert(newValue);
    triggerEffects(this.dep);
  }
}

// 封装 value 为对象时，就用reactive包裹，否则就返回原生value
function convert(value) {
  return isObject(value) ? reactive(value) : value;
}

export function ref(value) {
  return new RefImpl(value);
}

export function isRef(ref) {
  // 在class中，预设一个公共属性，直接可以在实例上取到的 public -> __is_Ref
  // 有，就等于true，没有 就等于undefined，所以用!!转译成 boolean值
  return !!ref.__is_Ref;
}

export function unRef(ref) {
  //如果是ref，就返回ref值，否则就返回本身
  return isRef(ref) ? ref.value : ref;
}

export function proxyRefs(ref) {
  return new Proxy(ref, {
    get(target, key) {
      //如果是ref，就返回.value ，不是则返回ref值，也就是上面的unRef
      return unRef(Reflect.get(target, key));
    },
    set(target, key, value) {
      // 如果原来的值 target[key] 是一个ref，且新的赋值，也就是等号右边的值，不是一个ref
      // 我们需要把 target[key] 等号左边的ref，.value = value
      // 否则就直接返回该值
      if (isRef(target[key]) && !isRef(value)) {
        return (target[key].value = value);
      } else {
        return Reflect.set(target, key, value);
      }
    },
  });
}
