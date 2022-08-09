import { createVNode, Fragment } from '../vnode';
export function renderSlots(slots, name, props) {
  let slot = slots[name];
  if (slot) {
    if (typeof slot === 'function') {
      // slot为函数时，传入参数props，传递变量
      return createVNode(Fragment, {}, slot(props));
    }
  }
}
