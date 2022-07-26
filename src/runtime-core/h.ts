import { createVNode } from './vnode';
export function h(type, props?, children?) {
  // h函数内的三个参数，分别是 type，第二个是props，第三个是children
  const vnode = createVNode(type, props, children);
  // 创建vnode，分别传入这三个参数，
  return vnode;
}
