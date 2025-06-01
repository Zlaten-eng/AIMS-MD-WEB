const { makeid } = require('./gen-id');
const express = require('express');
const fs = require('fs');
let router = express.Router();
const pino = require("pino");
const {
  default: makeWASocket,
  useMultiFileAuthState,
  delay,
  Browsers,
  makeCacheableSignalKeyStore,
  getAggregateVotesInPollMessage,
  DisconnectReason,
  WA_DEFAULT_EPHEMERAL,
  jidNormalizedUser,
  proto,
  getDevice,
  generateWAMessageFromContent,
  fetchLatestBaileysVersion,
  makeInMemoryStore,
  getContentType,
  generateForwardMessageContent,
  downloadContentFromMessage,
  jidDecode
} = require('@whiskeysockets/baileys');

const { upload } = require('./mega');

function removeFile(FilePath) {
  if (!fs.existsSync(FilePath)) return false;
  fs.rmSync(FilePath, { recursive: true, force: true });
}

router.get('/', async (req, res) => {
  const id = makeid();
  let num = req.query.number;

  async function SIGMA_MD_PAIR_CODE() {
    const { state, saveCreds } = await useMultiFileAuthState('./temp/' + id);

    try {
      var items = ["Safari"];
      function selectRandomItem(array) {
        var randomIndex = Math.floor(Math.random() * array.length);
        return array[randomIndex];
      }
      var randomItem = selectRandomItem(items);

      let sock = makeWASocket({
        auth: {
          creds: state.creds,
          keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
        },
        printQRInTerminal: false,
        generateHighQualityLinkPreview: true,
        logger: pino({ level: "fatal" }).child({ level: "fatal" }),
        syncFullHistory: false,
        browser: Browsers.macOS(randomItem)
      });

      if (!sock.authState.creds.registered) {
        await delay(1500);
        num = num.replace(/[^0-9]/g, '');
        const code = await sock.requestPairingCode(num);
        if (!res.headersSent) {
          await res.send({ code });
        }
      }

      sock.ev.on('creds.update', saveCreds);
      sock.ev.on("connection.update", async (s) => {
        const { connection, lastDisconnect } = s;

        if (connection == "open") {
          await delay(5000);
          let data = fs.readFileSync(__dirname + `/temp/${id}/creds.json`);
          let rf = __dirname + `/temp/${id}/creds.json`;

          function generateRandomText() {
            const prefix = "3EB";
            const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            let randomText = prefix;
            for (let i = prefix.length; i < 22; i++) {
              const randomIndex = Math.floor(Math.random() * characters.length);
              randomText += characters.charAt(randomIndex);
            }
            return randomText;
          }

          const randomText = generateRandomText();

          try {
            const mega_url = await upload(fs.createReadStream(rf), `${sock.user.id}.json`);
            const string_session = mega_url.replace('https://mega.nz/file/', '');
            let md = "SIGMA-MD~" + string_session;

            let code = await sock.sendMessage(sock.user.id, { text: md });

            let desc = `*Yooh radarada mkuu ! * 

> Do not share your session id with anyone.

 *Thanks for using SIGMA-MD* 

> Join WhatsApp Channel :- ⤵️

https://whatsapp.com/channel/0029VbAVuiVBPzjdU7EVNw0t

Don't forget to fork the repo ⬇️

https://github.com/YAMAL-YENG/SIGMA-MD

> *© Powered by SIGMATECH*
`;
            await sock.sendMessage(sock.user.id, {
              text: desc,
              contextInfo: {
                externalAdReply: {
                  title: "𝚂𝙸𝙶𝙼𝙰-𝙼𝙳",
                  thumbnailUrl: "",
                  sourceUrl: "https://whatsapp.com/channel/0029VbAVuiVBPzjdU7EVNw0t",
                  mediaType: 1,
                  renderLargerThumbnail: true
                }
              }
            }, { quoted: code });

          } catch (e) {
            let ddd = sock.sendMessage(sock.user.id, { text: e });
            let desc = `*Don't Share with anyone this code use for deploying SIGMA-MD*\n\n ◦ *Github:* https://github.com/YAMAL-YENG/SIGMA-MD`;

            await sock.sendMessage(sock.user.id, {
              text: desc,
              contextInfo: {
                externalAdReply: {
                  title: "SIGMA-MD",
                  thumbnailUrl: "https://files.catbox.moe/mg79db.jpg",
                  sourceUrl: "https://whatsapp.com/channel/0029VbAVuiVBPzjdU7EVNw0t",
                  mediaType: 2,
                  renderLargerThumbnail: true,
                  showAdAttribution: true
                }
              }
            }, { quoted: ddd });
          }

          await delay(10);
          await sock.ws.close();
          await removeFile('./temp/' + id);
          console.log(`👤 ${sock.user.id} connected ✅ Restarting process...`);
          await delay(10);
          process.exit();

        } else if (connection === "close" && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode != 401) {
          await delay(10);
          SIGMA_MD_PAIR_CODE();
        }
      });

    } catch (err) {
      console.log("Service restarted due to error.");
      await removeFile('./temp/' + id);
      if (!res.headersSent) {
        await res.send({ code: "❗ Service Unavailable" });
      }
    }
  }

  return await SIGMA_MD_PAIR_CODE();
});

/*
// Optional auto restart every 30min
setInterval(() => {
  console.log("♻️ Restarting process...");
  process.exit();
}, 1800000); // 30 min
*/

module.exports = router;
