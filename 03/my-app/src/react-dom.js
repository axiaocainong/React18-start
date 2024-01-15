import { REACT_ELEMENT } from "./utils";

function render(vNode, containerDom) {
  //将虚拟dom转换为真实dom
  //将转换的真实dom作为子元素挂载到containerDom中
  mount(vNode, containerDom);
}
function mount(vNode, containerDom) {
  let newDom = createDom(vNode);
  newDom && containerDom.appendChild(newDom);
}

function createDom(vNode) {
  //1.创建元素 2.处理子元素 3.处理属性值
  const { type, props } = vNode;
  let dom;
  //处理类组件
  if (
    typeof type === "function" &&
    vNode.$$typeof === REACT_ELEMENT &&
    // IS_CLASS_COMPONENT 来自Component的静态属性
    type.IS_CLASS_COMPONENT === true
  ) {
    return getDomByClassComponent(vNode);
  }
  if (typeof type === "function" && vNode.$$typeof === REACT_ELEMENT) {
    //处理类型为函数组件
    return getDomByFunctionComponent(vNode);
  } else if (type && vNode.$$typeof === REACT_ELEMENT) {
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
  return dom;
}

function getDomByClassComponent(vNode) {
  let { type, props } = vNode;
  let instance = new type(props);
  let renderVNode = instance.render();
  if (!renderVNode) return null;
  return createDom(renderVNode);
}

function getDomByFunctionComponent(vNode) {
  const { type, props } = vNode;
  let renderVNod = type(props);
  if (!renderVNod) return null;
  return createDom(renderVNod);
}

function setPropsForDom(dom, VNodeProps = {}) {
  if (!dom) return;
  for (let key in VNodeProps) {
    if (key === "children") continue;

    if (/^on[A-Z].*/.test(key)) {
      //TODO:处理事件
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

const ReactDOM = {
  render,
};
export default ReactDOM;
