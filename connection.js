const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason
} = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth');

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    browser: ['SAVAGE_XMD', 'Safari', '1.0.0'],
    generateHighQualityLinkPreview: true,
    markOnlineOnConnect: true,
  });

  sock.ev.on('creds.update', saveCreds);
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect.error = new Boom(lastDisconnect?.error))?.output?.statusCode !== DisconnectReason.loggedOut;
      if (shouldReconnect) startBot();
    } else if (connection === 'open') {
      console.log('✅ SAVAGE_XMD Connected');
    }

    if (!sock.authState.creds.registered) {
      const number = '255765457691';
      const code = await sock.requestPairingCode(number);
      console.log(`🔑 Pairing Code for ${number}: ${code}`);
    }
  });

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;
    const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
    const sender = msg.key.remoteJid;

    if (text.startsWith('$ping')) {
      await sock.sendMessage(sender, { text: 'pong ✅' });
    } else if (text.startsWith('$menu')) {
      await sock.sendMessage(sender, {
        text: `*SAVAGE_XMD Menu:*
$ping
$menu
$about`
      });
    } else if (text.startsWith('$about')) {
      await sock.sendMessage(sender, {
        text: `🤖 *SAVAGE_XMD Bot*
Creator: CKLAMZY-AI
Mode: Pairing Code
Version: 1.0.0`
      });
    }
  });
}

module.exports = { startBot };