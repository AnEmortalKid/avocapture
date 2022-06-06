const path = require('path');
const fs = require('fs');

// TODO use a specified path
const defPath = path.join(__dirname, "../../../", "builtin", "search-on-hotkey")
var pjson = require(path.join(defPath, "package.json"))
console.log(pjson);
console.log(JSON.stringify(pjson.avocapture));

var ExtensionClass = require(path.join(defPath, pjson.main));
var extension = new ExtensionClass();

console.log(extension.name());