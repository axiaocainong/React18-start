import { addEvent } from "./event";
import { REACT_ELEMENT, REACT_FORWARD_REF, REACT_TEXT } from "./utils";

function render(VNode, containerDom) {
  //将虚拟dom转换为真实dom
  //将转换的真实dom作为子元素挂载到containerDom中
  mount(VNode, containerDom);
}
function mount(VNode, containerDom) {
  let newDom = createDom(VNode);
  newDom && containerDom.appendChild(newDom);
}

function createDom(VNode) {
  //1.创建元素 2.处理子元素 3.处理属性值
  const { type, props, ref } = VNode;
  let dom;
  //处理forward转发的函数组件
  if (type && type.$$typeof === REACT_FORWARD_REF) {
    return getDomByForwardRefFunction(VNode);
  }
  if (
    typeof type === "function" &&
    VNode.$$typeof === REACT_ELEMENT &&
    // IS_CLASS_COMPONENT 来自Component的静态属性
    type.IS_CLASS_COMPONENT === true
  ) {
    //处理类组件
    return getDomByClassComponent(VNode);
  }
  if (typeof type === "function" && VNode.$$typeof === REACT_ELEMENT) {
    //处理类型为函数组件
    return getDomByFunctionComponent(VNode);
  }
  if (type === REACT_TEXT) {
    dom = document.createTextNode(props.text);
  } else if (type && VNode.$$typeof === REACT_ELEMENT) {
    dom = document.createElement(type);
  }
  if (props) {
    if (typeof props.children === "object" && props.type) {
      mount(props.children, dom);
    } else if (Array.isArray(props.children)) {
      mountArray(props.children, dom);
    }
  }
  //TODO :处理属性值
  setPropsForDom(dom, props);
  VNode.dom = dom;
  //给原生标签赋值的处理
  ref && (ref.current = dom);
  return dom;
}
function getDomByForwardRefFunction(VNode) {
  let { type, ref, props } = VNode;
  let renderVNode = type.render(props, ref);
  if (!renderVNode) return;
  return createDom(renderVNode);
}

function getDomByClassComponent(VNode) {
  let { type, props, ref } = VNode;
  let instance = new type(props);
  let renderVNode = instance.render();
  //保存虚拟dom
  instance.oldVNode = renderVNode;
  ref && (ref.current = instance);

  if (!renderVNode) return null;
  return createDom(renderVNode);
}

function getDomByFunctionComponent(VNode) {
  const { type, props } = VNode;
  let renderVNod = type(props);
  if (!renderVNod) return null;
  return createDom(renderVNod);
}

function setPropsForDom(dom, VNodeProps = {}) {
  if (!dom) return;
  for (let key in VNodeProps) {
    if (key === "children");
    // 找以'on'开头，后接一个大写字母，然后是任意数量的任意字符（包括0个）。如onClick
    if (/^on[A-Z].*/.test(key)) {
      //处理事件
      addEvent(dom, key.toLocaleLowerCase(), VNodeProps[key]);
    } else if (key === "style") {
      Object.keys(VNodeProps[key]).forEach((styleName) => {
        dom.style[styleName] = VNodeProps[key][styleName];
      });
    } else {
      dom[key] = VNodeProps[key];
    }
  }
}

function mountArray(children, parent) {
  if (!Array.isArray(children)) return;
  for (let i = 0; i < children.length; i++) {
    if (typeof children[i] === "string") {
      children[i].index = i;
      mount(children[i], parent);
    }
  }
}
// 根据VNode寻找真实dom
export function findDomByVNode(VNode) {
  if (!VNode) return;
  if (VNode.dom) return VNode.dom;
}
export function updateDomTree(oldVNode, newVNode, oldDom) {
  // let parentNode = oldDom.parentNode;
  // 新节点，旧节点都不存在
  //新节点存在，旧节点不存在
  // 新节点不存在，旧节点存在
  // 新节点存在，旧节点也存在但是类型不一样
  //新节点存在，旧节点也存在，类型也一样 --->值得我们进行深入的比较，探索复用相关节点的方案
  const typeMap = {
    NO_OPERATE: !oldVNode && !newVNode,
    ADD: !oldVNode && newVNode,
    DELETE: oldVNode && !newVNode,
    REPLACE: oldVNode && newVNode && oldVNode.type !== newVNode.type,
  };
  let UPDATE_TYPE = Object.keys(typeMap).filter((key) => typeMap[key])[0];
  switch (UPDATE_TYPE) {
    case "NO_OPERATE":
      break;
    case "DELETE":
      removeVNode(oldVNode);
      break;
    case "ADD":
      oldDom.parentNode.appendChild(createDom(newVNodeS));
      break;
    case "REPLACE":
      removeVNode(oldVNode);
      oldDom.parentNode.appendChild(createDom(newVNodeS));
      break;
    default:
      deepDOMDiff(oldVNode, newVNode);
  }
}
function removeVNode(VNode) {
  const currntDOM = findDomByVNode(VNode);
  if (currntDOM) currntDOM.remove();
}
function deepDOMDiff(oldVNode, newVNode) {
  let diffTypeMap = {
    ORIGIN_NODE: typeof oldVNode.type === "string",
    CLASS_COMPONENT:
      typeof oldVNode.type === "function" && oldVNode.type.IS_CLASS_COMPONENT,
    FUNCTION_COMPONENT: typeof oldVNode === "function",
    TEXT: oldVNode.type === REACT_TEXT,
  };
  let DIFF_TYPE = Object.keys(diffTypeMap).filter((KEY) => diffTypeMap[KEY])[0];
  switch (DIFF_TYPE) {
    case "ORIGIN_NODE":
      let currentDOM = (newVNode.dom = findDomByVNode(oldVNode));
      setPropsForDom(currentDOM, newVNode.props);
      updateChildren(
        currentDOM,
        oldVNode.props.children,
        newVNode.props.children
      );
      break;
    case "CLASS_COMPONENT":
      updateClassComponent(oldVNode, newVNode);
      break;
    case "FUNCTION_COMPONENT":
      updateFunctionsComponent(oldVNode, newVNode);
      break;
    case "TEXT":
      newVNode.dom = findDomByVNode(oldVNode);
      newVNode.dom.textContent = newVNode.props.text;
      break;
    default:
      break;
  }
}
// DOM DIFF算法的核心
function updateChildren() {}
function updateClassComponent(oldVNode, newVNode) {
  const classInstance = (newVNode.classInstance = oldVNode.classInstance);
  classInstance.updater.launchUpdate();
}
function updateFunctionsComponent(oldVNode, newVNode) {
  let oldDOM = findDomByVNode(oldVNode);
  if (!oldDOM) return;
  const { type, props } = newVNode;
  let newRenderVNode = type(props);
  updateDomTree(oldVNode.oldRenderVNode, newRenderVNode, oldDOM);
  newVNode.oldRenderVNode = newRenderVNode;
}
const ReactDOM = {
  render,
};
export default ReactDOM;
