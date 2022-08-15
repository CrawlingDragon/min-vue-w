// export function extend(target, obj) {
//   return Object.assign(target, obj);
// }
export const EMPTY_OBJ = {};
export const extend = Object.assign;
export const isObject = (target) => {
  return target !== null && typeof target === 'object';
};

export function hasChanged(val, newVal) {
  return !Object.is(val, newVal);
}

export const camelize = (str: string) => {
  return str.replace(/-(\w)/g, (_, c) => {
    return c ? c.toLocaleUpperCase() : '';
  });
};

const capitalize = (str: string) => {
  // 把首字母大写
  return str.charAt(0).toLocaleUpperCase() + str.slice(1);
};

export const toHandlerKey = (str: string) => {
  // 封装 on + event
  return str ? 'on' + capitalize(str) : '';
};
