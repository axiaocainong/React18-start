import { addEvent } from "./event";
import { REACT_ELEMENT } from "./utils";

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
  const { type, props } = VNode;
  let dom;
  //处理类组件
  if (
    typeof type === "function" &&
    VNode.$$typeof === REACT_ELEMENT &&
    // IS_CLASS_COMPONENT 来自Component的静态属性
    type.IS_CLASS_COMPONENT === true
  ) {
    return getDomByClassComponent(VNode);
  }
  if (typeof type === "function" && VNode.$$typeof === REACT_ELEMENT) {
    //处理类型为函数组件
    return getDomByFunctionComponent(VNode);
  } else if (type && VNode.$$typeof === REACT_ELEMENT) {
    dom = document.createElement(type);
  }
  if (props) {
    if (typeof props.children === "object" && props.type) {
      mount(props.children, dom);
    } else if (Array.isArray(props.children)) {
      mountArray(props.children, dom);
    } else if (typeof props.children === "string") {
      dom.appendChild(document.createTextNode(props.children));
    }
  }
  //TODO :处理属性值
  setPropsForDom(dom, props);
  VNode.dom = dom;
  return dom;
}

function getDomByClassComponent(VNode) {
  let { type, props } = VNode;
  let instance = new type(props);
  let renderVNode = instance.render();
  //保存虚拟dom
  instance.oldVNode = renderVNode;

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
    if (key === "children") continue;
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
      parent.appendChild(document.createTextNode(children[i]));
    } else {
      mount(children[i], parent);
    }
  }
}
export function findDomByVNode(VNode) {
  if (!VNode) return;
  if (VNode.dom) return VNode.dom;
}
export function updateDomTree(oldDom, newVNode) {
  let parentNode = oldDom.parentNode;
  parentNode.removeChild(oldDom);
  parentNode.appendChild(createDom(newVNode));
}
const ReactDOM = {
  render,
};
export default ReactDOM;
