const os = require("os");
const speed = require("performance-now");
let Config = require("../../config");
let { runtime } = require("../../lib/myfunc");
module.exports = {
  cmd: /^(status)/i,
  category: 'owner',
  desc: 'obten informacion del bot.',
  owner: true,
  register: true,
  ignored: true,
  check: { pts: null },
  async handler(m, {command}) {
    m.reply(`*𝚃𝙸𝙴𝙼𝙿𝙾 𝙳𝙴 𝙴𝙹𝙴𝙲𝚄𝙲𝙸Ó𝙽*
${BOX.iniM.replace("{}", Config.BOT_NAME)}
${BOX.medM} ⏱️ ${global.time} 
${BOX.medM} ⏰ ${runtime(process.uptime())}
${BOX.medM} 🔰 ${Config.VERSION}
${BOX.medM} 👥 ${await Object.keys(database).map((i) => database[i].phone).length}
${BOX.medM} ♨️ Bot modo${global.wtMyBot}
${BOX.medM} 👋🏻 ${Config.WELCOME === 'true' ? 'Welcome Encendido' : 'Welcome Apagado'}
${BOX.end}`);
  }
};