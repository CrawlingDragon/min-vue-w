import { h } from '../../lib/mini-vue.esm.js';

export const Foo = {
  name: 'foo',
  setup(props) {
    // 1.获取props
    // 2：读取this.props
    // 3：props is readonly
    console.log('props', props);
    props.count++;
  },
  render() {
    return h('div', {}, 'show props：' + this.count);
  },
};
