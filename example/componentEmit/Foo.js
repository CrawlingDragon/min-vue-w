import { h } from '../../lib/mini-vue.esm.js';
export const Foo = {
  name: 'foo',
  setup(props, { emit }) {
    const emitAdd = () => {
      console.log('emit add fn');
      emit('add', 1, 2);
      emit('get-food', 'food');
    };
    return { emitAdd };
  },
  render() {
    const btn = h(
      'button',
      {
        onClick: this.emitAdd,
      },
      'emitAdd'
    );
    const foo = h('p', {}, 'foo');
    return h('div', {}, [foo, btn]);
  },
};
