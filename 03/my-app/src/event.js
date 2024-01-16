import { flushUpdaterQueue, updaterQueue } from "./Component";
export function addEvent(dom, eventName, bindFunction) {
  dom.attach = dom.attach || {};
  dom.attach[eventName] = bindFunction;
  //事件合成机制的核心要点一：事件绑定到document
  if (document[eventName]) return;
  document[eventName] = dispatchEvent;
}
function dispatchEvent(nativeEvent) {
  updaterQueue.isBatch = true;
  //时间合成机制二：屏蔽游览器之间的差异
  // 这里本质上是对原始事件进行了一层代理
  let syntheticEvent = createSyntheticEvent(nativeEvent); //创建合成事件，传入原生事件对象
  let target = nativeEvent.target;

  /**
   * while循环是为了处理冒泡，否则执行执行下面代码就可以了:
   * let eventType = `on${nativeEvent.type}`;
   * let bindFunction = target.attach && target.attach[eventType];
   * bindFunction && bindFunction(nativeEvent.target)
   */
  while (target) {
    syntheticEvent.currentTarget = target;
    let eventName = `on${nativeEvent.type}`;
    let bindFunction = target.attach && target.attach[eventName];
    bindFunction && bindFunction(syntheticEvent);
    if (syntheticEvent.isPropagationStopped) {
      break;
    }
    target = target.parentNode;
  }
  flushUpdaterQueue();
}
function createSyntheticEvent(nativeEvent) {
  let nativeEventKeyValues = {};
  //   复制原生事件对象的所有属性到nativeEventKeyValues中
  for (let key in nativeEvent) {
    nativeEventKeyValues[key] =
      typeof nativeEvent[key] === "function"
        ? nativeEvent[key].bind(nativeEvent)
        : nativeEvent[key];
  }
  let syntheticEvent = Object.assign(nativeEventKeyValues, {
    nativeEvent, //原生对象的引用
    isDefaultPrevented: false,
    isPropagationStopped: false,
    preventDefault: function () {
      this.isDefaultPrevented = true;
      if (this.nativeEvent.preventDefault) {
        this.nativeEvent.preventDefault();
      } else {
        this.nativeEvent.returnValue = false;
      }
    },
    stopPropagation: function () {
      this.isPropagationStopped = true;
      if (this.nativeEvent.stopPropagation) {
        this.nativeEvent.stopPropagation();
      } else {
        this.nativeEvent.cancelBubble = true;
      }
    },
  });
  return syntheticEvent;
}
