const PublicPropertiesMap = {
  $el: (instance) => instance.vnode.el,
  $slots: (instance) => instance.slots,
  $props: (instance) => instance.props,
};

// 用于ctx的proxy的handler函数封装
export const PublicInstanceProxyHandlers = {
  get({ _: instance }, key) {
    const { setupState, props } = instance;

    const hasOwn = (val, key) => Object.prototype.hasOwnProperty.call(val, key);

    if (hasOwn(setupState, key)) {
      return setupState[key];
    } else if (hasOwn(props, key)) {
      return props[key];
    }
    const publicGetter = PublicPropertiesMap[key];
    if (publicGetter) {
      return publicGetter(instance);
    }
  },
};
