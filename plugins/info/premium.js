module.exports = {
  cmd: /plan|premium/i,
  category: 'información',
  desc: 'solicitud',
  ignored: true,
  isPrivate: true,
  check: { pts: 0 },
  async handler(m, {myBot, myLang}) {
    myBot.sendReact(m.chat, "🕒", m.key);
    myBot.sendImage(m.chat, global.planes, myLang("global").no_points.split(".").slice(1).join("."));
  }
};