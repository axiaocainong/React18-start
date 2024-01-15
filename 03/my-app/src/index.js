import React from "./react";
import ReactDOM from "./react-dom";
function Component2(props) {
  return (
    <div style={{ color: "blue" }}>
      Hello My App Component2<span>children1</span>
      <span>children2</span>
    </div>
  );
}
ReactDOM.render(<Component2 />, document.getElementById("root"));
