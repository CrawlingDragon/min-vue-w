import { ReactiveEffect } from './effect';
class computedImpl {
  private _value;
  private _dirty;
  private _getter: any;
  constructor(getter) {
    // 使用class reactiveEffect 做依赖收集，依赖触发， 在set的时候，触发scheduler () => {this._dirty = true}
    // this._dirty = true 后，在get内，重新执行getter函数，赋值给this._value
    this._getter = new ReactiveEffect(getter, () => {
      if (!this._dirty) {
        this._dirty = true;
      }
    });
    this._dirty = true;
  }
  get value() {
    if (this._dirty) {
      // 缓存，如果_dirty 为true，则返回getter函数 执行的值，
      // 否则 直接返回上一次读取的_value ,不在执行 getter函数
      this._dirty = false;
      this._value = this._getter.run();
    }
    return this._value;
  }
}
export function computed(getter) {
  return new computedImpl(getter);
}
