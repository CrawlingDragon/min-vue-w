import { h, provide, inject } from '../../lib/mini-vue.esm.js';

//provide 3点需求
//1:找到父级的provide
//2:如果有多层级嵌套，找到对的provide
//3:在中间组件有同样的provide-key，正确取值
// 4 inject的默认值
const Provider = {
  name: 'Provider',
  setup() {
    provide('foo', 'fooVal');
    provide('bar', 'barVal');
  },
  render() {
    return h('div', {}, [h('div', {}, 'provider'), h(Provider2)]);
  },
};
const Provider2 = {
  name: 'Provider',
  setup() {
    provide('foo', 'foo2');
    let foo = inject('foo');
    return { foo };
  },
  render() {
    return h('div', {}, [h('div', {}, this.foo), h(Consumer)]);
  },
};
const Consumer = {
  name: 'Consumer',
  setup() {
    const foo = inject('foo');
    const bar = inject('bar');
    const baz = inject('baz', 'default:baz');
    const bax = inject('bax', () => 'function default:bax');
    return {
      foo,
      bar,
      baz,
      bax,
    };
  },
  render() {
    return h('div', {}, `Consumer:-${this.foo}-${this.bar}-${this.baz}-${this.bax}`);
  },
};
export const App = {
  name: 'App',
  setup() {},
  render() {
    return h('div', {}, [h('p', {}, 'apiInject'), h(Provider)]);
  },
};
