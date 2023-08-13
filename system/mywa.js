/*
/*************************
* Pake tinggal make
* jangan hapus sumbernya
**************************
* Github: amiruldev20
* Wa: 085157489446
*/

//-- import config
import "../setting.js";
import chokidar from "chokidar";
import * as conf from "../setting.js";

//-- import file
import Function from "./lib/function.js";
import { Client, serialize } from "./lib/serialize.js";
import { Message, readCommands } from "./event/messages.js";
import { Localdb } from "./lib/localdb.js";
import { idb } from "./lib/database.js";
import Collection from "./lib/collection.js";
const port = process.env.PORT || 1337;
const { cconnect } = await import("../server.js")
const { Location, List, Buttons, LinkingMethod } = (await import("mywajs"))

//-- global system
global.commands = new Collection();

async function start() {
  process.on("uncaughtException", console.error);
  process.on("unhandledRejection", console.error);
  readCommands();

  const props = new Localdb(global.database);

  const mywa = new Client({
    linkingMethod: new LinkingMethod({
        phone: {
            number: "6289631008798"
        },
    }),
    playwright: {
       headless: true,
       devtools: false,
       userDataDir: ".mywajs_auth"
    },
    markOnlineAvailable: true,
    authTimeoutMs: 60000
  })
  mywa.initialize();

  global.db = {
    users: [],
    groups: [],
    store: [],
    setting: {},
    command: {},
    ...((await props.fetch()) || {}),
  };
  await props.save(global.db);

  mywa.on('code', (qr) => {
    // NOTE: This event will not be fired if a session is specified.
    console.log('CODE RECEIVED', qr);
  });

  mywa.on("loading_screen", (percent, message) => {});

  mywa.on("auth_failure", console.error);

  mywa.on("ready", (m) => {
    console.info("Client is already on ");
  });

  mywa.on("disconnected", (m) => {
    if (m) start();
  });

  mywa.on("message_create", async (message) => {
    const m = await await serialize(mywa, message);
    await await Message(mywa, m);
    await idb(m);
    //console.log("msg ", m)
  })
  
  let rejectCalls = true;

  mywa.on('call', async (call) => {
    console.log('Call received, rejecting. GOTO Line 261 to disable', call);
    if (rejectCalls) await call.reject();
    await client.sendMessage(call.from, `[${call.fromMe ? 'Outgoing' : 'Incoming'}] Phone call from ${call.from}, type ${call.isGroup ? 'group' : ''} ${call.isVideo ? 'video' : 'audio'} call. ${rejectCalls ? 'This call was automatically rejected by the script.' : ''}`);
  });

  mywa.on('disconnected', (reason) => {
    console.log('Client was logged out', reason);
  })
  mywa.on('group_admin_changed', (notification) => {
    if (notification.type === 'promote') {
        /** 
        * Emitted when a current user is promoted to an admin.
        * {@link notification.author} is a user who performs the action of promoting/demoting the current user.
        */
        console.log(`You were promoted by ${notification.author}`);
    } else if (notification.type === 'demote')
        /** Emitted when a current user is demoted to a regular user. */
        console.log(`You were demoted by ${notification.author}`);
  });

  // rewrite database every 3 seconds
  setInterval(async () => {
    if (global.db) await props.save(global.db);
  }, 3000);

  return mywa;
}

start();

let choki = chokidar.watch(
  [
    conf.path.join(process.cwd(), set.opt.pathCommand),
    conf.path.join(process.cwd(), "system", "event"),
  ],
  {
    //   ignored: /^\.|mywajs.js/,
    persistent: true,
  }
);
choki
  .on("change", async (Path) => {
    console.log(`Changed ${Path}`);
    await Function.reloadDir(Path, global.commands);
  })
  .on("add", async function (Path) {
    await Function.reloadDir(Path, global.commands);
  });
console.log("Loading chat...");
set.reloadFile(import.meta.url);
