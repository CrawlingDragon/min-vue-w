export function createComponent(vnode) {
  const component = { ...vnode, type: vnode.type };
  return component;
}

export function setupComponent(instance) {
  // init props
  // init slots
  setupStatefulComponent(instance); //创建一个有状态的组件
}

function setupStatefulComponent(instance) {
  const component = instance.type;
  const { setup } = component; //解构setup
  if (setup) {
    // setup()返回的可能是function（也就是返回一个render函数），可能是object
    const setupResult = setup();
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
  if (!Component.render) {
    Component.render = instance.render;
  }
}
