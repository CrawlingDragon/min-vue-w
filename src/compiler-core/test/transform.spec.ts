import { NodeTypes } from '../src/ast';
import { baseParse } from '../src/parse';
import { transform } from '../src/transform';
describe('transform', () => {
  it('happy path transform', () => {
    const ast = baseParse('<div>hi,{{message}}</div>');
    // 插件体系
    // 传入options，让具体功能在外部实现
    //步骤
    // 1:主程序保留固定或主要程序
    // 2:把额外或新加功能在外部实现
    // 3:在主程序中，循环执行plugin
    // 4;在主程序内部把值传到外部plugin
    const plugin = (node) => {
      if ((node.type = NodeTypes.TEXT)) {
        node.content = node.content + 'mini-vue';
      }
    };
    transform(ast, {
      nodeTransforms: [plugin],
    });

    const nodeText = ast.children[0].children[0];
    expect(nodeText.content).toBe('hi,mini-vue');
  });
});
