//effect 的核心流程
//1:首先使用 reactive方法代理目标对象，
//2：在代理的时候，使用new Proxy方法，在get函数时，依赖收集，在set函数时，依次 触发依赖
//3：依赖收集，使用Map -> Map -> Set，创建一个全局reactiveEffect变量临时保存effect实例，最后在对应的Set保存fn函数
//4：依赖触发：在new Proxy的set函数中，根据target，key找到depsMap内的对应effect实例，循环执行fn函数
import { extend } from '../shared';
let activeEffect;
let shouldTrack; //是否应该收集依赖
export class ReactiveEffect {
  private _fn;
  deps = [];
  onStop: any;
  active = true; // 处于暂停状态
  constructor(fn, public scheduler) {
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
  effect.deps.forEach((dep: any) => {
    dep.delete(effect);
  });
}

//依赖收集
let depsMap = new Map();
export function track(target, key) {
  // if (!activeEffect) return;
  // if (!shouldTrack) return; // stop 时，不应该手机依赖
  if (!isTracking()) return; //是对上面 ！activeEffect 和!shouldTrack的封装，说明不在收集中的时候，直接return

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
export function trackEffects(dep) {
  if (dep.has(activeEffect)) {
    return;
  }
  // 在目标dep中，保存reactiveEffect - class的实例，其实也是为了保存fn函数
  dep.add(activeEffect);
  activeEffect.deps.push(dep); //activeEffect 在run之后，会等于 ReactiveEffect类的实例
}

export function isTracking() {
  return shouldTrack && activeEffect !== undefined;
}

//依赖触发
export function trigger(target, key) {
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

export function triggerEffects(dep) {
  for (const effect of dep) {
    if (effect.scheduler) {
      // 如果存在调度器，就执行调度器
      effect.scheduler();
    } else {
      effect.run();
    }
  }
}

export function effect(fn, options: any = {}) {
  const _effect = new ReactiveEffect(fn, options.scheduler);
  _effect.run();
  extend(_effect, options);
  // _effect.onStop = options.onStop;
  const runner: any = _effect.run.bind(_effect);
  // runner上挂载一个一个effect属性 = _effect 实例
  runner.effect = _effect;

  //bind(_effect)是为了处理在 构造函数run函数的this指向问题，指向该实例
  return runner;
}

export function stop(runner) {
  runner.effect.stop();
}
