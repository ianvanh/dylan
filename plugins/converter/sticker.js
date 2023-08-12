const fs = require("fs");
let Config = require("../../config");
let { newSticker } = require("../../lib/exif");
let { msgErr } = require("../../lib/myfunc");
module.exports = {
  cmd: /^(sticker)/i,
  category: 'convertidor',
  desc: 'convierte imagenes y videos cortos a sticker.',
  register: true,
  check: { pts: null },
  async handler(m, {myBot, myLang, text, mime, prefix, command, User}) {
    if (!m.quoted) return m.reply(myLang("sticker").quot.replace("{}", command));
    if (/video/.test(mime)) return m.reply(myLang("sticker").video)
    if (!/image|webp/.test(mime)) return m.reply(myLang("sticker").img)
    try {
      if (text.length > 0) { name = text;}
      else { name = "Sticker by:"; }
      myBot.sendReact(m.chat, "🕒", m.key);
        let media = await m.quoted.download();
        let encmedia = await newSticker(media, false, name, Config.BOT_NAME)
        await myBot.sendMessage(m.chat, {
          sticker: encmedia
         }, { quoted: m });
      User.counter(m.sender, { usage: 1 });
    } catch (e) {
      myBot.sendText(m.chat, msgErr())
      throw e
    }
  }
};