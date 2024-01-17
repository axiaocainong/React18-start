import { REACT_ELEMENT, REACT_FORWARD_REF, toVNode } from "./utils";
import { Component } from "./Component";
function createElement(type, properties = {}, children) {
  // 观察一下react原版代码的createElement函数的返回值会发现有多余的__sorce,__self,而且单独返回ref和key属性
  let ref = properties.ref || null; // 后面会讲到，这里只需要知道是跟操作DOM相关
  let key = properties.key || null; // 后面会讲到，这里只需要知道这个跟DOM DIFF相关

  ["ref", "key", "__self", "__source"].forEach((key) => {
    // 可能还会有别的属性也不需要，在发现的时候我们再添加需要删除的属性
    delete properties[key]; // props中有些属性并不需要
  });
  properties._owner = null;
  properties._store = {};
  let props = { ...properties };

  if (arguments.length > 3) {
    // 多个子元素, 转化成数组
    props.children = Array.prototype.slice.call(arguments, 2).map(toVNode);
  } else {
    // 单个子元素，转化为数组
    props.children = toVNode(children);
  }

  return {
    $$typeof: REACT_ELEMENT, // 代表着这是React元素，也就是React框架中的虚拟DOM，如果有同学问，老师，难道还有非React——element类型吗，是得，在后续相应的课程中会跟大家解释，这里可以先忽略这个问题
    type, // 虚拟DOM的元素类型
    ref,
    key,
    props,
  };
}
function createRef() {
  return {
    current: null,
  };
}
function forwardRef(render) {
  return {
    $$typeof: REACT_FORWARD_REF,
    render,
  };
}
const React = {
  createElement,
  Component,
  createRef,
  forwardRef,
};
export default React;
