import { h, ref } from '../../lib/mini-vue.esm.js';
export const App = {
  setup() {
    const count = ref(0);
    const onClick = function () {
      count.value++;
    };
    const props = ref({
      foo: 'foo',
      bar: 'bar',
    });
    const onChangePropsDemo1 = () => {
      props.value.foo = 'new-foo';
    };
    const onChangePropsDemo2 = () => {
      props.value.foo = undefined;
    };
    const onChangePropsDemo3 = () => {
      props.value = {
        foo: 'foo',
      };
    };
    return {
      props,
      onChangePropsDemo1,
      onChangePropsDemo2,
      onChangePropsDemo3,
      count,
      onClick,
    };
  },
  render() {
    return h(
      'div',
      {
        id: 'root',
        ...this.props,
      },
      [
        h('div', {}, 'count:' + this.count),
        //修改props的三种情况
        // 1：把foo属性改为新的属性，比如new-foo
        // 2：把foo属性改为undefined或者null，也就是删除旧属性的值
        // 3：把旧属性内的，其中一个属性删除
        h('button', { onClick: this.onChangePropsDemo1 }, '把props的foo改为new-foo'),
        h('button', { onClick: this.onChangePropsDemo2 }, '把props的foo设置为undefined'),
        h('button', { onClick: this.onChangePropsDemo3 }, '删除props内的bar属性'),
      ]
    );
  },
};
