import { h, renderSlots } from '../../lib/mini-vue.esm.js';
export const Foo = {
  name: 'foo',
  setup() {
    return {};
  },
  render() {
    const foo = h('p', {}, 'foo');
    // slots -> 获取Foo.vnode.children
    // 支持string 和 array 的slots
    //   具名插槽
    console.log(this.$slots);
    const age = 20;
    return h('div', {}, [
      renderSlots(this.$slots, 'footer', { age }),
      foo,
      renderSlots(this.$slots, 'header'),
    ]);
  },
};
