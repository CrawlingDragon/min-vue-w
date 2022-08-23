import { PublicInstanceProxyHandlers } from './componentsPublicInstance';
import { initProps } from './componentProps';
import { shallowReadonly } from '../reactivity/reactive';
import { emit } from './componentEmit';
import { initSlots } from './componentSlots';
import { proxyRefs } from '../reactivity/ref';

export function createComponent(vnode, parent) {
  const component = {
    vnode: vnode,
    next: null, // 用来存储下一次更新的vnode
    ...vnode,
    type: vnode.type,
    update: null, // 用来存储更新函数，也就是 effect(updateFn) 返回的update
    setupState: {},
    props: {},
    slot: {},
    emit: () => {},
    isMounted: false, // 标记组件是否挂载，判断是 挂载 or 更新 时机
    subTree: {}, // 用于标记组件的 虚拟dom树
    parent,
    provides: parent ? parent.provides : {}, // 用于provide
  };
  // console.log('component.emit :>> before ', component.emit);
  component.emit = emit.bind(null, component);
  // console.log('component.emit :>> after ', component.emit);
  return component;
}

export function setupComponent(instance) {
  // init props
  initProps(instance, instance.vnode.props);
  // init slots
  initSlots(instance, instance.children);
  setupStatefulComponent(instance); //创建一个有状态的组件
}

function setupStatefulComponent(instance) {
  const component = instance.type; // 根据组件实例，获取到组件

  // ctx，把setup返回的数据，$el,props等数据绑定到instance.proxy 上，用于绑定上下文，用this.xxx 访问
  const proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);
  instance.proxy = proxy;
  const { setup } = component; //解构setup
  if (setup) {
    setCurrentInstance(instance); // 对currentInstance 进行赋值
    // setup()返回的可能是function（也就是返回一个render函数），可能是object
    const setupResult = setup(shallowReadonly(instance.props), { emit: instance.emit }); //props 是一个只读，不能修改
    setCurrentInstance(null); //重置currentInstance
    handleSetupResult(instance, setupResult); //用handleSetupResult函数处理 这个结构
  }
}

function handleSetupResult(instance, setupResult) {
  // todo function
  // 暂时只处理object 结构
  if (typeof setupResult === 'object') {
    // proxyRefs 判断值是否为ref，是就返回.value，否就返回本身
    instance.setupState = proxyRefs(setupResult);
  }
  // 最后要保证组件的render是有值的
  finishComponentSetup(instance);
}

function finishComponentSetup(instance) {
  const Component = instance.type;
  if (Component.render) {
    instance.render = Component.render;
  }
}

// 声明一个全局的变量，保存 当前实例 instance
let currentInstance = null;
export function getCurrentInstance() {
  // 思路大致：在setup函数内进行赋值
  // 然后重置为null
  return currentInstance;
}

export function setCurrentInstance(instance) {
  // 相比较 直接用currentInstance =  instance
  // 用函数 setCurrentInstance(), 更利于调试，相当于一个中间件，
  currentInstance = instance;
}
