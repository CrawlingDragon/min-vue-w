import { h } from '../../lib/mini-vue.esm.js';
import { Foo } from './Foo.js';
window.self = null;
export const App = {
  render() {
    window.self = this;
    return h(
      'div',
      {
        id: 'root',
        class: ['red', 'blue'],
        // 事件注册，on + Event name
        onClick: () => {
          console.log('this is click fn');
        },
        onMouseenter() {
          console.log('鼠标移入事件');
        },
      },
      [h('div', {}, this.msg), h(Foo, { count: 2 })]
    );
  },
  setup() {
    return { msg: 'mini-vue32' };
  },
};
