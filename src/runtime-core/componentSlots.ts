import { ShapeFlags } from '../shared/shapeFlags';
export function initSlots(instance, children) {
  // 首先判断是否是slot，是，进行处理
  const { vnode } = instance;
  if (vnode.shapeFlag & ShapeFlags.SLOT_CHILDREN) {
    let slots = {};
    for (let key in children) {
      let value = children[key];
      // value为函数时，传入参数props
      slots[key] = (props) => normalizeProps(value(props));
    }
    instance.slots = slots;
  }
}

function normalizeProps(value) {
  // 兼容value 可以是数组和 单个h函数的情况
  return Array.isArray(value) ? value : [value];
}
