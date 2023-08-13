import fs from 'fs'
export default {
  name: "savefile",
  cmd: ["sf", "savefile"],
  tags: "owner",
  desc: "Mensave plugins",
  example: `*Example Command*\n%prefixsf cmd/main/menu.js`,
  run: async({m}) => {
    try {
      let text = m.text,
      path = `${text}`
      await fs.writeFileSync(path, m.quoted.body)
      m.reply(`tersimpan di ${path}`)
    } catch (e) {
      m.reply("*Format Salah!*\nReply dulu text yg akan di save baru tulis command\nContoh: .sf cmd/folder/namafile.js")
    }
  },
  isOwner: true
}