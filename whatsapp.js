
const axios = require("axios");
require("dotenv").config();
const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");

async function startCKLAMZYBot() {
  const { state, saveCreds } = await useMultiFileAuthState("auth");

  const sock = makeWASocket({
    auth: state,
    usePairingCode: true,
    browser: ['CKLAMZY_XMD', 'Safari', '1.0.0'],
  });

  
  // pairing code ONLY when not registered
  if (!sock.authState.creds.registered) {
    const number = "255765457691";
    const code = await sock.requestPairingCode(number);
    console.log(`🔗 Pairing code: ${code}`);
    console.log("📲 Link using: https://wa.me/linkdevice");
  }

sock.ev.on("creds.update", saveCreds);

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const text = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
    if (text.startsWith("₩ping")) {
      await sock.sendMessage(msg.key.remoteJid, { text: "pong ✅ CKLAMZY XMD is online!" });

    } else if (text.startsWith("₩yt ")) {
      const query = text.slice(4).trim();
      if (!query) {
        await sock.sendMessage(msg.key.remoteJid, { text: "❗ Provide a YouTube search query." });
        return;
      }

      try {
        const res = await axios.get("https://www.googleapis.com/youtube/v3/search", {
          params: {
            q: query,
            key: process.env.GOOGLE_API_KEY,
            part: "snippet",
            type: "video",
            maxResults: 1,
          },
        });

        const video = res.data.items[0];
        const title = video.snippet.title;
        const url = `https://www.youtube.com/watch?v=${video.id.videoId}`;

        await sock.sendMessage(msg.key.remoteJid, { text: `🎬 *${title}*\n🔗 ${url}` });
      } catch (err) {
        console.error(err);
        await sock.sendMessage(msg.key.remoteJid, { text: "❌ Failed to fetch YouTube video." });
      }

    } else if (text.startsWith("₩news")) {
      try {
        const res = await axios.get("https://newsapi.org/v2/top-headlines", {
          params: {
            country: "us",
            apiKey: process.env.NEWS_API_KEY,
            pageSize: 5
          }
        });

        const articles = res.data.articles;
        if (articles.length === 0) {
          await sock.sendMessage(msg.key.remoteJid, { text: "📰 No news found." });
        } else {
          let newsMsg = "*🗞️ Top News Headlines:*

";
          for (let i = 0; i < articles.length; i++) {
            const article = articles[i];
            newsMsg += `• *${article.title}*
🔗 ${article.url}

`;
          }
          await sock.sendMessage(msg.key.remoteJid, { text: newsMsg });
        }
      } catch (err) {
        console.error(err);
        await sock.sendMessage(msg.key.remoteJid, { text: "❌ Failed to fetch news." });
      }

    } else if (text.startsWith("₩news ")) {
      const country = text.slice(6).trim().toLowerCase();
      try {
        const res = await axios.get("https://newsapi.org/v2/top-headlines", {
          params: {
            country: country || "tz",
            apiKey: process.env.NEWS_API_KEY,
            pageSize: 5
          }
        });

        const articles = res.data.articles;
        if (articles.length === 0) {
          await sock.sendMessage(msg.key.remoteJid, { text: "📰 No news found for country: " + country });
        } else {
          let newsMsg = `*🗞️ Top News from ${country.toUpperCase()}:*

`;
          for (let i = 0; i < articles.length; i++) {
            const article = articles[i];
            newsMsg += `• *${article.title}*
🔗 ${article.url}

`;
          }
          await sock.sendMessage(msg.key.remoteJid, { text: newsMsg });
        }
      } catch (err) {
        console.error(err);
        await sock.sendMessage(msg.key.remoteJid, { text: "❌ Failed to fetch custom news." });
      }
    } else if (text.startsWith("₩football")) {
      try {
        const res = await axios.get("https://newsapi.org/v2/everything", {
          params: {
            q: "football",
            sortBy: "publishedAt",
            apiKey: process.env.NEWS_API_KEY,
            pageSize: 5
          }
        });

        const articles = res.data.articles;
        if (articles.length === 0) {
          await sock.sendMessage(msg.key.remoteJid, { text: "⚽ No football news found." });
        } else {
          let newsMsg = "*⚽ Latest Football News:*

";
          for (let i = 0; i < articles.length; i++) {
            const article = articles[i];
            newsMsg += `• *${article.title}*
🔗 ${article.url}

`;
          }
          await sock.sendMessage(msg.key.remoteJid, { text: newsMsg });
        }
      } catch (err) {
        console.error(err);
        await sock.sendMessage(msg.key.remoteJid, { text: "❌ Failed to fetch football news." });
      }

    } else if (text.startsWith("₩league ")) {
      const league = text.slice(8).trim();
      if (!league) {
        await sock.sendMessage(msg.key.remoteJid, { text: "❗ Please specify a league name. Example: ₩league premier league" });
        return;
      }

      try {
        const res = await axios.get("https://newsapi.org/v2/everything", {
          params: {
            q: league + " football",
            sortBy: "publishedAt",
            apiKey: process.env.NEWS_API_KEY,
            pageSize: 5
          }
        });

        const articles = res.data.articles;
        if (articles.length === 0) {
          await sock.sendMessage(msg.key.remoteJid, { text: "⚽ No news found for league: " + league });
        } else {
          let newsMsg = `*🏆 Latest News for ${league.toUpperCase()}:*

`;
          for (let i = 0; i < articles.length; i++) {
            const article = articles[i];
            newsMsg += `• *${article.title}*
🔗 ${article.url}

`;
          }
          await sock.sendMessage(msg.key.remoteJid, { text: newsMsg });
        }
      } catch (err) {
        console.error(err);
        await sock.sendMessage(msg.key.remoteJid, { text: "❌ Failed to fetch league news." });
      }
                    } else if (text.startsWith("₩menu")) {
      await sock.sendMessage(msg.key.remoteJid, { text: "✨ CKLAMZY XMD MENU ✨\n\n₩general\n₩tools\n₩ai\n₩group\n₩reaction\n₩GODisfirst\n₩botinfo\n₩download\n₩search\n₩games" });
    }
  });
}

startCKLAMZYBot();
