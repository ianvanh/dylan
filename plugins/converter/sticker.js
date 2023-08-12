const fs = require("fs");
let Config = require("../../config");
let { newSticker } = require("../../lib/exif");

const isUrl = (text) => {
  return text.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)(jpe?g|gif|png|mp4)/, 'gi'))
}

module.exports = {
  cmd: /^(sticker)/i,
  category: 'convertidor',
  desc: 'convierte imagenes y videos cortos a sticker.',
  register: true,
  check: { pts: null },
  async handler(m, {myBot, myLang, text, mime, prefix, command, User}) {
    if (!m.quoted) return m.reply(myLang("sticker").quot);
    if (text.length > 0) { name = text;}
    else { name = "Sticker by:"; }
    myBot.sendReact(m.chat, "🕒", m.key);
    if (/image|webp/.test(mime)) {
      let media = await m.quoted.download();
      let encmedia = await newSticker(media, false, name, Config.BOT_NAME)
      await myBot.sendMessage(m.chat, {
        sticker: encmedia
       }, { quoted: m });
      await fs.unlinkSync(encmedia);
    } else if (/video/.test(mime)) {
      if ((m.quoted.msg || m.quoted).seconds > 11)
        return m.reply(myLang("sticker").time_wait);
      let media = await m.quoted.download();
      let encmedia = await newSticker(media, false, name, Config.BOT_NAME)
      await myBot.sendMessage(m.chat, {
        sticker: encmedia
       }, { quoted: m });
      await fs.unlinkSync(encmedia);
    } else if (m.quoted.text) {
      if (isUrl(m.quoted.text)) encmedia = await newSticker(false, m.quoted.text, name, Config.BOT_NAME)
      await myBot.sendMessage(m.chat, {
        sticker: encmedia
       }, { quoted: m });
    } else {
      m.reply(myLang("sticker").quot);
    }
    User.counter(m.sender, { usage: 1 });
  }
};