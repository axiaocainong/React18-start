import React from "react";
/* react18的写法
import ReactDOM from "react-dom/client";
const root = ReactDOM.createRoot(document.getElementById("root"));
let element = <div>Hello My App</div>;
root.render(element); */

import ReactDOM from "react-dom";
ReactDOM.render(<div>Hello My App</div>, document.getElementById("root"));
console.log(<div>Hello My App</div>);
