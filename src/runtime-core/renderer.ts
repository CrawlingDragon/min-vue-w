import { createComponent, setupComponent } from './component';
import { EMPTY_OBJ, isObject } from '../shared/index';
import { ShapeFlags } from '../shared/shapeFlags';
import { Fragment, Text } from './vnode';
import { createAppApi } from './createApp';
import { effect } from '../reactivity/effect';

export function createRenderer(options) {
  const {
    createElement: hostCreateElement,
    patchProps: hostPatchProps,
    inset: hostInset,
    remove: hostRemove,
    setElementText: hostSetElementText,
  } = options;

  function render(vNode, rootContainer, parentComponent) {
    // 主要是执行 patch方法
    patch(null, vNode, rootContainer, parentComponent);
  }

  function patch(n1, n2, container, parentComponent, anchor = null) {
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
          processElement(n1, n2, container, parentComponent, anchor);
        } else if (n2.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          // type 为 object ，说明为component
          processComponent(n1, n2, container, parentComponent);
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
    mountChildren(vNode.children, container, parentComponent);
  }
  function processElement(n1, n2, container, parentComponent, anchor) {
    if (!n1) {
      //1:mount element
      // 2：update element
      mountElement(n1, n2, container, parentComponent, anchor);
    } else {
      updateElement(n1, n2, container, parentComponent);
    }
  }
  function updateElement(n1, n2, container, parentComponent) {
    // 更新 element
    // console.log('updateElement :>> ');
    console.log('n1 :>> ', n1);
    console.log('n2 :>> ', n2);
    const el = (n2.el = n1.el);
    const newProps = n2.props || EMPTY_OBJ;
    const oldProps = n1.props || EMPTY_OBJ;
    patchChildren(el, n1, n2, parentComponent);
    patchProps(el, oldProps, newProps);
  }
  function patchChildren(container, n1, n2, parentComponent) {
    // 更新子节点-children
    const prevShapeFlag = n1.shapeFlag; // n1 的shapeFlag
    const c1 = n1.children;
    const { shapeFlag } = n2; // n2 的shapeFlag
    const c2 = n2.children;
    //第一种情况 新的节点是 text
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // 旧节点为数组时,
        // 1.情况children 数组，
        unmountChildren(n1.children);
        //2：重新赋值为text内容
        hostSetElementText(container, c2);
      } else if (c1 !== c2) {
        //也就是 新旧 children 都为text时，两者的text也不相等
        hostSetElementText(container, c2);
      }
    }

    //第二种情况，当新children 是 数组
    if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
        // 旧children 为 text时
        hostSetElementText(container, '');
        mountChildren(c2, container, parentComponent);
      }
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // 旧的 children 为 array 时, array diff array
        patchKeyedChildren(c1, c2, container, parentComponent);
      }
    }
  }
  function patchKeyedChildren(c1, c2, container, parentComponent) {
    const l2 = c2.length;
    let i = 0; //左边开始索引
    let e1 = c1.length - 1; //旧的数组的右边索引
    let e2 = l2 - 1; // 旧的数组的右边索引

    function isSomeSameVnode(v1, v2) {
      console.log('isSomeSameVnode :>> ', v1.type === v2.type && v1.key === v2.key);
      return v1.type === v2.type && v1.key === v2.key;
    }
    //左侧对比
    while (i <= e1 && i <= e2) {
      let n1 = c1[i];
      let n2 = c2[i];
      if (isSomeSameVnode(n1, n2)) {
        patch(n1, n2, container, parentComponent);
      } else {
        break;
      }
      i++;
    }
    // 右侧对比
    while (i <= e1 && i <= e2) {
      let n1 = c1[e1];
      let n2 = c2[e2];
      if (isSomeSameVnode(n1, n2)) {
        patch(n1, n2, container, parentComponent);
      } else {
        break;
      }
      e1--;
      e2--;
    }
    // 新的比老的多
    if (i > e1) {
      if (i <= e2) {
        const nextPos = e2 + 1;
        const anchor = nextPos < l2 ? c2[nextPos].el : null;
        while (i <= e2) {
          patch(null, c2[i], container, parentComponent, anchor);
          i++;
        }
      }
    } else if (i > e2) {
      // 老的 比 新的多
      while (i <= e1) {
        hostRemove(c1[e1].el);
        i++;
      }
    } else {
      // 乱序部分，中间对比
      // 删除
      // 添加
      // 互换位置
      // 1:找到中间部分，然后循环。2：在新的c2中间部分创建映射map（如果不存在key使用循环c2。3：在旧的中间部分（c1）循环中 map.get(key),存在则path，不存在则hostRemove().4:优化，创建一个当前的对比的长度，和一个新的中间部分的最大长度，循环中，如果当前长度>总长度，直接删除，continue直接退出循环
      let s1 = i;
      let s2 = i;
      let keyToNewIndexMap = new Map(); //创建一个映射表，map

      let toBePatched = e2 - s2 + 1; // 因为是长度，所以是索引+1
      let patched = 0;

      //遍历新的，填充映射表map
      for (let i = s2; i <= e2; i++) {
        keyToNewIndexMap.set(c2[i].key, i);
      }

      // 遍历旧的，
      let newIndex;
      for (let i = s1; i <= e1; i++) {
        let prevChildren = c1[i];

        //对比元素的长度，大于新的 中间部分长度，则直接删除，无需再对比
        if (patched >= toBePatched) {
          hostRemove(prevChildren.el);
          continue;
        }

        if (prevChildren.key !== null) {
          newIndex = keyToNewIndexMap.get(c1[i].key);
        } else {
          // 如果不存在key，则利用循环的办法
          for (let j = s2; j <= e2; j++) {
            if (isSomeSameVnode(prevChildren, c2[j])) {
              newIndex = j;
              break;
            }
          }
        }

        if (newIndex !== undefined) {
          //说明存在 新的 里面有老的 元素
          patch(prevChildren, c2[newIndex], container, parentComponent, null);
          patched++;
        } else {
          // 不存在则删除该元素
          hostRemove(prevChildren.el);
        }
      }
    }
  }
  function unmountChildren(children) {
    // 情况子节点数组
    for (let i = 0; i < children.length; i++) {
      let el = children[i].el;
      hostRemove(el);
    }
  }
  function patchProps(el, oldProps, newProps) {
    // 更新element的props
    //第一种情况给新属性赋值新的值 foo -> new_foo
    if (newProps !== oldProps) {
      for (let key in newProps) {
        let newVal = newProps[key];
        let oldVal = oldProps[key];
        if (newVal !== oldVal) {
          hostPatchProps(el, key, oldVal, newVal);
        }
      }
    }
    // 第二种情况，当旧的属性，没有出现在新的属性之中
    if (newProps !== EMPTY_OBJ) {
      for (let key in oldProps) {
        if (!(key in newProps)) {
          hostPatchProps(el, key, oldProps[key], null);
        }
      }
    }
  }

  function mountElement(n1, n2: any, container, parentComponent, anchor) {
    const el = (n2.el = hostCreateElement(n2.type));
    // 根据h函数上的第二个参数，props，设置el的setAttribute
    const { props } = n2;
    for (let key in props) {
      let val = props[key];
      hostPatchProps(el, key, null, val);
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
    hostInset(el, container, anchor);
  }

  function mountChildren(children, container, parentComponent) {
    children.forEach((v) => {
      patch(null, v, container, parentComponent);
    });
  }
  function processComponent(n1, n2, container, parentComponent) {
    if (!n1) {
      mountComponent(n2, container, parentComponent); //既然是处理组件，那就先挂载组件
    } else {
      // 更新组件
      updateComponent(n1, n2);
    }
  }

  function updateComponent(n1, n2) {
    let instance = (n2.component = n1.component);
    if (shouldUpdateComponent(n1, n2)) {
      // n2.next = n1.next;
      instance.next = n2;
      // 取出在n1上的组件上的update函数
      //执行update 函数，更新数据
      instance.update();
    } else {
      n2.el = n1.el;
      instance.vnode = n2.vnode;
    }
  }
  function shouldUpdateComponent(n1, n2) {
    const { props: prevProps } = n1;
    const { props: nextProps } = n2;
    for (let key in nextProps) {
      if (prevProps[key] !== nextProps[key]) {
        return true;
      }
    }

    return false;
  }
  function mountComponent(initialVNode, container, parentComponent) {
    //挂载组件的时候，先创建一个组件实例 instance
    const instance = createComponent(initialVNode, parentComponent);
    initialVNode.component = instance;
    setupComponent(instance); // 安装组件实例
    setupRenderEffect(instance, initialVNode, container);
  }
  function setupRenderEffect(instance, initialVNode, container) {
    // 利用effect对subTree 进行依赖收集
    instance.update = effect(() => {
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
        let { next, vnode } = instance;
        if (next) {
          next.el = vnode.el;
          updateComponentPreRender(instance, next);
        }
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
function updateComponentPreRender(instance, nextVnode) {
  instance.vnode = nextVnode;
  instance.next = null;

  instance.props = nextVnode.props;
}
