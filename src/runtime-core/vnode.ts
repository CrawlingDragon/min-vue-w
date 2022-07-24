export function createVNode(type, props?, children?) {
  const vNode = { type, props, children }; //处理虚拟节点
  return vNode;
}
