export function transform(root, options) {
  //创建一个context
  let context = createTransformContext(root, options);
  //1:遍历，深度优先
  //2：把text.content 修改成 hi,mini-vue
  traverseNode(root, context);
}
function traverseNode(node: any, context) {
  let { nodeTransforms } = context;
  for (let i = 0; i < nodeTransforms.length; i++) {
    let transform = nodeTransforms[i];
    transform(node);
  }

  // 递归字节点函数
  traverseChildren(node, context);
}

function traverseChildren(node, context) {
  let children = node.children;

  if (children) {
    for (let i = 0; i < children.length; i++) {
      let node = children[i];
      // 递归字节点
      traverseNode(node, context);
    }
  }
}

function createTransformContext(root, options) {
  let context = {
    root,
    nodeTransforms: options.nodeTransforms || [],
  };
  return context;
}
