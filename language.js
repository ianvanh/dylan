const Config = require("./config");
const fs = require("fs");
const { log, pint } = require("./lib/colores");

if (fs.existsSync("./lang/" + Config.LANG + ".json")) {
  var json = JSON.parse(fs.readFileSync("./lang/" + Config.LANG + ".json"));
} else {
  var json = JSON.parse(fs.readFileSync("./lang/ES.json"));
}
function getString(file) {
  return json["STRINGS"][file];
}

module.exports = {
  language: json,
  getString: getString,
};