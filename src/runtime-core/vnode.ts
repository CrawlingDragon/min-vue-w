import { ShapeFlags } from '../shared/shapeFlags';
export const Fragment = Symbol('Fragment');
export const Text = Symbol('Text');

export function createVNode(type, props?, children?) {
  const vNode = {
    type,
    props,
    key: props && props.key,
    children,
    el: null,
    shapeFlag: getShapeFlag(type),
  }; //处理虚拟节点

  //children
  if (typeof children === 'string') {
    // | 或运算符 代表设置
    vNode.shapeFlag = vNode.shapeFlag | ShapeFlags.TEXT_CHILDREN;
  } else if (Array.isArray(children)) {
    vNode.shapeFlag = vNode.shapeFlag | ShapeFlags.ARRAY_CHILDREN;
  }

  //判断是否是slot children
  // slot 必须为组件类型 children为object
  if (vNode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
    if (typeof children === 'object') {
      vNode.shapeFlag = vNode.shapeFlag | ShapeFlags.SLOT_CHILDREN;
    }
  }
  return vNode;
}
export function createTextVnode(text: string) {
  return createVNode(Text, {}, text);
}
function getShapeFlag(type) {
  return typeof type === 'string' ? ShapeFlags.ELEMENT : ShapeFlags.STATEFUL_COMPONENT;
}
