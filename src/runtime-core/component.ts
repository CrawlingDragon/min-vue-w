import { PublicInstanceProxyHandlers } from './componentsPublicInstance';
import { initProps } from './componentProps';
import { shallowReadonly } from '../reactivity/reactive';
import { emit } from './componentEmit';
import { initSlots } from './componentSlots';
export function createComponent(vnode) {
  const component = {
    vnode: vnode,
    ...vnode,
    type: vnode.type,
    setupState: {},
    props: {},
    slot: {},
    emit: () => {},
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
    // setup()返回的可能是function（也就是返回一个render函数），可能是object
    const setupResult = setup(shallowReadonly(instance.props), { emit: instance.emit }); //props 是一个只读，不能修改
    handleSetupResult(instance, setupResult); //用handleSetupResult函数处理 这个结构
  }
}

function handleSetupResult(instance, setupResult) {
  // todo function
  // 暂时只处理object 结构
  if (typeof setupResult === 'object') {
    instance.setupState = setupResult;
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
