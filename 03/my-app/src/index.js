// index.js
import React from "./react";
import ReactDOM from "./react-dom";

class MyClassComponent extends React.Component {
  counter = 0;
  constructor(props) {
    super(props);
    this.state = { count: "0" };
  }
  updateShowText(newText) {
    this.setState({
      count: newText,
    });
  }
  render() {
    return (
      <div
        className="test-class"
        style={{
          color: "red",
          cursor: "pointer",
          border: "1px solid gray",
          borderRadius: "6px",
          display: "inline-block",
          padding: "6px 12px",
        }}
        onClick={() => this.updateShowText("" + ++this.counter)}
      >
        Simple React Counter: {this.state.count}
      </div>
    );
  }
}
let ForwardRefFunctionComponent = React.forwardRef((props, ref) => {
  return <input ref={ref}>ForwardRefFunctionComponent </input>;
});
function FunctionComponent(props) {
  let forwardRef = React.createRef();
  let classRef = React.createRef();
  let elementRef = React.createRef();
  const changeInput = () => {
    forwardRef.current.value = "forwarRef";
    classRef.current.updateShowText("1000000");
    elementRef.current.value = "..............";
  };
  return (
    <div>
      <ForwardRefFunctionComponent ref={forwardRef} /> <br />
      <input ref={elementRef} />
      <br />
      <input type="button" onClick={changeInput} value={"点击加省略号"} />
      <MyClassComponent ref={classRef} />
    </div>
  );
}

ReactDOM.render(<FunctionComponent />, document.getElementById("root"));
