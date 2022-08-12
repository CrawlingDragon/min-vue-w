import { createComponent, setupComponent } from './component';
import { isObject } from '../shared/index';
import { ShapeFlags } from '../shared/shapeFlags';
import { Fragment, Text } from './vnode';
import { createAppApi } from './createApp';
import { effect } from '../reactivity/effect';

export function createRenderer(options) {
  const {
    createElement: hostCreateElement,
    patchProps: hostPatchProps,
    inset: hostInset,
  } = options;

  function render(vNode, rootContainer, parentComponent) {
    // 主要是执行 patch方法
    patch(null, vNode, rootContainer, parentComponent);
  }

  function patch(n1, n2, container, parentComponent) {
    const { type } = n2;
    switch (type) {
      case Fragment:
        // fragment类型 -> 只渲染就可以
        processFragment(n2, container, null);
        break;
      case Text:
        processText(n2, container);
        break;
      default:
        //判断vNode的类型 ，组件component？，element？
        if (n2.shapeFlag & ShapeFlags.ELEMENT) {
          // type 为string,说明是element
          processElement(n1, n2, container, parentComponent);
        } else if (n2.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          // type 为 object ，说明为component
          processComponent(n2, container, parentComponent);
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
  function processElement(n1, n2, container, parentComponent) {
    if (!n1) {
      //1:mount element
      // 2：update element
      mountElement(n1, n2, container, parentComponent);
    } else {
      updateElement(n1, n2, container);
    }
  }
  function updateElement(n1, n2, container) {
    console.log('updateElement :>> ');
    console.log('n1 :>> ', n1);
    console.log('n2 :>> ', n2);
  }
  function mountElement(n1, n2: any, container, parentComponent) {
    const el = (n2.el = hostCreateElement(n2.type));
    // 根据h函数上的第二个参数，props，设置el的setAttribute
    const { props } = n2;
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
    const { children } = n2;
    if (n2.shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      el.textContent = children;
    } else if (n2.shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      children.forEach((item) => {
        patch(null, item, el, parentComponent);
      });
    }

    // 最后把el 插入到container 这个el上
    // container.appendChild(el);
    hostInset(el, container);
  }

  function mountChildren(vnode, container, parentComponent) {
    vnode.children.forEach((v) => {
      patch(null, v, container, parentComponent);
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
    // 利用effect对subTree 进行依赖收集
    effect(() => {
      // 初始化，也就是 第一次挂载时
      if (!instance.isMounted) {
        console.log('init :>> ');
        const { proxy } = instance;
        const subTree = (instance.subTree = instance.render.call(proxy));
        //vnode -> patch
        // vnode -> element - mountElement
        patch(null, subTree, container, instance);

        //当所有的element都patch完，把instance.el赋值给vnode.el
        initialVNode.el = subTree.el;
        instance.isMounted = true;
      } else {
        const { proxy } = instance;
        const subTree = instance.render.call(proxy);
        const prevSubTree = instance.subTree; //上一次的subTree
        patch(prevSubTree, subTree, container, instance);
        instance.subTree = subTree;
        console.log('update :>> ');
      }
    });
  }
  return {
    createApp: createAppApi(render),
  };
}
