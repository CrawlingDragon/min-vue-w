import { createRenderer } from '../runtime-core/index';

function createElement(type) {
  return document.createElement(type);
}
function patchProps(el, key, val) {
  const isOn = (key: any) => {
    //如果是以on为开头，第三个字符串为答谢的A-Z，则命中正则
    return /^on[A-Z]/.test(key);
  };
  if (isOn(key)) {
    const eventName = key.slice(2).toLocaleLowerCase();
    el.addEventListener(eventName, val);
  } else {
    el.setAttribute(key, val);
  }
}
function inset(el, parent) {
  parent.appendChild(el);
}

// 执行render函数，传递参数，设置 createElement,patchProps,inset方法 ，这里是dom操作的方式
const renderer: any = createRenderer({ createElement, patchProps, inset });

export function createApp(...arg) {
  // render.createApp 已经把render函数执行了一遍
  let r = renderer.createApp(...arg);
  return r;
}

// 由于runtime-dom 包括 runtime-core
// 所以runtime-core 的导出放在runtime-dom 内
export * from '../runtime-core/index';
