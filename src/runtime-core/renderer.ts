import { createComponent, setupComponent } from './component';
import { isObject } from '../shared/index';

export function render(vNode, rootContainer) {
  // 主要是执行 patch方法
  patch(vNode, rootContainer);
}

function patch(vNode, container) {
  //判断vNode的类型 ，组件component？，element？
  if (typeof vNode.type === 'string') {
    // type 为string,说明是element
    processElement(vNode, container);
  } else if (isObject(vNode.type)) {
    // type 为 object ，说明为component
    processComponent(vNode, container);
    // 暂时只处理component类型
  }
}
function processElement(vnode, container) {
  //1:mount element
  // 2：update element
  mountElement(vnode, container);
}

function mountElement(vnode: any, container) {
  const el = document.createElement(vnode.type);
  // 根据h函数上的第二个参数，props，设置el的setAttribute
  const { props } = vnode;
  for (let key in props) {
    let val = props[key];
    el.setAttribute(key, val);
  }

  // 根据h函数的第三个参数，children，如果是string类型，直接设置textContent为children内容
  // 如果是对象的话，继续patch，重新判断是component，or element，processComponent or processElement
  const { children } = vnode;
  if (typeof children === 'string') {
    el.textContent = children;
  } else if (Array.isArray(children)) {
    children.forEach((item) => {
      patch(item, el);
    });
  }

  // 最后把el 插入到container 这个el上
  container.appendChild(el);
}
function processComponent(vNode, container) {
  mountComponent(vNode, container); //既然是处理组件，那就先挂载组件
}

function mountComponent(VNode, container) {
  //挂载组件的时候，先创建一个组件实例 instance
  const instance = createComponent(VNode);
  setupComponent(instance); // 安装组件实例
  setupRenderEffect(instance, container);
}
function setupRenderEffect(instance, container) {
  const subTree = instance.render();
  //vnode -> patch
  // vnode -> element - mountElement

  patch(subTree, container);
}
