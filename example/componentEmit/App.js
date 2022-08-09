import { h } from '../../lib/mini-vue.esm.js';
import { Foo } from './Foo.js';
export const App = {
  name: 'app',
  render() {
    return h('div', {}, [
      h('div', {}, 'app'),
      h(Foo, {
        onAdd(a, b) {
          // console.log('app add');
          console.log('app component a:b', a, b);
        },
        onGetFood(food) {
          // get-food
          console.log(food); //food
        },
      }),
    ]);
  },
  setup() {
    return { msg: 'mini-vue32' };
  },
};
