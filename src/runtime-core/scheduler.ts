let jobs: any = [];
let isFlushPending = false;
let p = Promise.resolve();
export function queueJobs(job) {
  // job 就是 effect返回的run函数
  // jobs:微任务队列
  if (!jobs.includes(job)) {
    jobs.push(job);
  }
  queueFlush();
}

export function nextTick(fn) {
  // nextTick 函数
  // 有fn，在promise之后执行fn
  // 直接返回promise.resolve() 是为了 await nextTick() ，也就是微任务执行完成后，在读取视图数据
  return fn ? p.then(fn) : p;
}

function queueFlush() {
  if (isFlushPending) return;
  isFlushPending = true;
  nextTick(flushJobs);
}

function flushJobs() {
  isFlushPending = false;
  let job;
  // 依次执行job
  // while 取出jobs队列的第一个
  while ((job = jobs.shift())) {
    job && job();
  }
}

// push 尾部添加
// shift 头部添加

// pop 尾部删除
// unshift 尾部删除
