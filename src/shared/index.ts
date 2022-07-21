// export function extend(target, obj) {
//   return Object.assign(target, obj);
// }
export const extend = Object.assign;
export const isObject = (target) => {
  return target !== null && typeof target === 'object';
};

export function hasChanged(val, newVal) {
  return !Object.is(val, newVal);
}
