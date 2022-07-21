import { effect, stop } from '../effect';
import { reactive } from '../reactive';
describe('effect', () => {
  // effect的基本功能
  it('happy path', () => {
    const user = reactive({ age: 10 });

    let nextAge;
    effect(() => {
      nextAge = user.age + 1;
    });

    expect(nextAge).toBe(11);

    //update
    user.age++;
    expect(nextAge).toBe(12);
  });

  // 测试effect的返回
  it('effect return ', () => {
    // effect(fn) -> fn() ->
    let foo = 10;
    let runner = effect(() => {
      foo++;
      return 'string_foo';
    });
    expect(foo).toBe(11);
    const r = runner();
    expect(foo).toBe(12);
    expect(r).toBe('string_foo');
  });

  //effect的scheduler 调度器功能,在响应式对象改变时，不effect，在执行调度器之后，才进行响应式
  it('scheduler', () => {
    // 1.通过effect的第二个参数给定一个scheduler的fn
    // 第一次执行effect的时候，会执行第一个fn参数
    // 当在set函数执行的时候，不会再执行第一个fn参数，而是执行scheduler的fn
    // run等于effect的返回fn
    let dummy;
    let run: any;
    const scheduler = jest.fn(() => {
      // scheduler 应该是个函数
      run = runner;
    });
    const obj = reactive({ foo: 1 });
    const runner = effect(
      () => {
        dummy = obj.foo;
      },
      {
        scheduler,
      }
    );
    expect(scheduler).not.toHaveBeenCalled(); //toHaveBeenCalled() -> 被调用一次
    expect(dummy).toBe(1);
    // should be called  on first trigger
    obj.foo++;
    expect(scheduler).toHaveBeenCalledTimes(1); //scheduler应该被执行一次
    // shuld not run yet
    expect(dummy).toBe(1);
    // manually run
    run();
    // should have run
    expect(dummy).toBe(2);
  });

  it('stop', () => {
    let dummy;
    const obj = reactive({ prop: 1 });
    const runner = effect(() => {
      dummy = obj.prop;
    });
    obj.prop = 2;
    expect(dummy).toBe(2);
    stop(runner);

    obj.prop++;
    expect(dummy).toBe(2);

    // stopped effect should still be manually callable
    runner();
    expect(dummy).toBe(3);
  });

  it('onStop', () => {
    // 在stop函数执行时，执行onStop回调
    const obj = reactive({ foo: 1 });
    const onStop = jest.fn();
    let dummy;
    const runner = effect(
      () => {
        dummy = obj.foo;
      },
      { onStop }
    );
    stop(runner);
    expect(onStop).toHaveBeenCalledTimes(1);
  });
});
