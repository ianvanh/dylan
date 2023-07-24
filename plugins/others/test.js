const fs = require("fs");
let { log, pint } = require("../../lib/colores");
//let Config = require("../../config");
let { jsonformat } = require("../../lib/myfunc");
module.exports = {
  cmd: ['test'],
  ignored: true,
  owner: true,
  register: true,
  //group: true,
  //admin: true,
  //botAdmin: true,
  check: { pts: 1 },
  async handler(m, {myBot, User}) {
    //let checkUser = User.show(m.sender);
    //if (checkUser.premium === false && checkUser.points < 0) return m.reply('No tienes creditos suficientes, actualiza a premium.')
    //User.counter(m.sender, { usage: 1, cash: -1 });
  }
};
