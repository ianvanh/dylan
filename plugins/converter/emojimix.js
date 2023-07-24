const fs = require("fs");
let Config = require("../../config");
let { fetchJson, msgErr } = require("../../lib/myfunc");
module.exports = {
  cmd: ['emojimix'],
  category: 'convertidor',
  desc: 'mezcla de emojis.',
  register: true,
  check: { pts: 1 },
  async handler(m, {myBot, myLang, text, prefix, command, User}) {
    if (!text) return m.reply(myLang("emojimix").msg.replace("{}", prefix + command));
    myBot.sendReact(m.chat, "🕒", m.key);
    try {
      let [emoji1, emoji2] = text.split`+`;
      let anu = await fetchJson(`https://tenor.googleapis.com/v2/featured?key=AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ&contentfilter=high&media_filter=png_transparent&component=proactive&collection=emoji_kitchen_v5&q=${encodeURIComponent(emoji1)}_${encodeURIComponent(emoji2)}`);
      if (anu.results && anu.results.length > 0) {
        const url = anu.results[0].url;
        if (url) {
          let encmedia = await myBot.sendImageAsSticker(m.chat, url, m, {
            packname: "Sticker by:",
            author: Config.BOT_NAME
          });
          await fs.unlinkSync(encmedia);
          User.counter(m.sender, { usage: 1 });
        } else {
          myBot.sendText(m.chat, msgErr())
        }
      } else {
        myBot.sendText(m.chat, msgErr())
      }
    } catch (e) {
      myBot.sendText(m.chat, msgErr())
      throw e
    }
  }
};