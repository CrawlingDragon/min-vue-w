//位运算的方式 设置，读取ShapeFlags
export const enum ShapeFlags {
  // << 左移符号，把1向左移动n位
  ELEMENT = 1, //01 --> 二进制补全 0001
  STATEFUL_COMPONENT = 1 << 1, //10 --> 二进制补全 0010
  TEXT_CHILDREN = 1 << 2, //100 --> 二进制补全 0100
  ARRAY_CHILDREN = 1 << 3, //1000 --> 1000
  SLOT_CHILDREN = 1 << 4, //10000
}
//对象的方式不够高效，还有另外一种位运算的方式
//0000
// 0001 -> element
// 0010 -> stateful_component
// 0100 -> text_children
// 1000 -> array_children

// 位运算符的设置，修改
// | （或运算符，两位都为0，才为0）
// 0000 |
// 0001
// ----
// 0001

// 位运算符的读取
// & （于运算符）（两位都为1，才为1）
// 0101 &
// 0100
// ----
// 0100

// 《================================================》

// 对象的方式
const ShapeFlags2 = {
  ELEMENT: 0,
  STATEFUL_COMPONENT: 0,
  TEXT_CHILDREN: 0,
  ARRAY_CHILDREN: 0,
};
// vnode 可以是element，component，element内的text_children，array_children 四种类型
// 通过查找，设置进行对应操作
// 1 ，设置，修改
// ShapeFlags.ELEMENT = 1
// ShapeFlags.STATEFUL_COMPONENT = 1

//2:查找 判断
// if (ShapeFlags.ELEMENT)
// if(ShapeFlags.STATEFUL_COMPONENT)
