import { h, ref } from '../../lib/mini-vue.esm.js';
import { child } from './child.js';

// 组件更新的核心思路 （暂时是更新props）
// 1:组件的处理分为 mount 和update
// 2:利用effect 返回的 render 函数再一次执行更新
// 3：需要保存的变量， vnode内的 nextVnode， instance内的
// 4：优化判断是否需要更新，如果不是需要更新的props，则不更新
export const App = {
  name: 'App',
  setup() {
    const msg = ref(123);
    window.msg = msg;

    const count = ref(1);
    const changeMsgFn = () => {
      msg.value = 456;
    };
    const changeCountFn = () => {
      count.value++;
    };
    return {
      msg,
      changeMsgFn,
      count,
      changeCountFn,
    };
  },
  render() {
    return h('div', {}, [
      h('div', {}, '你好,component update'),
      h('div', {}, 'msg:' + this.msg),
      h(
        'button',
        {
          onClick: this.changeMsgFn,
        },
        '点击修改msg'
      ),
      h(child, { msg: this.msg }, 'child'),
      h('div', {}, 'count:' + this.count),
      h('button', { onClick: this.changeCountFn }, '点击修改count'),
    ]);
  },
};
