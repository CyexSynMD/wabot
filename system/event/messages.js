/*
/*************************
* Pake tinggal make
* jangan hapus sumbernya
**************************
* Github: amiruldev20
* Wa: 085157489446
*/
import "../../setting.js";
import fs from "fs";
import moment from "moment-timezone";
import path from "path";
import { format } from "util";
import chalk from "chalk";
import { fileURLToPath } from "url";
global.tags = [
  "convert",
  "download",
  "group",
  "jadi bot",
  "main",
  "owner",
  "search",
  "tool",
  "store",
];
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const Message = async (mywa, m) => {
  try {
    if (!m) return;
    if (m.isBot) return;
    const prefix = (m.prefix = /^[°•π÷×¶∆£¢€¥®™+✓_=|~!?@#%^&.©^]/gi.test(m.body)
      ? m.body.match(/^[°•π÷×¶∆£¢€¥®™+✓_=|~!?@#%^&.©^]/gi)[0]
      : "");
    const cmd = (m.cmd =
      m.body &&
      m.body.slice(prefix.length).trim().split(/ +/).shift().toLowerCase());
    const command = (m.command =
      commands.get(cmd) ||
      commands.find((v) => v.default?.cmd && v.default.cmd.includes(cmd)));
    const quoted = m?.hasQuotedMsg ? m.quoted : null;

    if (!db.setting.public && !m.isOwner) return;

    // (await import("../lib/database.js")).loadDatabase(m);

    // log chat
    if (m && !m.isBot) {
      console.log(
        chalk.black(chalk.bgWhite("- FROM")),
        chalk.black(chalk.bgGreen(m.pushName)),
        chalk.black(chalk.yellow(m.sender)) +
          "\n" +
          chalk.black(chalk.bgWhite("- IN")),
        chalk.black(
          chalk.bgGreen(m.isGroup ? "Group Chat" : "Private Chat", m.from)
        ) +
          "\n" +
          chalk.black(chalk.bgWhite("- MESSAGE")),
        chalk.black(chalk.bgGreen(m.body || m.type))
      );
      m.exp = Math.ceil(Math.random() * 15);
    }
    if (!m.isOwner) return 
    if (command && !m.isBot) {
      // for command no prefix
      if (!prefix && command.default.noPrefix) {
        if (command.default.locked && !m.isOwner) {
          return global.set.mess("locked", m);
        }

        if (command.default.isMedia && !quoted.mime) {
          if (
            typeof command.default.isMedia === "object" &&
            command.default.isMedia !== null
          ) {
            if (command.default.isMedia.Sticker && !/webp/i.test(quoted.mime))
              return m.reply("Reply Sticker...");
            if (command.default.isMedia.Image && !/image/i.test(quoted.mime))
              return m.reply("Reply or Send Caption With Image...");
            if (command.default.isMedia.Video && !/video/i.test(quoted.mime))
              return m.reply("Reply or Send Caption With Video...");
            if (
              command.default.isMedia.Audio &&
              !/audio|voice/i.test(quoted.mime)
            )
              return m.reply("Reply Audio...");
            if (command.default.isMedia.Text && !/text/i.test(quoted.mime))
              return m.reply("Reply Media Text...");
            if (command.default.isMedia.Font && !/font/i.test(quoted.mime))
              return m.reply("Reply Media Font...");
            if (
              command.default.isMedia.Application &&
              !/application/i.test(quoted.mime)
            )
              return m.reply("Reply Media Application...");
            if (command.default.isMedia.ViewOnce && !quoted.isViewOnce)
              return m.reply("Reply View Once...");
          } else {
            return global.set.mess("media", m);
          }
        }

        if (command.default.isQuoted && !m.hasQuotedMsg) {
          return global.set.mess("quoted", m);
        }

        if (command.default.isOwner && !m.isOwner) {
          return global.set.mess("owner", m);
        }

        if (command.default.isGroup && !m.isGroup) {
          return global.set.mess("group", m);
        }

        if (command.default.isPrivate && m.isGroup) {
          return global.set.mess("private", m);
        }

        if (command.default.isBotAdmin && !m.isBotAdmin) {
          return global.set.mess("botAdmin", m);
        }

        if (command.default.isAdmin && !m.isAdmin) {
          return global.set.mess("admin", m);
        }

        if (command.default.isBot && m.fromMe) {
          return global.set.mess("bot", m);
        }

        if (command.default.isPremium && !m.isPremium) {
          return global.set.mess("premium", m);
        }

        if (command.default.isVIP && !m.isVIP) {
          return global.set.mess("vip", m);
        }

        if (command.default.example && !m.text) {
          return m.reply(
            command.default.example
              .replace(/%prefix/gi, prefix)
              .replace(/%command/gi, command.default.name)
              .replace(/%text/gi, m.text)
          );
        }

        command.default
          .run({
            mywa,
            m,
            command: cmd,
            quoted,
            prefix,
            commands,
          })
          ?.then((a) => a)
          ?.catch((err) => {
            //global.db.users[m.sender].limit += 1
            let text = format(err);
            m.reply(
              `*Error Command*\n\n*- Name :* ${
                command.default.name
              }\n*- Sender :* ${m.sender.split`@`[0]} (@${
                m.sender.split`@`[0]
              })\n*- Time :* ${moment(m.timestamp * 1000).tz(
                "Asia/Jakarta"
              )}\n*- Log :*\n\n${text}`,
              { mentions: [m.sender] }
            );
          });
      }

      // for command with prefix
      if (!!prefix && m.body.startsWith(prefix)) {
        if (command.default.locked && !m.isOwner) {
          return global.set.mess("locked", m);
        }

        if (command.default.isMedia && !quoted.mime) {
          if (
            typeof command.default.isMedia === "object" &&
            command.default.isMedia !== null
          ) {
            if (command.default.isMedia.Sticker && !/webp/i.test(quoted.mime))
              return m.reply("Reply Sticker...");
            if (command.default.isMedia.Image && !/image/i.test(quoted.mime))
              return m.reply("Reply or Send Caption With Image...");
            if (command.default.isMedia.Video && !/video/i.test(quoted.mime))
              return m.reply("Reply or Send Caption With Video...");
            if (
              command.default.isMedia.Audio &&
              !/audio|voice/i.test(quoted.mime)
            )
              return m.reply("Reply Audio...");
            if (command.default.isMedia.Text && !/text/i.test(quoted.mime))
              return m.reply("Reply Media Text...");
            if (command.default.isMedia.Font && !/font/i.test(quoted.mime))
              return m.reply("Reply Media Font...");
            if (
              command.default.isMedia.Application &&
              !/application/i.test(quoted.mime)
            )
              return m.reply("Reply Media Application...");
            if (command.default.isMedia.ViewOnce && !quoted.isViewOnce)
              return m.reply("Reply View Once...");
          } else {
            return global.set.mess("media", m);
          }
        }

        if (command.default.isQuoted && !m.hasQuotedMsg) {
          return global.set.mess("quoted", m);
        }

        if (command.default.isOwner && !m.isOwner) {
          return global.set.mess("owner", m);
        }

        if (command.default.isGroup && !m.isGroup) {
          return global.set.mess("group", m);
        }

        if (command.default.isPrivate && m.isGroup) {
          return global.set.mess("private", m);
        }

        if (command.default.isBotAdmin && !m.isBotAdmin) {
          return global.set.mess("botAdmin", m);
        }

        if (command.default.isAdmin && !m.isAdmin) {
          return global.set.mess("admin", m);
        }

        if (command.default.isBot && m.fromMe) {
          return global.set.mess("bot", m);
        }

        if (command.default.isPremium && !m.isPremium) {
          return global.set.mess("premium", m);
        }

        if (command.default.isVIP && !m.isVIP) {
          return global.set.mess("vip", m);
        }

        if (command.default.example && !m.text) {
          return m.reply(
            command.default.example
              .replace(/%prefix/gi, prefix)
              .replace(/%command/gi, command.default.name)
              .replace(/%text/gi, m.text)
          );
        }

        command.default
          .run({
            mywa,
            m,
            command: cmd,
            quoted,
            prefix,
            commands,
          })
          ?.then((a) => a)
          ?.catch((err) => {
            //global.db.users[m.sender].limit += 1
            let text = format(err);
            m.reply(
              `*Error Command*\n\n*- Name :* ${
                command.default.name
              }\n*- Sender :* ${m.sender.split`@`[0]} (@${
                m.sender.split`@`[0]
              })\n*- Time :* ${moment(m.timestamp * 1000).tz(
                "Asia/Jakarta"
              )}\n*- Log :*\n\n${text}`,
              { mentions: [m.sender] }
            );
          });
      }
    }

    if (!command && !m.isBot) {
      const dir = "cmd/response";
      const files = fs.readdirSync(dir).filter((file) => file.endsWith(".js"));
      if (files.length === 0) return;
      for (const file of files) {
        const load = await import(`../../${dir}/${file}?update=${Date.now()}`);
        load.default({
          mywa,
          m,
          quoted,
          prefix,
          commands,
          command: cmd,
        });
      }
    }
  } catch (e) {
    console.error(e);
  }
};

export const readCommands = async (pathname = global.set.opt.pathCommand) => {
  try {
    const dir = "cmd";
    const dirs = fs.readdirSync(dir);
    dirs
      .filter((a) => a !== "response")
      .map(async (res) => {
        let files = fs
          .readdirSync(`${dir}/${res}`)
          .filter((file) => file.endsWith(".js"));
        for (const file of files) {
          const command = await import(
            `../../${pathname}/${res}/${file}?update=${Date.now()}`
          );
          if (!command.default?.tags) return;
          commands.set(command.default.name, command);
        }
      });
  } catch (e) {
    console.error(e);
  }
};