import { createComponent, setupComponent } from './component';

export function render(vNode, rootContainer) {
  // 主要是执行 patch方法
  patch(vNode, rootContainer);
}

function patch(vNode, container) {
  //判断vNode的类型 ，组件component？，element？
  processComponent(vNode, container); // 暂时只处理component类型
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
