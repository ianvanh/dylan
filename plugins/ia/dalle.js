const axios = require("axios");
let Config = require("../../config");
let { getBuffer, msgErr } = require("../../lib/myfunc");
module.exports = {
  cmd: /^(crea)/i,
  category: 'ia',
  desc: 'inteligencia artificial para creación de imagenes.',
  register: true,
  isPrivate: true,
  check: { pts: 1 },
  async handler(m, {myBot, myLang, command, text, User, checkUser}) {
    let isPremium = checkUser.premium ? 0 : -1;
    if(!text) return m.reply("Que imagen deseas crear?\nEscribe crea seguido de lo que quieres.");
    myBot.sendReact(m.chat, "🎨", m.key);
    try {
      const response = await axios.post('https://api.openai.com/v1/images/generations', {
        "model": "image-alpha-001",
        "prompt": `${command} ${text}`,
        "num_images": 1,
        "size": "512x512",
        "response_format": "url"
      }, {
          headers: {
            'Authorization': `Bearer ${Config.OPEN_AI_KEY}`
          }
      });
      await myBot.sendImage(m.chat, response.data.data[0].url, Config.BOT_NAME)
      User.counter(m.sender, { usage: 1, cash: isPremium });
    } catch (e) {
      myBot.sendText(m.chat, msgErr())
      throw e
    }
  }
};