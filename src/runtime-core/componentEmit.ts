// emit 大致实现思路是：
// 1：然后在父组件挂载mountComponent的时候，定义emit的行为模式。instance.emit = function emit(){}
//2:在setup执行的时候，把emit函数挂载到instance.emit  setup(props,{emit:instance.emit})，
//3：setup内部定义的函数执行时，根据挂载component时的emit行为

import { camelize, toHandlerKey } from '../shared/index';

export function emit(instance, event, ...args) {
  // tpp 开发方式，先实现一个特定的行为，-> 然后重构成通用方案
  //add -> Add
  // get-food -> getFood
  const { props } = instance;

  const handlerName = toHandlerKey(camelize(event));

  const handler = props[handlerName];
  handler && handler(...args);
}
