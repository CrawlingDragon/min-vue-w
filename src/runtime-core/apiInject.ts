import { getCurrentInstance } from './component';
// ps:开发思想
// 从最小的功能开始实现。 随着demo变复杂或者需求变多，在慢慢实现其他功能
// 也防止过渡设计
export function provide(key, value) {
  //存
  const instance: any = getCurrentInstance();
  // 因为provide只能在setup内执行，所以需要判断instance 是否存在
  if (instance) {
    let { provides } = instance;
    let parentProvides = instance.parent.provides;

    // 当前组件的provide 等于 父级parentProvides时，才会初始化provides， init
    if (provides === parentProvides) {
      // 相当于 当前组件的provides的原型链上会有 parentProvides的值
      provides = instance.provides = Object.create(parentProvides);
    }
    provides[key] = value;
  }
}

export function inject(key, defaultVal) {
  //取
  const instance: any = getCurrentInstance();
  if (instance) {
    //关键步骤：取当前组件上的父组件内的 provides

    let provides = instance.parent.provides;
    let value = provides[key];
    if (!value) {
      if (typeof defaultVal === 'function') {
        return defaultVal();
      }
      return defaultVal;
    } else if (key in provides) {
      return value;
    }
  }
}
