module.exports = {
  cmd: /^(add)/i,
  ignored: true,
  owner: true,
  register: true,
  check: { pts: 1 },
  async handler(m, {myBot, args, User}) {
    let newPrem = args[0]+'@s.whatsapp.net';
    let plan = args[1] ? args[1] : 'a'
    User.activatePremiumPlan(newPrem, plan);

    let checkUser = User.show(newPrem);
    let emojis = {"a": "🥉", "b": "🥈", "c": "🥇",};
    let premiumEmoji = emojis[checkUser.plan];
    myBot.sendText(newPrem, `Ya eres Premium\nPlan: ${premiumEmoji}`)
  }
};