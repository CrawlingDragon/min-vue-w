// import { render } from './renderer';
import { createVNode } from './vnode';

// 通过外加一层函数的方法，把render 传递进去
// 在createRender 内返回的createApp对象，执行了一遍createAppApi，也算是 科里化
// createAppApi(render)(...arg)
export function createAppApi(render) {
  return function createApp(rootComponent) {
    return {
      //返回一个app对象，
      mount(rootContainer) {
        // app对象拥有的mount方法，用于挂载真实dom
        //1.首先会根据根节点，创建虚拟节点，vnode
        //2.然后之后的操作，都会根据这个vnode为入口，进行操作
        const vNode = createVNode(rootComponent);
        render(vNode, rootContainer, null);
      },
    };
  };
}
