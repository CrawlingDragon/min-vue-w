import { h, ref, getCurrentInstance, nextTick } from '../../lib/mini-vue.esm.js';

export const App = {
  name: 'App',
  setup() {
    const instance = getCurrentInstance();
    const count = ref(1);
    // nextTick 核心思想
    // 数据变化在同步代码
    // 视图更新在异步任务，
    const onClickFn = () => {
      for (let i = 0; i < 100; i++) {
        count.value = i;
      }
      console.log('instance', instance);
      nextTick(() => {
        console.log('instance -> nextTick', instance);
      });
    };
    return {
      count,
      onClickFn,
    };
  },
  render() {
    return h('div', { tId: 1 }, [
      h(
        'button',
        {
          onClick: this.onClickFn,
        },
        'update'
      ),
      h('p', {}, 'count:' + this.count),
    ]);
  },
};
