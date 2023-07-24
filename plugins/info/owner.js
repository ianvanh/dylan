module.exports = {
  cmd: ['owner'],
  ignored: true,
  owner: true,
  category: 'info',
  desc: 'numero del creador.',
  check: { pts: null },
  async handler(m, {myBot}) {
    myBot.sendContact(m.chat, global.owner, m);
  }
};