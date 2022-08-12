import { createComponent, setupComponent } from './component';
import { isObject } from '../shared/index';
import { ShapeFlags } from '../shared/shapeFlags';
import { Fragment, Text } from './vnode';
import { createAppApi } from './createApp';

export function createRenderer(options) {
  console.log('options :>> ', options);
  const {
    createElement: hostCreateElement,
    patchProps: hostPatchProps,
    inset: hostInset,
  } = options;

  function render(vNode, rootContainer, parentComponent) {
    // 主要是执行 patch方法
    patch(vNode, rootContainer, parentComponent);
  }

  function patch(vNode, container, parentComponent) {
    const { type } = vNode;
    switch (type) {
      case Fragment:
        // fragment类型 -> 只渲染就可以
        processFragment(vNode, container, null);
        break;
      case Text:
        processText(vNode, container);
        break;
      default:
        //判断vNode的类型 ，组件component？，element？
        if (vNode.shapeFlag & ShapeFlags.ELEMENT) {
          // type 为string,说明是element
          processElement(vNode, container, parentComponent);
        } else if (vNode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          // type 为 object ，说明为component
          processComponent(vNode, container, parentComponent);
          // 暂时只处理component类型
        }
        break;
    }
  }

  function processText(vNode, container) {
    //处理text类型
    const textNode = (vNode.el = document.createTextNode(vNode.children));
    container.append(textNode);
  }

  function processFragment(vNode, container, parentComponent) {
    // 处理fragment类型
    mountChildren(vNode, container, parentComponent);
  }
  function processElement(vnode, container, parentComponent) {
    //1:mount element
    // 2：update element
    mountElement(vnode, container, parentComponent);
  }

  function mountElement(vnode: any, container, parentComponent) {
    const el = (vnode.el = hostCreateElement(vnode.type));
    // 根据h函数上的第二个参数，props，设置el的setAttribute
    const { props } = vnode;
    for (let key in props) {
      let val = props[key];
      hostPatchProps(el, key, val);
      // //正则判断是否是事件
      // const isOn = (key: any) => {
      //   //如果是以on为开头，第三个字符串为答谢的A-Z，则命中正则
      //   return /^on[A-Z]/.test(key);
      // };

      //   if (isOn(key)) {
      //     const eventName = key.slice(2).toLocaleLowerCase();
      //     el.addEventListener(eventName, val);
      //   } else {
      //     el.setAttribute(key, val);
      //   }
    }

    // 根据h函数的第三个参数，children，如果是string类型，直接设置textContent为children内容
    // 如果是对象的话，继续patch，重新判断是component，or element，processComponent or processElement
    const { children } = vnode;
    if (vnode.shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      el.textContent = children;
    } else if (vnode.shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      children.forEach((item) => {
        patch(item, el, parentComponent);
      });
    }

    // 最后把el 插入到container 这个el上
    // container.appendChild(el);
    hostInset(el, container);
  }

  function mountChildren(vnode, container, parentComponent) {
    vnode.children.forEach((v) => {
      patch(v, container, parentComponent);
    });
  }
  function processComponent(vNode, container, parentComponent) {
    mountComponent(vNode, container, parentComponent); //既然是处理组件，那就先挂载组件
  }

  function mountComponent(initialVNode, container, parentComponent) {
    //挂载组件的时候，先创建一个组件实例 instance
    const instance = createComponent(initialVNode, parentComponent);
    setupComponent(instance); // 安装组件实例
    setupRenderEffect(instance, initialVNode, container);
  }
  function setupRenderEffect(instance, initialVNode, container) {
    const { proxy } = instance;

    const subTree = instance.render.call(proxy);
    //vnode -> patch
    // vnode -> element - mountElement
    patch(subTree, container, instance);

    //当所有的element都patch完，把instance.el赋值给vnode.el
    initialVNode.el = subTree.el;
  }
  return {
    createApp: createAppApi(render),
  };
}
