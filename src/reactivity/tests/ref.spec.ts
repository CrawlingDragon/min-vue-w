import { effect } from '../effect';
import { ref, isRef, unRef, proxyRefs } from '../ref';
import { reactive } from '../reactive';
describe('ref', () => {
  it('happy path', () => {
    const a = ref(1);
    expect(a.value).toBe(1);
  });

  it('should be reactive', () => {
    const a = ref(1);
    let dummy;
    let calls = 0;
    effect(() => {
      // 疑惑，为什么要执行 effect：原因是，在effect函数内控制，目标对象 dummy 是否要进行依赖收集，否则ref，或者reactive 不会进行依赖收集，也就不是响应式对象了
      calls++;
      dummy = a.value;
    });

    expect(calls).toBe(1);
    expect(dummy).toBe(1);

    a.value = 2;
    expect(calls).toBe(2);
    expect(dummy).toBe(2);
    // same value should not trigger
    a.value = 2;
    expect(calls).toBe(2);
    expect(dummy).toBe(2);
  });

  it('should make nested properties reactive', () => {
    const a = ref({
      count: 1,
    });
    let dummy;
    effect(() => {
      dummy = a.value.count;
    });
    expect(dummy).toBe(1);
    a.value.count = 2;
    expect(dummy).toBe(2);
  });

  it('isRef', () => {
    const a = ref(0);
    const user = 1;
    const r = reactive({ foo: 1 });
    expect(isRef(a)).toBe(true);
    expect(isRef(user)).toBe(false);
    expect(isRef(r)).toBe(false);
  });

  it('unRef', () => {
    const a = ref(1);
    expect(unRef(a)).toBe(1);
    expect(unRef(1)).toBe(1);
  });

  it('proxyRefs', () => {
    // proxyRefs的使用场景
    // 在setup()函数内，定义了ref，需要使用.value ,但是在 template内 直接是ref，不需要.value
    const user = { age: ref(10), name: 'xiaoming' };
    const proxyUser = proxyRefs(user);
    expect(user.age.value).toBe(10);
    expect(proxyUser.age).toBe(10);
    expect(proxyUser.name).toBe('xiaoming');

    proxyUser.age = 20;
    expect(proxyUser.age).toBe(20);
    expect(user.age.value).toBe(20);

    proxyUser.age = ref(11);
    expect(proxyUser.age).toBe(11);
    expect(user.age.value).toBe(11);
  });
});
