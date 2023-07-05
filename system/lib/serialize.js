import { Client as _Client } from "mywajs"
/*
/*************************
* Pake tinggal make
* jangan hapus sumbernya
**************************
* Github: amiruldev20
* Wa: 085157489446
*/
import { Message, MessageMedia, Contact, Location, Buttons, List } from 'mywajs/src/structures/index.js'
import Function from "./function.js"
import fs, { stat } from "fs"
import { extension } from "mime-types"
import { dirname, join } from "path"
import { fileURLToPath } from "url"
import Util from "mywajs/src/util/Util.js"


const __dirname = dirname(fileURLToPath(import.meta.url))

class Client extends _Client {
constructor(...args) {
super(...args)
}

/**
 * 
 * @param {*} chatId 
 * @param {*} name 
 * @param {*} choices 
 * @param {*} options 
 * @returns 
 */
async sendPoll(chatId, name, choices, options = {}) {
let message = await this.mPage.evaluate(async ({ chatId, name, choices, options }) => {
let rawMessage = {
waitForAck: true,
sendSeen: true,
type: 'poll_creation',
pollName: name,
pollOptions: choices.map((name, localId) => ({ name, localId })),
pollEncKey: self.crypto.getRandomValues(new Uint8Array(32)),
pollSelectableOptionsCount: options.selectableCount || 0,
messageSecret: self.crypto.getRandomValues(new Uint8Array(32)),
}

await window.WWebJS.sendRawMessage(chatId, rawMessage, options)
}, { chatId, name, choices, options })

if (!message) return null
return new Message(this, message)
}


/**
 * 
 * @param {*} msgId 
 * @returns 
 */
async loadMessage(message) {
const msg = await this.mPage.evaluate(async messageId => {
let msg = window.Store.Msg.get(messageId);
if (msg) return window.WWebJS.getMessageModel(msg);

const params = messageId.split('_');
if (params.length !== 3) throw new Error('Invalid serialized message id specified');

const [fromMe, chatId, id] = params;
const chatWid = window.Store.WidFactory.createWid(chatId);
const fullMsgId = {
fromMe: Boolean(fromMe),
remote: chatWid,
id,
};

const msgKey = new window.Store.MsgKey(fullMsgId);
const chat = await window.Store.Chat.find(msgKey.remote);
const ctx = await chat.getSearchContext(msgKey);
if (ctx.collection && ctx.collection.loadAroundPromise) {
await ctx.collection.loadAroundPromise;
}

msg = window.Store.Msg.get(messageId);
if (msg) return window.WWebJS.getMessageModel(msg);
}, message?._serialized ? message._serialized : message);

if (msg) {
let messages = new Message(this, msg);
return await (await serialize(this, messages));
}
return null;
}

/**
 * 
 * @param {*} message ID 
 * @returns 
 */
async infoMessage(m) {
if (!m) return

const info = await this.mPage.evaluate(async (msgId) => {
const msg = window.Store.Msg.get(msgId);
if (!msg) return null;

return await window.Store.MessageInfo.sendQueryMsgInfo(msg.id);
}, m.id ? m.id._serialized : m);

return info
}

/**
 * 
 * @param {*} chatId 
 * @param {*} msgId 
 */
async forwardMessage(chatId, msgId, options = {}) {
if (!msgId) throw new Error("No Input Message ID")
if (!chatId) throw new Error("No Input Chat ID")

await this.mPage.evaluate(async ({ msgId, chatId, options }) => {
let msg = window.Store.Msg.get(msgId)

await msg.serialize()

if (options?.mentions) {
msg.mentionedJidList = options.mentions.map(cId => window.Store.WidFactory.createWid(cId));

delete options.mentions
}

if (options?.text) {
if (msg.type === 'chat') msg.body = options.text
else {
msg.caption = ''
msg.caption = options.text
}

delete options.text
}

let chat = window.Store.Chat.get(chatId)

return await chat.forwardMessages([msg])
}, { msgId, chatId, options })
}

/**
 * Gets the Contact's common groups with you. Returns empty array if you don't have any common group.
 * @param {string} contactId the whatsapp user's ID (_serialized format)
 * @returns {Promise<WAWebJS.ChatId[]>}
 */
async getCommonGroups(contactId) {
const commonGroups = await this.mPage.evaluate(async (contactId) => {
let contact = window.Store.Contact.get(contactId);
if (!contact) {
const wid = window.Store.WidFactory.createUserWid(contactId);
const chatConstructor = window.Store.Contact.getModelsArray().find(c => !c.isGroup).constructor;
contact = new chatConstructor({ id: wid });
}

if (contact.commonGroups) {
return contact.commonGroups.serialize();
}
const status = await window.Store.findCommonGroups(contact);
if (status) {
return contact.commonGroups.serialize();
}
return [];
}, contactId);
const chats = [];
for (const group of commonGroups) {
chats.push(await (await this.groupMetadata(group?.id ? group.id._serialized : group)));
}
return chats;
}

/**
 * Get All Metadata Groups
 */
async getAllGroups() {
let groups = await this.mPage.evaluate(() => {
return window.mR.findModule('queryAllGroups')[0].queryAllGroups()
})
const chats = []
for (const group of groups) {
chats.push(await (await this.groupMetadata(group?.id ? group.id._serialized : group)))
}
return chats
}

/**
 * 
 * @param {string} name 
 * @returns 
 */
async getContactByName(name) {
let contact = (await this.getContacts()).filter(a => a.name && (a.name.toLowerCase().includes(name) || a.name.includes(name)))

if (contact.length == 0) return null
return contact
}

/**
 * 
 * @param {*} chatId 
 * @param {Buffer} content 
 * @returns 
 */
async setProfilePic(chatId, content, type = 'normal') {
let data
if ((Buffer.isBuffer(content) || /^data:.*?\/.*?;base64,/i.test(content) || /^https?:\/\//.test(content) || fs.existsSync(content))) {
let media = await Function.getFile(content)
if (type === 'long') {
data = {
img: await (await Function.resizeImage(media?.data, 720)).toString('base64'),
preview: await (await Function.resizeImage(media?.data, 120)).toString('base64')
}
} else if (type === 'normal') {
data = {
img: await (await Function.resizeImage(media?.data, 640)).toString('base64'),
preview: await (await Function.resizeImage(media?.data, 96)).toString('base64')
}
}
}

return this.mPage.evaluate(async ({ chatId, preview, image, type }) => {
let chatWid = await window.Store.WidFactory.createWid(chatId)

if (type === 'delete') return window.Store.GroupUtils.requestDeletePicture(chatWid)

return window.Store.GroupUtils.sendSetPicture(chatWid, image, preview)
}, { chatId, preview: data.img, image: data.preview, type })
}

/**
 * 
 * @param {*} text 
 * @returns 
 */
parseMention(text) {
return [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(v => v[1] + '@c.us') || []
}
}


const serialize = async (mywa, m) => {
if (!m) return
m.github = "https://github.com/amiruldev20"
if (m?._data?.id) {
m.id = {
remote: m._data.id.remote || m._data.to,
participant: (typeof (m._data.author) === 'object' && m._data.author !== null) ? m._data.author._serialized : m._data.author,
fromMe: m._data.id.fromMe,
id: m._data.id.id,
_serialized: m._data.id._serialized
}
}
m.from = m.id.remote
m.sender = m.id.participant || m._data.from._serialized || m._data.from || m.from
m.isOwner = m.sender && [...global.set.owner].includes(m.sender.replace(/\D+/g, ""))
//m.isPremium = m.sender && global.db.users[m.sender]?.premium || m.isOwner || global.db.users[m.sender]?.VIP || false
m.isVIP = m.sender && global.db.users[m.sender]?.VIP || m.isOwner || false
m.pushName = m._data.notifyName
m.isGroup = m.from.endsWith('g.us') || false
m.isBot = (m.id?.id?.startsWith("3EB0")) || (m.id?.id?.startsWith("BAE5")) || false
if (mywa.info) m.botNumber = mywa.info.me._serialized || mywa.info.wid._serialized

m.mentions = (Array.isArray(m._data.mentionedJidList) && m._data.mentionedJidList.length !== 0) ? m._data.mentionedJidList.map(a => a._serialized) : [],
m._serialized = m.id._serialized
m.isMedia = m.hasMedia
m.isNewMsg = m._data.isNewMsg
m.ephemeralDuration = m._data.ephemeralDuration || 0

if (m.isMedia) {
m.deprecatedMms3Url = m._data.deprecatedMms3Url
m.directPath = m._data.directPath
m.mime = m._data.mimetype
m.filehash = m._data.filehash
m.encFilehash = m._data.encFilehash
m.mediaKey = m._data.mediaKey
m.width = m._data.width
m.height = m._data.height
if (m._data.mediaKeyTimestamp) m.mediaKeyTimestamp = m._data.mediaKeyTimestamp
if (m._data.size) m.fileSize = m._data.size
if (m._data.isViewOnce) {
m.isViewOnce = m._data.isViewOnce
m.caption = m._data.caption || ''
}
if (m._data.wavefrom) m.wavefrom = m._data.wavefrom
if (m._data.thumbnailWidth) m.thumbnailWidth = m._data.thumbnailWidth
if (m._data.thumbnailHeight) m.thumbnailHeight = m._data.thumbnailHeight
if (m._data.isAnimated) m.isAnimated = m._data.isAnimated
}

if (m.isGroup) {
m.metadata = await (await mywa.groupMetadata(m.from))
m.groupAdmins = m.metadata.participants.filter((a) => (a.isAdmin || a.isSuperAdmin))
m.isAdmin = !!m.groupAdmins.find((member) => ((typeof member.id === 'object' && member.id !== undefined) ? member.id._serialized : member.id) === m.sender)
m.isBotAdmin = !!m.groupAdmins.find((member) => ((typeof member.id === 'object' && member.id !== undefined) ? member.id._serialized : member.id) === m.botNumber)
}

m.body = m?.selectedButtonId || m?.selectedRowId || m?._data?.caption || m?._data?.body || m?.body || ''
m.arg = m?.body?.trim()?.split(/ +/) || []
m.args = m?.body?.trim()?.split(/ +/)?.slice(1) || []
m.text = m?.args?.join(" ")

// custom function message
if (m.isMedia) m.downloadMedia = (filePath) => {
if (filePath) return mywa.downloadAndSaveMediaMessage(m, filePath)
else return mywa.downloadMediaMessage(m)
}
m.resend = () => mywa.forwardMessage(m.from, m._serialized)
//m.reply = (content, options = {}) => mywa.sendMessage(options.from ? options.from : m.from, content, { quoted: m, ...options })

if (!m.author) delete m.author
if (!m.isStatus) delete m.isStatus
if (!m.isForwarded) delete m.isForwarded
if (m.forwardingScore === 0) delete m.forwardingScore
if (m.vCards.length === 0) delete m.vCards
if (!m.inviteV4) delete m.inviteV4
if (!m.orderId) delete m.orderId
if (!m.token) delete m.token
if (!m.hasMedia) {
delete m.duration
delete m.isGif
}
if (!m.isEphemeral) {
delete m.isEphemeral
delete m.ephemeralDuration
}

delete m._data
delete m.mentionedIds
delete m.location

if (m.hasQuotedMsg) {
let data = await m.getQuotedMessage() || {}
m.quoted = await (await serialize(mywa, data))

delete data._data
}

return await (await m)
}


export { Client, serialize }

async function reloadFile(file) {
    let fileP = fileURLToPath(file)
    fs.watchFile(fileP, () => {
        fs.unwatchFile(fileP)
        console.log(`[ UPDATE ] file => "${fileP}"`)
        import(`${file}?update=${Date.now()}`)
    })
}
reloadFile(import.meta.url)
