'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

// export function extend(target, obj) {
//   return Object.assign(target, obj);
// }
const EMPTY_OBJ = {};
const extend = Object.assign;
const isObject = (target) => {
    return target !== null && typeof target === 'object';
};
function hasChanged(val, newVal) {
    return !Object.is(val, newVal);
}
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
let activeEffect;
let shouldTrack; //是否应该收集依赖
class ReactiveEffect {
    constructor(fn, scheduler) {
        this.scheduler = scheduler;
        this.deps = [];
        this.active = true; // 处于暂停状态
        this._fn = fn;
    }
    run() {
        if (!this.active) {
            // active 为false的时候，说明再stop状态
            // 上一次正常执行的时候，shouldTrack 为false
            // 接着直接执行了fn，没有在shouldTrack 为true，也就是没有依赖收集之后，再执行fn
            // 但是shouldTrack 为false，在track函数内，被返回了，没有正常的依赖手机，所以还是上一次的值，并没有真实的执行fn函数
            return this._fn();
        }
        shouldTrack = true;
        //把全局变量activeEffect 保存为class的实例
        activeEffect = this;
        let r = this._fn();
        // reset shouldTrack
        shouldTrack = false;
        return r; //返回fn函数执行的返回值
    }
    stop() {
        if (this.active) {
            if (this.onStop) {
                this.onStop();
            }
            // stop() 实质就是情况 当前ActiveEffect中的 dep
            // this.deps.forEach((el: any) => {
            //   // el => Set
            //   el.delete(this);
            // });
            cleanupEffect(this);
            this.active = false;
        }
    }
}
function cleanupEffect(effect) {
    effect.deps.forEach((dep) => {
        dep.delete(effect);
    });
}
//依赖收集
let depsMap = new Map();
function track(target, key) {
    // if (!activeEffect) return;
    // if (!shouldTrack) return; // stop 时，不应该手机依赖
    if (!isTracking())
        return; //是对上面 ！activeEffect 和!shouldTrack的封装，说明不在收集中的时候，直接return
    //保存target为key的map数据
    let depMap = depsMap.get(target);
    if (!depMap) {
        //如果是初始化保存effect
        depMap = new Map();
        depsMap.set(target, depMap);
    }
    // 保存key（这个key为参数key）为map的数据
    let dep = depMap.get(key);
    if (!dep) {
        //如果dep不存在，初始化数据
        dep = new Set();
        depMap.set(key, dep);
    }
    //如果没有只有get，没有set，activeEffect为null，直接退出
    trackEffects(dep);
    // if (dep.has(activeEffect)) {
    //   return;
    // }
    // // 在目标dep中，保存reactiveEffect - class的实例，其实也是为了保存fn函数
    // dep.add(activeEffect);
    // activeEffect.deps.push(dep); //activeEffect 在run之后，会等于 ReactiveEffect类的实例
}
// 封装依赖收集，为了给reactive和ref使用
function trackEffects(dep) {
    if (dep.has(activeEffect)) {
        return;
    }
    // 在目标dep中，保存reactiveEffect - class的实例，其实也是为了保存fn函数
    dep.add(activeEffect);
    activeEffect.deps.push(dep); //activeEffect 在run之后，会等于 ReactiveEffect类的实例
}
function isTracking() {
    return shouldTrack && activeEffect !== undefined;
}
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
function effect(fn, options = {}) {
    const _effect = new ReactiveEffect(fn, options.scheduler);
    _effect.run();
    extend(_effect, options);
    // _effect.onStop = options.onStop;
    const runner = _effect.run.bind(_effect);
    // runner上挂载一个一个effect属性 = _effect 实例
    runner.effect = _effect;
    //bind(_effect)是为了处理在 构造函数run函数的this指向问题，指向该实例
    return runner;
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
        if (!isReadonly) {
            track(target, key);
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

class RefImpl {
    constructor(value) {
        this.__is_Ref = true;
        this.rawValue = value;
        this._value = convert(value);
        this.dep = new Set(); //用来保存依赖收集，和触发依赖
    }
    get value() {
        if (!isTracking()) {
            return this._value;
        }
        trackEffects(this.dep);
        return this._value;
    }
    set value(newValue) {
        if (!hasChanged(newValue, this.rawValue))
            return;
        this.rawValue = newValue;
        this._value = convert(newValue);
        triggerEffects(this.dep);
    }
}
// 封装 value 为对象时，就用reactive包裹，否则就返回原生value
function convert(value) {
    return isObject(value) ? reactive(value) : value;
}
function ref(value) {
    return new RefImpl(value);
}
function isRef(ref) {
    // 在class中，预设一个公共属性，直接可以在实例上取到的 public -> __is_Ref
    // 有，就等于true，没有 就等于undefined，所以用!!转译成 boolean值
    return !!ref.__is_Ref;
}
function unRef(ref) {
    //如果是ref，就返回ref值，否则就返回本身
    return isRef(ref) ? ref.value : ref;
}
function proxyRefs(ref) {
    return new Proxy(ref, {
        get(target, key) {
            //如果是ref，就返回.value ，不是则返回ref值，也就是上面的unRef
            return unRef(Reflect.get(target, key));
        },
        set(target, key, value) {
            // 如果原来的值 target[key] 是一个ref，且新的赋值，也就是等号右边的值，不是一个ref
            // 我们需要把 target[key] 等号左边的ref，.value = value
            // 否则就直接返回该值
            if (isRef(target[key]) && !isRef(value)) {
                return (target[key].value = value);
            }
            else {
                return Reflect.set(target, key, value);
            }
        },
    });
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

function createComponent(vnode, parent) {
    const component = Object.assign(Object.assign({ vnode: vnode }, vnode), { type: vnode.type, setupState: {}, props: {}, slot: {}, emit: () => { }, isMounted: false, subTree: {}, // 用于标记组件的 虚拟dom树
        parent, provides: parent ? parent.provides : {} });
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
function getCurrentInstance() {
    // 思路大致：在setup函数内进行赋值
    // 然后重置为null
    return currentInstance;
}
function setCurrentInstance(instance) {
    // 相比较 直接用currentInstance =  instance
    // 用函数 setCurrentInstance(), 更利于调试，相当于一个中间件，
    currentInstance = instance;
}

const Fragment = Symbol('Fragment');
const Text = Symbol('Text');
function createVNode(type, props, children) {
    const vNode = {
        type,
        props,
        key: props && props.key,
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

// import { render } from './renderer';
// 通过外加一层函数的方法，把render 传递进去
// 在createRender 内返回的createApp对象，执行了一遍createAppApi，也算是 科里化
// createAppApi(render)(...arg)
function createAppApi(render) {
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

function createRenderer(options) {
    const { createElement: hostCreateElement, patchProps: hostPatchProps, inset: hostInset, remove: hostRemove, setElementText: hostSetElementText, } = options;
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
                if (n2.shapeFlag & 1 /* ShapeFlags.ELEMENT */) {
                    // type 为string,说明是element
                    processElement(n1, n2, container, parentComponent, anchor);
                }
                else if (n2.shapeFlag & 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
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
        mountChildren(vNode.children, container, parentComponent);
    }
    function processElement(n1, n2, container, parentComponent, anchor) {
        if (!n1) {
            //1:mount element
            // 2：update element
            mountElement(n1, n2, container, parentComponent, anchor);
        }
        else {
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
        if (shapeFlag & 4 /* ShapeFlags.TEXT_CHILDREN */) {
            if (prevShapeFlag & 8 /* ShapeFlags.ARRAY_CHILDREN */) {
                // 旧节点为数组时,
                // 1.情况children 数组，
                unmountChildren(n1.children);
                //2：重新赋值为text内容
                hostSetElementText(container, c2);
            }
            else if (c1 !== c2) {
                //也就是 新旧 children 都为text时，两者的text也不相等
                hostSetElementText(container, c2);
            }
        }
        //第二种情况，当新children 是 数组
        if (shapeFlag & 8 /* ShapeFlags.ARRAY_CHILDREN */) {
            if (prevShapeFlag & 4 /* ShapeFlags.TEXT_CHILDREN */) {
                // 旧children 为 text时
                hostSetElementText(container, '');
                mountChildren(c2, container, parentComponent);
            }
            if (prevShapeFlag & 8 /* ShapeFlags.ARRAY_CHILDREN */) {
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
            }
            else {
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
            }
            else {
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
        }
        else if (i > e2) {
            // 老的 比 新的多
            while (i <= e1) {
                hostRemove(c1[e1].el);
                i++;
            }
        }
        else ;
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
    function mountElement(n1, n2, container, parentComponent, anchor) {
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
        if (n2.shapeFlag & 4 /* ShapeFlags.TEXT_CHILDREN */) {
            el.textContent = children;
        }
        else if (n2.shapeFlag & 8 /* ShapeFlags.ARRAY_CHILDREN */) {
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
            }
            else {
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

function renderSlots(slots, name, props) {
    let slot = slots[name];
    if (slot) {
        if (typeof slot === 'function') {
            // slot为函数时，传入参数props，传递变量
            return createVNode(Fragment, {}, slot(props));
        }
    }
}

function h(type, props, children) {
    // h函数内的三个参数，分别是 type，第二个是props，第三个是children
    const vnode = createVNode(type, props, children);
    // 创建vnode，分别传入这三个参数，
    return vnode;
}

// ps:开发思想
// 从最小的功能开始实现。 随着demo变复杂或者需求变多，在慢慢实现其他功能
// 也防止过渡设计
function provide(key, value) {
    //存
    const instance = getCurrentInstance();
    // 因为provide只能在setup内执行，所以需要判断instance 是否存在
    if (instance) {
        let { provides } = instance;
        let parentProvides = instance.parent.provides;
        // 当前组件的provide 等于 父级parentProvides时，才会初始化provides， init
        if (provides === parentProvides) {
            // 相当于 当前组件的provides的原型链上会有 parentProvides的值
            provides = instance.provides = Object.create(parentProvides);
        }
        provides[key] = value;
    }
}
function inject(key, defaultVal) {
    //取
    const instance = getCurrentInstance();
    if (instance) {
        //关键步骤：取当前组件上的父组件内的 provides
        let provides = instance.parent.provides;
        let value = provides[key];
        if (!value) {
            if (typeof defaultVal === 'function') {
                return defaultVal();
            }
            return defaultVal;
        }
        else if (key in provides) {
            return value;
        }
    }
}

function createElement(type) {
    return document.createElement(type);
}
function patchProps(el, key, prevVal, nextVal) {
    const isOn = (key) => {
        //如果是以on为开头，第三个字符串为答谢的A-Z，则命中正则
        return /^on[A-Z]/.test(key);
    };
    // debugger;
    if (isOn(key)) {
        const eventName = key.slice(2).toLocaleLowerCase();
        el.addEventListener(eventName, nextVal);
    }
    else {
        // 如果新的值等于undefined or null ，则删除这个属性
        if (nextVal === undefined || nextVal === null) {
            el.removeAttribute(key);
        }
        else {
            el.setAttribute(key, nextVal);
        }
    }
}
function inset(children, parent, anchor = null) {
    // 添加元素
    // parent.appendChild(el);
    parent.insertBefore(children, anchor || null);
}
function remove(children) {
    let parent = children.parentNode;
    if (parent) {
        parent.removeChild(children);
    }
}
function setElementText(el, text) {
    el.textContent = text;
}
// 执行render函数，传递参数，设置 createElement,patchProps,inset方法 ，这里是dom操作的方式
const renderer = createRenderer({ createElement, patchProps, inset, remove, setElementText });
function createApp(...arg) {
    // render.createApp 已经把render函数执行了一遍
    let r = renderer.createApp(...arg);
    return r;
}

exports.createApp = createApp;
exports.createRenderer = createRenderer;
exports.createTextVnode = createTextVnode;
exports.getCurrentInstance = getCurrentInstance;
exports.h = h;
exports.inject = inject;
exports.provide = provide;
exports.ref = ref;
exports.renderSlots = renderSlots;
exports.shallowReadonly = shallowReadonly;
