import { baseParse } from '../src/parse';
import { NodeTypes } from '../src/ast';
describe('Parse', () => {
  it('interpolation', () => {
    const ast = baseParse('{{message}}');
    //root
    expect(ast.children[0]).toStrictEqual({
      type: NodeTypes.INTERPOLATION,
      content: {
        type: NodeTypes.SIMPLE_EXPRESSION,
        content: 'message',
      },
    });
  });

  it('element parse', () => {
    const ast = baseParse('<div></div>');
    expect(ast.children[0]).toStrictEqual({
      type: NodeTypes.ELEMENT,
      tag: 'div',
      children: [],
    });
  });
  it('parse text', () => {
    const ast = baseParse('some text');
    expect(ast.children[0]).toStrictEqual({
      type: NodeTypes.TEXT,
      content: 'some text',
    });
  });

  test('parse all', () => {
    const ast = baseParse('<div>hi,{{message}}</div>');
    expect(ast.children[0]).toStrictEqual({
      type: NodeTypes.ELEMENT,
      tag: 'div',
      children: [
        {
          type: NodeTypes.TEXT,
          content: 'hi,',
        },
        {
          type: NodeTypes.INTERPOLATION,
          content: {
            type: NodeTypes.SIMPLE_EXPRESSION,
            content: 'message',
          },
        },
      ],
    });
  });

  test('nested element', () => {
    const ast = baseParse('<div><p>hi</p>{{message}}</div>');
    expect(ast.children[0]).toStrictEqual({
      type: NodeTypes.ELEMENT,
      tag: 'div',
      children: [
        {
          type: NodeTypes.ELEMENT,
          tag: 'p',
          children: [
            {
              type: NodeTypes.TEXT,
              content: 'hi',
            },
          ],
        },
        {
          type: NodeTypes.INTERPOLATION,
          content: {
            type: NodeTypes.SIMPLE_EXPRESSION,
            content: 'message',
          },
        },
      ],
    });
  });

  test('should throw error when lock and tag', () => {
    // 实现步骤
    // 1： 对element标签收集，在isEnd内，依次判断收集的element标签
    // 2: 在parseElement时，对起始标签和结束标签不一样的时候，
    expect(() => {
      baseParse('<div><span></div>');
    }).toThrow('缺少标签：span');
  });
});
