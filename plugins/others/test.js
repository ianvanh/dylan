const fs = require("fs");
let { log, pint } = require("../../lib/colores");
//let Config = require("../../config");
let { jsonformat } = require("../../lib/myfunc");
module.exports = {
  cmd: /^(test)/i,
  ignored: true,
  owner: true,
  register: true,
  check: { pts: 1 },
  async handler(m, {myBot, args, User, checkUser}) {
  }
};