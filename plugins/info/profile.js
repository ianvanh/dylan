let { jsonformat } = require("../../lib/myfunc");
module.exports = {
  cmd: /^(estado)/i,
  category: 'información',
  desc: 'obten tu informacion en el bot.',
  register: true,
  isPrivate: true,
  check: { pts: 0 },
  async handler(m, {User, checkUser}) {
    let emojis = {"a": "🥉", "b": "🥈", "c": "🥇",};
    let premiumEmoji = emojis[checkUser.plan] || "🆓";

    let profile = `*ID:* ${checkUser.id}\n`
    profile += `*Número:* ${checkUser.number.split("@")[0]}\n`
    profile += `*Nombre:* ${checkUser.name}\n`
    profile += `*Uso del Bot:* ${checkUser.usage}\n`
    if (checkUser.premium) {
      profile += `*Plan Premium:* ${premiumEmoji}\n`
      profile += `*Días restantes:* ${User.getDaysRemaining(checkUser.planEndDate)}\n`
      profile += `*Usos restantes:* ♾️`
    } else {
      profile += `*Plan Premium:* ${premiumEmoji}\n`;
      profile += `*Usos restantes:* ${checkUser.cash}`
    }
    m.reply(profile);
  }
};