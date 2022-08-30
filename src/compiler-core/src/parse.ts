import { NodeTypes } from './ast';
const enum TagType {
  START,
  END,
}

export function baseParse(content) {
  let context = createParseContent(content);
  return createRoot(parseChildren(context, []));
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
  advanceBy(context, rawContentLength + closeDelimiter.length);
  return {
    type: NodeTypes.INTERPOLATION,
    content: {
      type: NodeTypes.SIMPLE_EXPRESSION,
      content: content,
    },
  };
}
function parseChildren(context, ancestors) {
  let nodes: any = [];

  while (!isEnd(context, ancestors)) {
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
        node = parseElement(context, ancestors);
      }
    }
    if (!node) {
      node = parseText(context);
    }
    nodes.push(node);
  }
  return nodes;
}

function isEnd(context, ancestors) {
  // source 有值的时候
  // 或者 碰到结束标签的时候
  let s = context.source;
  if (s.startsWith('</')) {
    for (let i = 0; i < ancestors.length; i++) {
      let tag = ancestors[i].tag; // 收集数组内的 tag
      let sourceTag = s.slice(2, 2 + tag.length); // source的</div>
      if (tag === sourceTag) {
        return true;
      }
    }
  }

  return !s;
}
function parseText(context) {
  let content = context.source;

  let endIndex = content.length;
  let endTokens = ['{{', '</'];

  for (let i = 0; i < endTokens.length; i++) {
    let index = content.indexOf(endTokens[i]);
    if (index !== -1 && index < endIndex) {
      // index <  endIndex ：选择靠左的那个标签
      endIndex = index;
    }
  }

  // 提取text 内容
  content = context.source.slice(0, endIndex);

  // 删除context内容
  advanceBy(context, endIndex);

  return {
    type: NodeTypes.TEXT,
    content: content,
  };
}
function parseElement(context, ancestors) {
  // 具体处理 element类型的函数
  // 1：判断出是不是 element 类型，上面已经处理
  // 2: 通过正则匹配<div> 和结束标签</div>
  // 3：删除处理完的context
  let element: any = parseTag(context, TagType.START);
  let tag = element.tag;

  ancestors.push(element); // 收集element标签

  let children = parseChildren(context, ancestors);
  element.children = children;

  if (context.source.slice(2, 2 + tag.length) !== tag) {
    throw new Error('缺少标签：' + tag);
  }
  ancestors.pop(); //在处理完element标签后，弹出末尾
  parseTag(context, TagType.END);

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
