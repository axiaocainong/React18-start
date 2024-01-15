import { findDomByVNode, updateDomTree } from "./react-dom";

export let updaterQueue = {
  isBatch: false,
  updaters: new Set(),
};
export function flushUpdaterQueue() {
  updaterQueue.isBatch = false;
  for (let updater of updaterQueue.updaters) {
    updater.launchUpdate();
  }
  updaterQueue.updaters.clear();
}
class Updater {
  //管理状态
  constructor(classComponentInstance) {
    //与类组件进行关联
    this.classComponentInstance = classComponentInstance;
    this.pendingStates = [];
  }
  addState(partialState) {
    this.pendingStates.push(partialState);
    this.preHandleForUpdate();
  }
  preHandleForUpdate() {
    if (updaterQueue.isBatch) {
      updaterQueue.updaters.add(this);
    } else {
      this.launchUpdate();
    }
  }
  launchUpdate() {
    const { classComponentInstance, pendingStates } = this;
    if (pendingStates.length === 0) return;
    classComponentInstance.state = this.pendingStates.reduce(
      (preState, newState) => {
        return { ...preState, ...newState };
      },
      classComponentInstance.state
    );
    this.pendingStates.length = 0;
    classComponentInstance.update();
  }
}

export class Component {
  static IS_CLASS_COMPONENT = true;
  constructor(props) {
    this.updater = new Updater(this);
    this.state = {};
    this.props = props;
  }
  setState(partialState) {
    // //1.合并属性
    // this.state = { ...this.state, ...partialState };
    // //2.重新渲染
    // this.update();
    this.updater.addState(partialState);
  }
  update() {
    //1.获取重新执行的render函数后的虚拟dom 新虚拟dom
    //2.根据虚拟dom生产新的真是dom
    //3.将真实dom挂载到页面上
    let oldVNode = this.oldVNode; //TODO:让类组件拥有一个oldVNode属性保存类组件实例对于的虚拟dom
    let oldDom = findDomByVNode(oldVNode); //TODO:将真实dom保存到对应的虚拟dom上
    let newVNode = this.render();
    updateDomTree(oldDom, newVNode);
    this.oldVNode = newVNode;
  }
}
