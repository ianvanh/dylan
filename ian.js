/*
  Copyright (C) 2023
  DarkBox - Ian VanH
  Licensed MIT
  you may not use this file except in compliance with the License.
*/

require("./config");
const {
  proto,
  generateWAMessage,
  areJidsSameUser
} = require("@adiwajshing/baileys");
const fs = require("fs");
const { exec, spawn, execSync } = require("child_process");
const axios = require("axios");
const { log, pint, bgPint } = require("./lib/colores");
const { msgErr } = require("./lib/myfunc");
const Config = require("./config");

// Language
const myLang = require("./language").getString;

module.exports = myBot = async (myBot, m, chatUpdate, store) => {
  try {
    var body = m.mtype === "conversation" ? m.message.conversation : m.mtype == "imageMessage" ? m.message.imageMessage.caption : m.mtype == "videoMessage" ? m.message.videoMessage.caption : m.mtype == "extendedTextMessage" ? m.message.extendedTextMessage.text : m.mtype == "buttonsResponseMessage" ? m.message.buttonsResponseMessage.selectedButtonId : m.mtype == "listResponseMessage" ? m.message.listResponseMessage.singleSelectReply.selectedRowId : m.mtype == "templateButtonReplyMessage" ? m.message.templateButtonReplyMessage.selectedId : m.mtype === "messageContextInfo" ? m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply.selectedRowId || m.text : "";
    var budy = typeof m.text == "string" ? m.text : "";
    const prefix = Config.HANDLER.match(/\[(\W*)\]/)[1][0];
    const isCmd = body.startsWith(prefix);
    const command = body.replace(prefix, "").trim().split(/ +/).shift().toLowerCase();
    const args = body.trim().split(/ +/).slice(1);
    const pushname = m.pushName || "No Name";
    const botNumber = await myBot.decodeJid(myBot.user.id);
    const isCreator = [botNumber, ...global.owner].map((v) => v.replace(/[^0-9]/g, "") + "@s.whatsapp.net").includes(m.sender);
    const itsMe = m.sender == botNumber ? true : false;
    const text = (q = args.join(" "));
    const quoted = m.quoted ? m.quoted : m;
    const mime = (quoted.msg || quoted).mimetype || "";
    const isMedia = /image|video|sticker|audio/.test(mime);

    // New Functions BD
    const { User, addUserKey, totalHit } = require("./src/data");
    const regUser = User.check(m.sender);
    const checkUser = User.show(m.sender);

    // Group
    const groupMetadata = m.isGroup ? await myBot.groupMetadata(m.chat).catch((e) => {}) : "";
    const groupName = m.isGroup ? groupMetadata.subject : "";
    const participants = m.isGroup ? await groupMetadata.participants : "";
    const groupAdmins = m.isGroup ? await participants.filter((v) => v.admin !== null).map((v) => v.id) : "";
    const groupOwner = m.isGroup ? groupMetadata.owner : "";
    const isBotAdmins = m.isGroup ? groupAdmins.includes(botNumber) : false;
    const isAdmins = m.isGroup ? groupAdmins.includes(m.sender) : false;

    // Public & Self
    if (!myBot.public) {
      if (!m.key.fromMe) return;
    }

    //  Push Message To Console && Auto Read
    if (m.message) {
      if (Config.READ === "true") {
        myBot.sendReadReceipt(m.chat, m.sender, [m.key.id]);
      }
      if (Config.MSG_CONSOLE === "true") {
        log(
          pint(bgPint(new Date(), "white"), "black.") + "\n" +
          pint(bgPint("[ NUEVO MENSAJE ]", "white"), "black.") + "\n" +
          pint(bgPint(budy, "blue"), "white.") + "\n" +
          pint("=> Sender: ", "magenta") + pint(pushname) + " " + pint(m.sender, "yellow") + "\n" +
          pint("=> To: ", "blue") + " " + pint(m.isGroup ? pushname : "Chat Privado") + " " + pint(m.chat) + "\n\n"
        );
      }
    };

    // reset users every 12 hours
    /*let cron = require("node-cron");
    cron.schedule("00 12 * * *", () => {
        log(pint("Reseted Data", "yellow."));
    },{
      scheduled: true,
      timezone: global.timeZone,
    });*/

    // Respon Cmd with media
    /*if (isMedia && m.msg.fileSha256 && m.msg.fileSha256.toString("base64")) {
      let hash = m.msg.fileSha256.toString("base64");
      let { text, mentionedJid } = hash;
      let messages = await generateWAMessage( m.chat, {
        text: text,
        mentions: mentionedJid
      },{
        userJid: myBot.user.id,
        quoted: m.quoted && m.quoted.fakeObj,
      });
      messages.key.fromMe = areJidsSameUser(m.sender, myBot.user.id);
      messages.key.id = m.key.id;
      messages.pushName = m.pushName;
      if (m.isGroup) messages.participant = m.sender;
      let msg = {
        ...chatUpdate,
        messages: [proto.WebMessageInfo.fromObject(messages)],
        type: "append",
      };
      myBot.ev.emit("messages.upsert", msg);
    };*/
    
    const cmd = Object.values(attr.commands).find((cmn) => cmn.cmd && cmn.cmd.includes(command) && !cmn.disabled)
    if (budy) {
      if (regUser === false) {
        new User(m.sender, pushname)
        myBot.sendText(m.chat, myLang("global").welcome)
      } else if (cmd) {
      if (cmd.owner && !isCreator) return //myBot.sendText(m.chat, myLang("global").owner);
      else if(checkUser.block == true) return myBot.sendText(m.chat, myLang("global").block);
      /*else if (checkUser.points < cmd.check.pts) {
        return myBot.sendText(m.chat, myLang("global").no_points) }*/
        await cmd.handler(m, {
          myBot,
          myLang,
          pushname,
          command,
          prefix,
          text,
          mime,
          User,
          participants,
          regUser,
          quoted,
        });
      } else {
        const is_event = Object.values(attr.commands).filter((func) => !func.cmd && !func.disabled);
        for (const event of is_event) {
          if(checkUser.block == true) return myBot.sendText(m.chat, myLang("global").block);
          /*if (checkUser.points < event.check.pts) {
            return myBot.sendText(m.chat, myLang("global").no_points) }*/
          await event.handler(m, {
            myBot, myLang, budy, pushname, User,
          })
        }
      }
    };

  } catch (err) {
    if (Config.LOG == "false") return;
    myBot.sendText(m.chat, msgErr())
    myBot.sendMessage(myBot.user.id, { text: `*-- ${myLang("err").msgReport} [ ${Config.BOT_NAME} ] --*\n` + "*Error:* ```" + err + "```"});
  };
};

let file = require.resolve(__filename);
fs.watchFile(file, () => {
  fs.unwatchFile(file);
  log(pint(`Update ${__filename}`, "orange."));
  delete require.cache[file];
  require(file);
});