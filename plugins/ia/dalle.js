const axios = require("axios");
let Config = require("../../config");
let { getBuffer, msgErr } = require("../../lib/myfunc");
module.exports = {
  cmd: ['crea'],
  category: 'ia',
  desc: 'inteligencia artificial para creación de imagenes.',
  register: true,
  check: { pts: 1 },
  async handler(m, {myBot, myLang, text, User}) {
    if(!text) return m.reply("Que imagen deseas crear?");
    myBot.sendReact(m.chat, "🕒", m.key);
    try {
      const response = await axios.post('https://api.openai.com/v1/images/generations', {
        "model": "image-alpha-001",
        "prompt": text,
        "num_images": 1,
        "size": "512x512",
        "response_format": "url"
      }, {
          headers: {
            'Authorization': `Bearer ${Config.OPEN_AI_KEY}`
          }
      });
      await myBot.sendImage(m.chat, response.data.data[0].url, Config.BOT_NAME)
      User.counter(m.sender, { usage: 1 });
    } catch (e) {
      myBot.sendText(m.chat, msgErr())
      throw e
    }
  }
};