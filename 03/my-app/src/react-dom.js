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
  if (type && vNode.$$typeof === REACT_ELEMENT) {
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
  return dom;
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
