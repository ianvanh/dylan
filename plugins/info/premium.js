  cmd: /plan|premium|plata|oro|bronce/i,
module.exports = {
  category: 'información',
  desc: 'solicitud',
  ignored: true,
  check: { pts: 0 },
  async handler(m, {myBot, text}) {
    myBot.sendText(`${global.owner}@s.whatsapp.net`, `El número ${m.sender.split('@')[0]} está solicitando un plan.`)
    m.reply("Ok, le acabe de avisar a mi creador sobre tu solicitud, en breve se comunicará contigo 😊")
  }
};