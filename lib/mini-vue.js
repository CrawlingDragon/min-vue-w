'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function createComponent(vnode) {
    const component = Object.assign(Object.assign({}, vnode), { type: vnode.type });
    return component;
}
function setupComponent(instance) {
    // init props
    // init slots
    setupStatefulComponent(instance); //创建一个有状态的组件
}
function setupStatefulComponent(instance) {
    const component = instance.type; // 根据组件实例，获取到组件
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

function render(vNode, rootContainer) {
    // 主要是执行 patch方法
    patch(vNode);
}
function patch(vNode, container) {
    //判断vNode的类型 ，组件component？，element？
    processComponent(vNode); // 暂时只处理component类型
}
function processComponent(vNode, container) {
    mountComponent(vNode); //既然是处理组件，那就先挂载组件
}
function mountComponent(VNode, container) {
    //挂载组件的时候，先创建一个组件实例 instance
    const instance = createComponent(VNode);
    setupComponent(instance); // 安装组件实例
    setupRenderEffect(instance);
}
function setupRenderEffect(instance, container) {
    const subTree = instance.render();
    //vnode -> patch
    // vnode -> element - mountElement
    patch(subTree);
}

function createVNode(type, props, children) {
    const vNode = { type, props, children }; //处理虚拟节点
    return vNode;
}

function createApp(rootComponent) {
    return {
        //返回一个app对象，
        mount(rootContainer) {
            // app对象拥有的mount方法，用于挂载真实dom
            //1.首先会根据根节点，创建虚拟节点，vnode
            //2.然后之后的操作，都会根据这个vnode为入口，进行操作
            const vNode = createVNode(rootComponent);
            render(vNode);
        },
    };
}

function h(type, props, children) {
    const vnode = createVNode(type, props, children);
    return vnode;
}

exports.createApp = createApp;
exports.h = h;
