import { readonly, isReadonly, isProxy } from '../reactive';

describe('readonly', () => {
  it('happy path', () => {
    const original = { foo: 1, bar: { baz: 2 } };
    const wrapped = readonly(original);
    expect(wrapped).not.toBe(original);
    expect(wrapped.foo).toBe(1);
    expect(isReadonly(wrapped)).toBe(true);
    expect(isReadonly(wrapped.bar)).toBe(true);
    expect(isReadonly(original)).toBe(false);
    expect(isProxy(wrapped)).toBe(true);
  });

  it('warn set', () => {
    console.warn = jest.fn(); //jest.fn() 会生成一个函数
    const user = readonly({ foo: 1 });
    user.foo = 2;
    expect(console.warn).toBeCalled(); // 意思是：console.warn 会被执行
  });
});
