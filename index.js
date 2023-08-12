/*
  Copyright (C) 2023
  DarkBox - Ian VanH
  Licensed MIT
  you may not use this file except in compliance with the License.
*/

require('./config')
const { default: myBotConnect, DisconnectReason, generateWAMessageFromContent, downloadContentFromMessage, makeInMemoryStore, jidDecode, proto, generateWAMessage, getContentType } = require("@adiwajshing/baileys")
//const { DisconnectReason, generateWAMessageFromContent, downloadContentFromMessage, makeInMemoryStore, jidDecode, proto, generateWAMessage, getContentType } = require("@adiwajshing/baileys")
const { useSingleFileAuthState } = require('./lib/s-auth-state')
const Config = require('./config');
const { state, saveState } = useSingleFileAuthState(`./${Config.SESSION}.json`)
const pino = require('pino')
const { Boom } = require('@hapi/boom')
const fs = require('fs')
const yargs = require('yargs/yargs')
const FileType = require('file-type')
const path = require('path')
const _ = require('lodash')
const axios = require('axios')
const Jimp = require('jimp')
const PhoneNumber = require('awesome-phonenumber')
const { imageToWebp, writeExifImg, writeExif } = require('./lib/exif')
const { smsg, getBuffer, getSizeMedia, sleep, getFile } = require('./lib/myfunc')
const { log, pint, bgPint } = require('./lib/colores');
const { toAudio } = require('./lib/converter')
const { User } = require("./src/data");
const { BOT_NAME } = require('./config');

//language
const myLang = require('./language').getString

global.api = (name, path = '/', query = {}, apikeyqueryname) => (name in global.APIs ? global.APIs[name] : name) + path + (query || apikeyqueryname ? '?' + new URLSearchParams(Object.entries({ ...query, ...(apikeyqueryname ? { [apikeyqueryname]: global.APIKeys[name in global.APIs ? global.APIs[name] : name] } : {}) })) : '')

const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) })

global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse())

global.databaseFile = "./src/database.json";
global.database = {};

try {
  database = JSON.parse(fs.readFileSync(databaseFile));
} catch (error) {
  fs.writeFileSync(databaseFile, JSON.stringify(database, null, 2));
  log(pint(bgPint("Base de datos creada con exito", "orange"), "white."))
}


//global.component = new (require('@neoxr/neoxr-js'))

global.attr = {};
attr.commands = new Map();
attr.functions = new Map();

const readPlugins = () => {
  let pluginsDir = path.join(__dirname, "./plugins");
  let pluginPath = fs.readdirSync(pluginsDir)
  for (let fold of pluginPath) {
    for (let filename of fs.readdirSync(__dirname + `/plugins/${fold}`)) {
      plugins = require(path.join(__dirname + `/plugins/${fold}`, filename));
      plugins.function ? (attr.functions[filename] = plugins) : (attr.commands[filename] = plugins);
    }
  }
  log("Command loaded successfully");
};
readPlugins();


const folderPath = './temp';
fs.watch(folderPath, (eventType, filename) => {
  if (eventType === 'rename') {
    fs.unlink(`${folderPath}/${filename}`, (err) => {
      if (err) return;
      log(`Archivo ${filename} eliminado`);
    });
  }
});


async function startMybot() {
    const myBot = myBotConnect({
      logger: pino({ level: 'silent' }),
      printQRInTerminal: true,
      browser: ["DrkBot", "Safari", "13.0.0"],
      auth: state
    })

    store.bind(myBot.ev)

    // anticall auto block
    /*myBot.ws.on('CB:call', async (json) => {
      const callerId = json.content[0].attrs['call-creator']
      if (json.content[0].tag == 'offer') {
        let owIan = await myBot.sendContact(callerId, global.owner)
        myBot.sendMessage(callerId, { text: `Sistema de bloqueo por llamadas!\nSi quieres ser desbloqueado contacta a mi creador!`}, { quoted : owIan })
        await sleep(8000)
        await myBot.updateBlockStatus(callerId, "block")
      }
    })*/

    myBot.ev.on('messages.upsert', async (chatUpdate) => {
      try {
        mek = chatUpdate.messages[0]
        if (!mek.message) return
        mek.message = (Object.keys(mek.message)[0] === 'ephemeralMessage') ? mek.message.ephemeralMessage.message : mek.message
        if (mek.key && mek.key.remoteJid === 'status@broadcast') return
        if (!myBot.public && !mek.key.fromMe && chatUpdate.type === 'notify') return
        if (mek.key.id.startsWith('BAE5') && mek.key.id.length === 16) return
        if (Config.ONLINE === 'true'){
          await myBot.sendPresenceUpdate('available', mek.key.id);
        } else if (Config.ONLINE === 'false'){
          await myBot.sendPresenceUpdate('unavailable', mek.key.id);
        }
        m = smsg(myBot, mek, store)
        await require("./ian")(myBot, m, chatUpdate, store)
      } catch (err) {
        log(pint(err, 'red.'))
      }
    })

    myBot.ev.on('group-participants.update', async (room) => {})
	
    myBot.decodeJid = (jid) => {
        if (!jid) return jid
        if (/:\d+@/gi.test(jid)) {
            let decode = jidDecode(jid) || {}
            return decode.user && decode.server && decode.user + '@' + decode.server || jid
        } else return jid
    }
    
    myBot.ev.on('contacts.update', update => {
        for (let contact of update) {
            let id = myBot.decodeJid(contact.id)
            if (store && store.contacts) store.contacts[id] = { id, name: contact.notify }
        }
    })

    myBot.getName = (jid, withoutContact = false) => {
        id = myBot.decodeJid(jid)
        withoutContact = myBot.withoutContact || withoutContact 
        let v
        if (id.endsWith("@g.us")) return new Promise(async (resolve) => {
            v = store.contacts[id] || {}
            if (!(v.name || v.subject)) v = myBot.groupMetadata(id) || {}
            resolve(v.name || v.subject || PhoneNumber('+' + id.replace('@s.whatsapp.net', '')).getNumber('international'))
        })
        else v = id === '0@s.whatsapp.net' ? {
            id,
            name: 'WhatsApp'
        } : id === myBot.decodeJid(myBot.user.id) ?
            myBot.user :
            (store.contacts[id] || {})
            return (withoutContact ? '' : v.name) || v.subject || v.verifiedName || PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international')
    }
    
    myBot.sendContact = async (jid, kon, quoted = '', opts = {}) => {
	let list = []
	for (let i of kon) {
	    list.push({
	    	displayName: await myBot.getName(i + '@s.whatsapp.net'),
	    	vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${await myBot.getName(i + '@s.whatsapp.net')}\nFN:${await myBot.getName(i + '@s.whatsapp.net')}\nitem1.TEL;waid=${i}:${i}\nitem1.X-ABLabel:Tel\nitem2.EMAIL;type=INTERNET:drkbot@gmail.com\nitem2.X-ABLabel:Email\nitem3.URL:https://instagram.com/iand_tv\nitem3.X-ABLabel:Instagram\nitem4.ADR:;;Colombia;;;;\nitem4.X-ABLabel:Region\nEND:VCARD`
	    })
	}
	myBot.sendMessage(jid, { contacts: { displayName: `${list.length} Contact`, contacts: list }, ...opts }, { quoted })
    }
    
    myBot.setStatus = (status) => {
        myBot.query({
            tag: 'iq',
            attrs: {
                to: '@s.whatsapp.net',
                type: 'set',
                xmlns: 'status',
            },
            content: [{
                tag: 'status',
                attrs: {},
                content: Buffer.from(status, 'utf-8')
            }]
        })
        return status
    }
	if (Config.WORKTYPE === 'private'){
    myBot.public = false
	} else if (Config.WORKTYPE === 'public'){
    myBot.public = true
	}
  global.wtMyBot = myBot.public == true ? ' Publico' : ' Privado'
    //let work_type = myBot.public == true ? myLang('work_type').public : myLang('work_type').private
    log(pint('🤖 DrkBot Modo' + wtMyBot, '.'));
    log(pint(
      '[copyright By: Ian]\n' + 
      'Prohibida su venta\n' +
      'Chatea con ©Ian\n' +
      'Wats +573508770421\n\n', '#d30092'
    ));


    myBot.serializeM = (m) => smsg(myBot, m, store)

    myBot.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect } = update
        try {
          if (connection === 'close') {
            let reason = new Boom(lastDisconnect?.error)?.output.statusCode
            if (reason === DisconnectReason.badSession) { log(`Archivo de sesión corrupto, elimine la sesión y vuelva a escanear.`); myBot.logout(); }
            else if (reason === DisconnectReason.connectionClosed) { log("Conexión cerrada, reconectando...."); startMybot(); }
            else if (reason === DisconnectReason.connectionLost) { log("Conexión perdida del servidor, reconectando..."); startMybot(); }
            else if (reason === DisconnectReason.connectionReplaced) { log("Conexión reemplazada, otra nueva sesión abierta, cierre la sesión actual primero."); myBot.logout(); }
            else if (reason === DisconnectReason.loggedOut) { log(`Dispositivo cerrado, escanee nuevamente y ejecute.`); myBot.logout(); }
            else if (reason === DisconnectReason.restartRequired) { log("Reinicio requerido, reiniciando..."); startMybot(); }
            else if (reason === DisconnectReason.timedOut) { log("Se agotó el tiempo de espera de la conexión, reconectando..."); startMybot(); }
            else { log(`Unknown DisconnectReason: ${reason}|${connection}`); startMybot(); }
          }
          if (update.connection == "open" || update.receivedPendingNotifications == "true") {
            myBot.sendImage(myBot.user.id, global.thumb, 'Bot Online')
            if(!User.check(myBot.decodeJid(myBot.user.id))) {
              new User(myBot.decodeJid(myBot.user.id), Config.BOT_NAME)
              User.change(myBot.decodeJid(myBot.user.id), { premium: true });
            }
            log('Connected...', update)
          }
        } catch {
          log('Connected...', update)
        }
    })

    myBot.ev.on('creds.update', saveState)
    
    
    myBot.sendReact = async (jid, emoji, keys = {}) => {
      let reactionMessage = {
         react: {
            text: emoji,
            key: keys
         }
      }
      return await myBot.sendMessage(jid, reactionMessage)
    };

    // Add Other
    /**
     *
     * @param {*} jid
     * @param {*} url
     * @param {*} caption
     * @param {*} quoted
     * @param {*} options
     */
    myBot.sendFileUrl = async (jid, url, caption, quoted, options = {}) => {
      let mime = '';
      let res = await axios.head(url)
      mime = res.headers['content-type']
      if (mime.split("/")[1] === "gif") {
        return myBot.sendMessage(jid, { video: await getBuffer(url), caption: caption, gifPlayback: true, ...options}, { quoted: quoted, ...options})
      }
      let type = mime.split("/")[0]+"Message"
      if(mime === "application/pdf"){
        return myBot.sendMessage(jid, { document: await getBuffer(url), mimetype: 'application/pdf', caption: caption, ...options}, { quoted: quoted, ...options })
      }
      if(mime.split("/")[0] === "image"){
        return myBot.sendMessage(jid, { image: await getBuffer(url), caption: caption, ...options}, { quoted: quoted, ...options})
      }
      if(mime.split("/")[0] === "video"){
        return myBot.sendMessage(jid, { video: await getBuffer(url), caption: caption, mimetype: 'video/mp4', ...options}, { quoted: quoted, ...options })
      }
      if(mime.split("/")[0] === "audio"){
        return myBot.sendMessage(jid, { audio: await getBuffer(url), caption: caption, mimetype: 'audio/mpeg', ...options}, { quoted: quoted, ...options })
      }
    }
    
    /**
     * Reply to a message
     * @param {String} jid
     * @param {String|Object} text
     * @param {Object} quoted
     * @param {Object} options
     */
    myBot.reply = (jid, text = '', quoted, options) => {
        return Buffer.isBuffer(text) ? myBot.sendFile(jid, text, 'file', '', quoted, false, options) : myBot.sendMessage(jid, { contextInfo: { mentionedJid: myBot.parseMention(text)}, ...options, text }, { quoted, ...options })
        //return Buffer.isBuffer(text) ? myBot.sendFile(jid, text, 'file', '', quoted, false, options) : myBot.sendMessage(jid, { ...options, text }, { quoted, ...options })
    }

      /** Resize Image
      *
      * @param {Buffer} Buffer (Only Image)
      * @param {Numeric} Width
      * @param {Numeric} Height
      */
      myBot.reSize = async (image, width, height) => {
        var oyy = await Jimp.read(image);
        var kiyomasa = await oyy.resize(width, height).getBufferAsync(Jimp.MIME_JPEG)
        return kiyomasa
      }

      myBot.sendMsg = async (jid, message = {}, options = {}) => {
				return await myBot.sendMessage(jid, message, { ...options, ...ephemeral })
			}

    myBot.sendError = async (jid, text) => {
      let aa = { quoted: m, userJid: myBot.user.id };
      let prep = await generateWAMessageFromContent(jid, {
        extendedTextMessage: {
          text: text,
          contextInfo: {
            externalAdReply: {
              title: "Official Group",
              body: null,
              thumbnail: global.thumb,
              sourceUrl: groupBot,
            }
          }
        }
      }, aa);
      return myBot.relayMessage(jid, prep.message, {
        messageId: prep.key.id,
      });
    }

    /**
     * 
     * @param {*} jid 
     * @param {*} text 
     * @param {*} quoted 
     * @param {*} options 
     * @returns 
     */
    myBot.sendText = (jid, text, quoted = '', options) => myBot.sendMessage(jid, { text: text, ...options }, { quoted })

    /**
     * 
     * @param {*} jid 
     * @param {*} path 
     * @param {*} caption 
     * @param {*} quoted 
     * @param {*} options 
     * @returns 
     */
    myBot.sendImage = async (jid, path, caption = '', quoted = '', options) => {
      let buffer = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
      return await myBot.sendMessage(jid, { image: buffer, caption: caption, ...options }, { quoted })
    }

    /**
     * 
     * @param {*} jid 
     * @param {*} path 
     * @param {*} caption 
     * @param {*} quoted 
     * @param {*} options 
     * @returns 
     */
    myBot.sendVideo = async (jid, path, caption = '', quoted = '', gif = false, options) => {
        let buffer = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
        return await myBot.sendMessage(jid, { video: buffer, caption: caption, gifPlayback: gif, ...options }, { quoted })
    }

    /**
     * 
     * @param {*} jid 
     * @param {*} path 
     * @param {*} quoted 
     * @param {*} mime 
     * @param {*} options 
     * @returns 
     */
    myBot.sendAudio = async (jid, path, quoted = '', ptt = false, options) => {
        let buffer = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
        return await myBot.sendMessage(jid, { audio: buffer, ptt: ptt, ...options }, { quoted })
    }

    /**
     * 
     * @param {*} jid 
     * @param {*} text 
     * @param {*} quoted 
     * @param {*} options 
     * @returns 
     */
    myBot.sendTextWithMentions = async (jid, text, quoted, options = {}) => myBot.sendMessage(jid, { text: text, contextInfo: { mentionedJid: [...text.matchAll(/@(\d{0,16})/g)].map(v => v[1] + '@s.whatsapp.net') }, ...options }, { quoted })

    /**
     * 
     * @param {*} jid 
     * @param {*} path 
     * @param {*} quoted 
     * @param {*} options 
     * @returns 
     */
    myBot.sendImageAsSticker = async (jid, path, quoted, options = {}) => {
        let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
        if (options && (options.packname || options.author)) {
            buffer = await writeExifImg(buff, options)
        } else {
            buffer = await imageToWebp(buff)
        }
        await myBot.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted })
        return buffer
    }
	
    /**
     * 
     * @param {*} message 
     * @param {*} filename 
     * @param {*} attachExtension 
     * @returns 
     */
    myBot.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {
        let quoted = message.msg ? message.msg : message
        let mime = (message.msg || message).mimetype || ''
        let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
        const stream = await downloadContentFromMessage(quoted, messageType)
        let buffer = Buffer.from([])
        for await(const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }
	let type = await FileType.fromBuffer(buffer)
        trueFileName = attachExtension ? (filename + '.' + type.ext) : filename
        // save to file
        await fs.writeFileSync(trueFileName, buffer)
        return trueFileName
    }

    myBot.downloadMediaMessage = async (message) => {
        let mime = (message.msg || message).mimetype || ''
        let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
        const stream = await downloadContentFromMessage(message, messageType)
        let buffer = Buffer.from([])
        for await(const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
	}
        
	return buffer
     } 
    
    /**
     * 
     * @param {*} jid 
     * @param {*} path 
     * @param {*} filename
     * @param {*} caption
     * @param {*} quoted 
     * @param {*} options 
     * @returns 
     */
    myBot.sendMedia = async (jid, path, fileName = '', caption = '', quoted = '', options = {}) => {
        let types = await myBot.getFile(path, true)
           let { mime, ext, res, data, filename } = types
           if (res && res.status !== 200 || file.length <= 65536) {
               try { throw { json: JSON.parse(file.toString()) } }
               catch (e) { if (e.json) throw e.json }
           }
       let type = '', mimetype = mime, pathFile = filename
       if (options.asDocument) type = 'document'
       if (options.asSticker || /webp/.test(mime)) {
        let { writeExif } = require('./lib/exif')
        let media = { mimetype: mime, data }
        pathFile = await writeExif(media, { packname: options.packname ? options.packname : global.packname, author: options.author ? options.author : Config.BOT_NAME, categories: options.categories ? options.categories : [] })
        await fs.promises.unlink(filename)
        type = 'sticker'
        mimetype = 'image/webp'
        }
       else if (/image/.test(mime)) type = 'image'
       else if (/video/.test(mime)) type = 'video'
       else if (/audio/.test(mime)) type = 'audio'
       else type = 'document'
       await myBot.sendMessage(jid, { [type]: { url: pathFile }, caption, mimetype, fileName, ...options }, { quoted, ...options })
       return fs.promises.unlink(pathFile)
       }

    /**
     * 
     * @param {*} jid 
     * @param {*} message 
     * @param {*} forceForward 
     * @param {*} options 
     * @returns 
     */
    myBot.copyNForward = async (jid, message, forceForward = false, options = {}) => {
        let vtype
		if (options.readViewOnce) {
			message.message = message.message && message.message.ephemeralMessage && message.message.ephemeralMessage.message ? message.message.ephemeralMessage.message : (message.message || undefined)
			vtype = Object.keys(message.message.viewOnceMessage.message)[0]
			delete(message.message && message.message.ignore ? message.message.ignore : (message.message || undefined))
			delete message.message.viewOnceMessage.message[vtype].viewOnce
			message.message = {
				...message.message.viewOnceMessage.message
			}
		}

        let mtype = Object.keys(message.message)[0]
        let content = await generateForwardMessageContent(message, forceForward)
        let ctype = Object.keys(content)[0]
		let context = {}
        if (mtype != "conversation") context = message.message[mtype].contextInfo
        content[ctype].contextInfo = {
            ...context,
            ...content[ctype].contextInfo
        }
        const waMessage = await generateWAMessageFromContent(jid, content, options ? {
            ...content[ctype],
            ...options,
            ...(options.contextInfo ? {
                contextInfo: {
                    ...content[ctype].contextInfo,
                    ...options.contextInfo
                }
            } : {})
        } : {})
        await myBot.relayMessage(jid, waMessage.message, { messageId:  waMessage.key.id })
        return waMessage
    }

    myBot.cMod = (jid, copy, text = '', sender = myBot.user.id, options = {}) => {
        //let copy = message.toJSON()
		let mtype = Object.keys(copy.message)[0]
		let isEphemeral = mtype === 'ephemeralMessage'
        if (isEphemeral) {
            mtype = Object.keys(copy.message.ephemeralMessage.message)[0]
        }
        let msg = isEphemeral ? copy.message.ephemeralMessage.message : copy.message
		let content = msg[mtype]
        if (typeof content === 'string') msg[mtype] = text || content
		else if (content.caption) content.caption = text || content.caption
		else if (content.text) content.text = text || content.text
		if (typeof content !== 'string') msg[mtype] = {
			...content,
			...options
        }
        if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant
		else if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant
		if (copy.key.remoteJid.includes('@s.whatsapp.net')) sender = sender || copy.key.remoteJid
		else if (copy.key.remoteJid.includes('@broadcast')) sender = sender || copy.key.remoteJid
		copy.key.remoteJid = jid
		copy.key.fromMe = sender === myBot.user.id

        return proto.WebMessageInfo.fromObject(copy)
    }

    /**
     * 
     * @param {*} path 
     * @returns 
     */
    myBot.getFile = async (PATH, save) => {
        let res
        let data = Buffer.isBuffer(PATH) ? PATH : /^data:.*?\/.*?;base64,/i.test(PATH) ? Buffer.from(PATH.split`,`[1], 'base64') : /^https?:\/\//.test(PATH) ? await (res = await getBuffer(PATH)) : fs.existsSync(PATH) ? (filename = PATH, fs.readFileSync(PATH)) : typeof PATH === 'string' ? PATH : Buffer.alloc(0)
        //if (!Buffer.isBuffer(data)) throw new TypeError('Result is not a buffer')
        let type = await FileType.fromBuffer(data) || {
            mime: 'application/octet-stream',
            ext: '.bin'
        }
        filename = path.join(__filename, '../temp/' + new Date * 1 + '.' + type.ext)
        if (data && save) fs.promises.writeFile(filename, data)
        return {
            res,
            filename,
	    size: await getSizeMedia(data),
            ...type,
            data
        }
    }
    
    myBot.sendFile = async (jid, path, filename = '', caption = '', quoted, ptt = false, options = {}) => {
                let type = await myBot.getFile(path, true)
                let { res, data: file, filename: pathFile } = type
                if (res && res.status !== 200 || file.length <= 65536) {
                    try { throw { json: JSON.parse(file.toString()) } }
                    catch (e) { if (e.json) throw e.json }
                }
                //const fileSize = fs.statSync(pathFile).size / 1024 / 1024
                //if (fileSize >= 100) throw new Error('File size is too big!')
                let opt = {}
                if (quoted) opt.quoted = quoted
                if (!type) options.asDocument = true
                let mtype = '', mimetype = options.mimetype || type.mime, convert
                if (/webp/.test(type.mime) || (/image/.test(type.mime) && options.asSticker)) mtype = 'sticker'
                else if (/image/.test(type.mime) || (/webp/.test(type.mime) && options.asImage)) mtype = 'image'
                else if (/video/.test(type.mime)) mtype = 'video'
                else if (/audio/.test(type.mime)) (
                    convert = await toAudio(file, type.ext),
                    file = convert.data,
                    pathFile = convert.filename,
                    mtype = 'audio',
                    mimetype = options.mimetype || 'audio/ogg; codecs=opus'
                )
                else mtype = 'document'
                if (options.asDocument) mtype = 'document'

                delete options.asSticker
                delete options.asLocation
                delete options.asVideo
                delete options.asDocument
                delete options.asImage

                let message = {
                    ...options,
                    caption,
                    ptt,
                    [mtype]: { url: pathFile },
                    mimetype,
                    fileName: filename || pathFile.split('/').pop()
                }
                /**
                 * @type {import('@adiwajshing/baileys').proto.WebMessageInfo}
                 */
                let m
                try {
                    m = await myBot.sendMessage(jid, message, { ...opt, ...options })
                } catch (e) {
                    console.error(e)
                    m = null
                } finally {
                    if (!m) m = await myBot.sendMessage(jid, { ...message, [mtype]: file }, { ...opt, ...options })
                    file = null // releasing the memory
                    return m
                }
            }
    
    /**
     * Parses string into mentionedJid(s)
     * @param {String} text
     */
    myBot.parseMention = (text = '') => {
        return [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(v => v[1] + '@s.whatsapp.net')
    }

    return myBot
}

startMybot()


let file = require.resolve(__filename);
Object.freeze(global.reload)
process.on("uncaughtException", function(err) {
  console.error(err);
});