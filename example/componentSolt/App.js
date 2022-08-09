import { h, createTextVnode } from '../../lib/mini-vue.esm.js';
import { Foo } from './Foo.js';
export const App = {
  render() {
    const foo = h(
      Foo,
      {},
      {
        header: () => [h('p', {}, 'header-123'), createTextVnode('这是纯text类型')], // 把Foo组件的变量传递给app
        footer: ({ age }) => h('p', {}, 'footer-456++' + age),
      }
    );
    // const foo = h(Foo, {}, h('p', {}, '123'));

    return h('div', {}, [h('div', {}, this.msg), foo]);
  },
  setup() {
    return { msg: 'mini-vue32' };
  },
};
