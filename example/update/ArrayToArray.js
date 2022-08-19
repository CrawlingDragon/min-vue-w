import { h, ref } from '../../lib/mini-vue.esm.js';

//1:左侧对比
// const prevChildren = [
//   h('p', { key: 'A' }, 'A'),
//   h('p', { key: 'B' }, 'B'),
//   h('p', { key: 'C' }, 'C'),
// ];
// const nextChildren = [
//   h('p', { key: 'A' }, 'A'),
//   h('p', { key: 'B' }, 'B'),
//   h('p', { key: 'D' }, 'D'),
//   h('p', { key: 'E' }, 'E'),
// ];

// 2：右侧对比
// const prevChildren = [
//   h('p', { key: 'B' }, 'B'),
//   h('p', { key: 'C' }, 'C'),
//   h('p', { key: 'D' }, 'D'),
// ];
// const nextChildren = [
//   h('p', { key: 'A' }, 'A'),
//   h('p', { key: 'B' }, 'B'),
//   h('p', { key: 'C' }, 'C'),
//   h('p', { key: 'D' }, 'D'),
// ];

// 3：新的比老的长,长的在末尾
// const prevChildren = [h('p', { key: 'A' }, 'A'), h('p', { key: 'B' }, 'B')];
// const nextChildren = [
//   h('p', { key: 'A' }, 'A'),
//   h('p', { key: 'B' }, 'B'),
//   h('p', { key: 'C' }, 'C'),
// ];

// 3：新的比老的长,长的在头部
// const prevChildren = [h('p', { key: 'A' }, 'A'), h('p', { key: 'B' }, 'B')];
// const nextChildren = [
//   h('p', { key: 'D' }, 'D'),
//   h('p', { key: 'C' }, 'C'),
//   h('p', { key: 'A' }, 'A'),
//   h('p', { key: 'B' }, 'B'),
// ];

// 4：老的长比新的长,长的在尾部
// const prevChildren = [h('p', { key: 'A' }, 'A'), h('p', { key: 'B' }, 'B')];
// const nextChildren = [
//   h('p', { key: 'A' }, 'A'),
//   h('p', { key: 'B' }, 'B'),
//   h('p', { key: 'C' }, 'C'),
// ];

// 老的长比新的长,长的在头部
// const prevChildren = [h('p', { key: 'A' }, 'A'), h('p', { key: 'B' }, 'B')];
// const nextChildren = [
//   h('p', { key: 'C' }, 'C'),
//   h('p', { key: 'A' }, 'A'),
//   h('p', { key: 'B' }, 'B'),
// ];

// 5：对比中间部分
// a,b,(c,d),f,g
// a,b,(e,c),f,g
// d节点在新的节点里是没有的，需要删除
// c节点在props也发生了变化
// const prevChildren = [
//   h('p', { key: 'A' }, 'A'),
//   h('p', { key: 'B' }, 'B'),
//   h('p', { key: 'C' }, 'C'),
//   h('p', { key: 'D' }, 'D'),
//   h('p', { key: 'F' }, 'F'),
//   h('p', { key: 'G' }, 'G'),
// ];

// const nextChildren = [
//   h('p', { key: 'A' }, 'A'),
//   h('p', { key: 'B' }, 'B'),
//   h('p', { key: 'E' }, 'E'),
//   h('p', { key: 'C' }, 'C'),
//   h('p', { key: 'F' }, 'F'),
//   h('p', { key: 'G' }, 'G'),
// ];
// 5.1.1
// a,b,(c,e,d),f,g
// a,b,(e,c),f,g
// 中间部分，老的比新的多，那么多出来的直接就可以被删除，优化删除逻辑
const prevChildren = [
  h('p', { key: 'A' }, 'A'),
  h('p', { key: 'B' }, 'B'),
  h('p', { key: 'C', id: 'c1' }, 'C'),
  h('p', { key: 'x' }, 'x'),
  h('p', { key: 'E' }, 'E'),
  h('p', { key: 'D' }, 'D'),
  h('p', { key: 'F' }, 'F'),
  h('p', { key: 'G' }, 'G'),
];
const nextChildren = [
  h('p', { key: 'A' }, 'A'),
  h('p', { key: 'B' }, 'B'),
  h('p', { key: 'E' }, 'E'),
  h('p', { key: 'C', id: 'c2' }, 'C'),
  h('p', { key: 'F' }, 'F'),
  h('p', { key: 'G' }, 'G'),
];
export default {
  name: 'ArrayToArray',
  setup() {
    const isChange = ref(false);
    window.isChange = isChange;
    return {
      isChange,
    };
  },
  render() {
    const self = this;
    return self.isChange === true ? h('div', {}, nextChildren) : h('div', {}, prevChildren);
  },
};
