import { h } from '../../lib/mini-vue.esm.js';
export const App = {
  render() {
    return h(
      'div',
      {
        id: 'root',
        class: ['red', 'blue'],
      },
      [h('p', { class: 'yellow' }, 'hi'), h('span', { id: 'spanId' }, 'this is span')]
    );
  },
  setup() {
    return { msg: 'mini-vue' };
  },
};
