import { h } from '../../lib/mini-vue.esm.js';

// import TextToArray from './TextToArray.js';
// import TextToText from './TextToText.js';
// import ArrayToText from './ArrayToText.js';
import ArrayToArray from './ArrayToArray.js';

export const App = {
  name: 'App',
  setup() {},
  render() {
    return h('div', { tId: 1 }, [
      h('p', {}, '主页'),
      // 如果老的是text ， 新的是 array
      // h(TextToArray),
      // 如果老的是text ，新的是text
      // h(TextToText),
      // 如果老的是 array ，新的是 text
      // h(ArrayToText),
      // 如果老的是array ， 新的是 Array
      h(ArrayToArray),
    ]);
  },
};
// export const App = {
//   setup() {
//     const count = ref(0);
//     const onClick = function () {
//       count.value++;
//     };
//     const props = ref({
//       foo: 'foo',
//       bar: 'bar',
//     });
//     const onChangePropsDemo1 = () => {
//       props.value.foo = 'new-foo';
//     };
//     const onChangePropsDemo2 = () => {
//       props.value.foo = undefined;
//     };
//     const onChangePropsDemo3 = () => {
//       props.value = {
//         foo: 'foo',
//       };
//     };
//     return {
//       props,
//       onChangePropsDemo1,
//       onChangePropsDemo2,
//       onChangePropsDemo3,
//       count,
//       onClick,
//     };
//   },
//   render() {
//     return h(
//       'div',
//       {
//         id: 'root',
//         ...this.props,
//       },
//       [
//         h('div', {}, 'count:' + this.count),
//         //修改props的三种情况
//         // 1：把foo属性改为新的属性，比如new-foo
//         // 2：把foo属性改为undefined或者null，也就是删除旧属性的值
//         // 3：把旧属性内的，其中一个属性删除
//         h('button', { onClick: this.onChangePropsDemo1 }, '把props的foo改为new-foo'),
//         h('button', { onClick: this.onChangePropsDemo2 }, '把props的foo设置为undefined'),
//         h('button', { onClick: this.onChangePropsDemo3 }, '删除props内的bar属性'),
//       ]
//     );
//   },
// };
