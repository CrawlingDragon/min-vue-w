import { NodeTypes } from './ast';
const enum TagType {
  START,
  END,
}

export function baseParse(content) {
  let context = createParseContent(content);
  return createRoot(parseChildren(context));
}
function parseInterpolation(context) {
  let openDelimiter = '{{';
  let closeDelimiter = '}}';
  // 1:根据 ‘{{’ 把openIndex 推进两位
  // 2；根据 ‘}}’ 把closeIndex 找到
  // 3 内容位置 也就是 {{message}} 内的 message 的索引为 message}} - closeIndex
  // 最后得出 message的内容
  let closeIndex = context.source.indexOf('}}', closeDelimiter.length);
  //推进openIndex
  context.source = context.source.slice(openDelimiter.length);

  //找到 }} 的索引。
  const rawContentLength = closeIndex - closeDelimiter.length;
  // 找到 {{message}} 中的 message 内容
  let content = context.source.slice(0, rawContentLength);
  content = content.trim();

  //继续切割content,为后面继续处理content
  context.source = context.source.slice(0, rawContentLength + closeDelimiter.length);

  return {
    type: NodeTypes.INTERPOLATION,
    content: {
      type: NodeTypes.SIMPLE_EXPRESSION,
      content: content,
    },
  };
}
function parseChildren(context) {
  let nodes: any = [];
  let node;
  let source = context.source;

  if (source.startsWith('{{')) {
    // 处理插槽类型
    node = parseInterpolation(context);
  } else if (source[0] === '<') {
    // 处理element 类型
    // 匹配<div></div> 的<
    if (/[a-z]/i.test(source[1])) {
      //匹配<div></div> 的 d 类型
      node = parseElement(context);
    }
  }
  nodes.push(node);
  return nodes;
}

function parseElement(context) {
  // 具体处理 element类型的函数
  // 1：判断出是不是 element 类型，上面已经处理
  // 2: 通过正则匹配<div> 和结束标签</div>
  // 3：删除处理完的context

  let element = parseTag(context, TagType.START);
  parseTag(context, TagType.END);
  console.log('context.source', context.source);
  return element;
}
function parseTag(context, type) {
  // exec 匹配一遍目标元素，返回一个匹配的数组  [ '<div', 'div', index: 0, input: '<div></div>', groups: undefined ]
  let match: any = /^<\/?([a-z]*)/i.exec(context.source);
  let tag = match[1];
  advanceBy(context, match[0].length);
  advanceBy(context, 1);
  if (type === TagType.END) return;
  return {
    type: NodeTypes.ELEMENT,
    tag: tag,
  };
}
function createRoot(children) {
  return { children };
}
function createParseContent(content) {
  return {
    source: content,
  };
}

function advanceBy(context, length) {
  context.source = context.source.slice(length);
}
