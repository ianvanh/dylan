let { jsonformat } = require("../../lib/myfunc");
module.exports = {
  cmd: ['profile'],
  category: 'información',
  desc: 'obten tu informacion en el bot.',
  register: true,
  check: { pts: 0 },
  async handler(m, {User}) {
    let checkUser = User.show(m.sender);
    let profile = `*ID:* ${checkUser.id}\n`
    profile += `*Número:* ${checkUser.number.split("@")[0]}\n`
    profile += `*Nombre:* ${checkUser.name}\n`
    profile += `*Premium:* ${checkUser.premium}\n`
    profile += `*Bloqueado:* ${checkUser.block}\n`
    profile += `*Uso del Bot:* ${checkUser.use}\n`
    profile += `*Usos restantes:* ${checkUser.points}`
    m.reply(profile)
  }
};