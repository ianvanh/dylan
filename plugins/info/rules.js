module.exports = {
  cmd: ['rules'],
  category: 'información',
  desc: 'reglas del bot.',
  register: true,
  ignored: true,
  check: { pts: null },
  async handler(m, {myBot}) {
    let rules = `╔══✪〘 *POLITICAS DE PRIVACIDAD* 〙✪══
╚════════════`;
    myBot.sendImage(m.chat, global.rulesImg, rules);
  }
};