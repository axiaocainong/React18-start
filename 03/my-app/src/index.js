// function Component2(props) {
//   return (
//     <div style={{ color: "blue" }}>
//       Hello My App Component2<span>children1</span>
//       <span>children2</span>
//     </div>
//   );
// }
import React from "./react";
import ReactDOM from "./react-dom";
class Component2 extends React.Component {
  render() {
    return (
      <div style={{ color: "red" }}>
        Hello My App Component2<span>{this.props.xx}</span>
        <span>children2</span>
      </div>
    );
  }
}
ReactDOM.render(<Component2 xx="child1111" />, document.getElementById("root"));
