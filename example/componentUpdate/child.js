import { h } from '../../lib/mini-vue.esm.js';
export const child = {
  name: 'child2',
  setup(props) {
    console.log('props', props);
  },
  render() {
    return h('div', {}, [h('div', {}, 'child - props - mas:' + this.$props.msg)]);
  },
};
