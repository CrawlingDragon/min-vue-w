'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const Fragment = Symbol('Fragment');
const Text = Symbol('Text');
function createVNode(type, props, children) {
    const vNode = {
        type,
        props,
        children,
        el: null,
        shapeFlag: getShapeFlag(type),
    }; //处理虚拟节点
    //children
    if (typeof children === 'string') {
        // | 或运算符 代表设置
        vNode.shapeFlag = vNode.shapeFlag | 4 /* ShapeFlags.TEXT_CHILDREN */;
    }
    else if (Array.isArray(children)) {
        vNode.shapeFlag = vNode.shapeFlag | 8 /* ShapeFlags.ARRAY_CHILDREN */;
    }
    //判断是否是slot children
    // slot 必须为组件类型 children为object
    if (vNode.shapeFlag & 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
        if (typeof children === 'object') {
            vNode.shapeFlag = vNode.shapeFlag | 16 /* ShapeFlags.SLOT_CHILDREN */;
        }
    }
    return vNode;
}
function createTextVnode(text) {
    return createVNode(Text, {}, text);
}
function getShapeFlag(type) {
    return typeof type === 'string' ? 1 /* ShapeFlags.ELEMENT */ : 2 /* ShapeFlags.STATEFUL_COMPONENT */;
}

function renderSlots(slots, name, props) {
    let slot = slots[name];
    if (slot) {
        if (typeof slot === 'function') {
            // slot为函数时，传入参数props，传递变量
            return createVNode(Fragment, {}, slot(props));
        }
    }
}

const PublicPropertiesMap = {
    $el: (instance) => instance.vnode.el,
    $slots: (instance) => instance.slots,
};
// 用于ctx的proxy的handler函数封装
const PublicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        const { setupState, props } = instance;
        const hasOwn = (val, key) => Object.prototype.hasOwnProperty.call(val, key);
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        else if (hasOwn(props, key)) {
            return props[key];
        }
        const publicGetter = PublicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
    },
};

// 初始化 props
function initProps(instance, rawProps) {
    instance.props = rawProps || {};
}

// export function extend(target, obj) {
const isObject = (target) => {
    return target !== null && typeof target === 'object';
};
const camelize = (str) => {
    return str.replace(/-(\w)/g, (_, c) => {
        return c ? c.toLocaleUpperCase() : '';
    });
};
const capitalize = (str) => {
    // 把首字母大写
    return str.charAt(0).toLocaleUpperCase() + str.slice(1);
};
const toHandlerKey = (str) => {
    // 封装 on + event
    return str ? 'on' + capitalize(str) : '';
};

//effect 的核心流程
//依赖收集
let depsMap = new Map();
//依赖触发
function trigger(target, key) {
    let depMap = depsMap.get(target);
    let dep = depMap.get(key); // 拿到对应的dep,为 Set 数据格式
    // //for 循环执行 dep里面的fn函数
    triggerEffects(dep);
    // for (const effect of dep) {
    //   if (effect.scheduler) {
    //     // 如果存在调度器，就执行调度器
    //     effect.scheduler();
    //   } else {
    //     effect.run();
    //   }
    // }
}
function triggerEffects(dep) {
    for (const effect of dep) {
        if (effect.scheduler) {
            // 如果存在调度器，就执行调度器
            effect.scheduler();
        }
        else {
            effect.run();
        }
    }
}

// 缓存get，和set 在代码刚进来的时候就执行get，和set
const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);
function createGetter(isReadonly = false, shallow = false) {
    return function get(target, key) {
        if (key === "__v_isReactive" /* ReactiveFlags.isReactive */) {
            return !isReadonly;
        }
        else if (key === "__v_isReadonly" /* ReactiveFlags.isReadonly */) {
            return isReadonly;
        }
        //target == {foo:1}; key = foo
        //todo 依赖收集
        let res = Reflect.get(target, key);
        if (shallow) {
            // 如果是浅只读，shallow 为true
            return res;
        }
        if (isObject(res)) {
            return isReadonly ? readonly(res) : reactive(res);
        }
        return res;
    };
}
function createSetter() {
    return function set(target, key, value) {
        //value 就是新值
        const res = Reflect.set(target, key, value);
        // todo 触发依赖
        trigger(target, key);
        return res;
    };
}
const mutableHandlers = {
    get,
    set,
};
const readonlyHandlers = {
    get: readonlyGet,
    set(target, key, value) {
        console.warn(`warn key:${key} set fail,因为 ${key} is readonly`);
        return true;
    },
};
const shallowReadonlyHandlers = Object.assign({}, readonlyHandlers, {
    get: shallowReadonlyGet,
});

function createReactiveObject(raw, handlers) {
    // 为了更加的语义化，知道函数在干什么
    if (!isObject(raw)) {
        console.warn(`target ${raw} 不是一个对象`);
        return;
    }
    return new Proxy(raw, handlers);
}
function reactive(raw) {
    // raw ={foo:1}
    return createReactiveObject(raw, mutableHandlers);
}
function readonly(raw) {
    return createReactiveObject(raw, readonlyHandlers);
}
function shallowReadonly(raw) {
    return createReactiveObject(raw, shallowReadonlyHandlers);
}

// emit 大致实现思路是：
function emit(instance, event, ...args) {
    // tpp 开发方式，先实现一个特定的行为，-> 然后重构成通用方案
    //add -> Add
    // get-food -> getFood
    const { props } = instance;
    const handlerName = toHandlerKey(camelize(event));
    const handler = props[handlerName];
    handler && handler(...args);
}

function initSlots(instance, children) {
    // 首先判断是否是slot，是，进行处理
    const { vnode } = instance;
    if (vnode.shapeFlag & 16 /* ShapeFlags.SLOT_CHILDREN */) {
        let slots = {};
        for (let key in children) {
            let value = children[key];
            // value为函数时，传入参数props
            slots[key] = (props) => normalizeProps(value(props));
        }
        instance.slots = slots;
    }
}
function normalizeProps(value) {
    // 兼容value 可以是数组和 单个h函数的情况
    return Array.isArray(value) ? value : [value];
}

function createComponent(vnode) {
    const component = Object.assign(Object.assign({ vnode: vnode }, vnode), { type: vnode.type, setupState: {}, props: {}, slot: {}, emit: () => { } });
    // console.log('component.emit :>> before ', component.emit);
    component.emit = emit.bind(null, component);
    // console.log('component.emit :>> after ', component.emit);
    return component;
}
function setupComponent(instance) {
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

function render(vNode, rootContainer) {
    // 主要是执行 patch方法
    patch(vNode, rootContainer);
}
function patch(vNode, container) {
    const { type } = vNode;
    switch (type) {
        case Fragment:
            // fragment类型 -> 只渲染就可以
            processFragment(vNode, container);
            break;
        case Text:
            processText(vNode, container);
            break;
        default:
            //判断vNode的类型 ，组件component？，element？
            if (vNode.shapeFlag & 1 /* ShapeFlags.ELEMENT */) {
                // type 为string,说明是element
                processElement(vNode, container);
            }
            else if (vNode.shapeFlag & 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
                // type 为 object ，说明为component
                processComponent(vNode, container);
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
function processFragment(vNode, container) {
    // 处理fragment类型
    mountChildren(vNode, container);
}
function processElement(vnode, container) {
    //1:mount element
    // 2：update element
    mountElement(vnode, container);
}
function mountElement(vnode, container) {
    const el = (vnode.el = document.createElement(vnode.type));
    // 根据h函数上的第二个参数，props，设置el的setAttribute
    const { props } = vnode;
    //正则判断是否是事件
    const isOn = (key) => {
        //如果是以on为开头，第三个字符串为答谢的A-Z，则命中正则
        return /^on[A-Z]/.test(key);
    };
    for (let key in props) {
        let val = props[key];
        if (isOn(key)) {
            const eventName = key.slice(2).toLocaleLowerCase();
            el.addEventListener(eventName, val);
        }
        else {
            el.setAttribute(key, val);
        }
    }
    // 根据h函数的第三个参数，children，如果是string类型，直接设置textContent为children内容
    // 如果是对象的话，继续patch，重新判断是component，or element，processComponent or processElement
    const { children } = vnode;
    if (vnode.shapeFlag & 4 /* ShapeFlags.TEXT_CHILDREN */) {
        el.textContent = children;
    }
    else if (vnode.shapeFlag & 8 /* ShapeFlags.ARRAY_CHILDREN */) {
        children.forEach((item) => {
            patch(item, el);
        });
    }
    // 最后把el 插入到container 这个el上
    container.appendChild(el);
}
function mountChildren(vnode, container) {
    vnode.children.forEach((v) => {
        patch(v, container);
    });
}
function processComponent(vNode, container) {
    mountComponent(vNode, container); //既然是处理组件，那就先挂载组件
}
function mountComponent(initialVNode, container) {
    //挂载组件的时候，先创建一个组件实例 instance
    const instance = createComponent(initialVNode);
    setupComponent(instance); // 安装组件实例
    setupRenderEffect(instance, initialVNode, container);
}
function setupRenderEffect(instance, initialVNode, container) {
    const { proxy } = instance;
    const subTree = instance.render.call(proxy);
    //vnode -> patch
    // vnode -> element - mountElement
    patch(subTree, container);
    //当所有的element都patch完，把instance.el赋值给vnode.el
    initialVNode.el = subTree.el;
}

function createApp(rootComponent) {
    return {
        //返回一个app对象，
        mount(rootContainer) {
            // app对象拥有的mount方法，用于挂载真实dom
            //1.首先会根据根节点，创建虚拟节点，vnode
            //2.然后之后的操作，都会根据这个vnode为入口，进行操作
            const vNode = createVNode(rootComponent);
            render(vNode, rootContainer);
        },
    };
}

function h(type, props, children) {
    // h函数内的三个参数，分别是 type，第二个是props，第三个是children
    const vnode = createVNode(type, props, children);
    // 创建vnode，分别传入这三个参数，
    return vnode;
}

exports.createApp = createApp;
exports.createTextVnode = createTextVnode;
exports.h = h;
exports.renderSlots = renderSlots;
exports.shallowReadonly = shallowReadonly;
