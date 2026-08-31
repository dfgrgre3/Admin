const s = "[^/]+";
console.log("chars:", [...s].map((c) => c + ":" + c.charCodeAt(0)).join(" "));
console.log("dot vs caret:", /^.$/.test("^"));
console.log("dot vs slash:", /^.$/.test("/"));
console.log("bracket start:", /^\[/.test(s));
console.log("full no-anchor:", /\[.+\]/.test(s));
console.log("new RegExp:", new RegExp("^\\[.+\\]$").test(s));
console.log("A:", /^\[.+\]$/.test(s));
