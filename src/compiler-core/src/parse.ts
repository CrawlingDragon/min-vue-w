import { NodeTypes } from './ast';

export function baseParse(content) {
  let context = createParseContent(content);
  console.log('context :>> ', context);
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
  context.source = context.source.slice(openDelimiter.length); //推进openIndex

  const rawContentLength = closeIndex - closeDelimiter.length;
  const content = context.source.slice(0, rawContentLength);

  context.source = context.source.slice(0, rawContentLength + closeDelimiter.length);
  context.source = context.source.trim();
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
  // console.log('context', context.source);
  if (context.source.startsWith('{{')) {
    node = parseInterpolation(context);
    nodes.push(node);
  }
  return nodes;
}

function createRoot(children) {
  return { children };
}
function createParseContent(content) {
  return {
    source: content,
  };
}
