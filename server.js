
const express = require('express');
const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, makeInMemoryStore } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const pino = require('pino');

const app = express();
const PORT = process.env.PORT || 3000;

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('./auth_info');
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    printQRInTerminal: true,
    auth: state,
    logger: pino({ level: 'silent' })
  });

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log('\nScan this QR Code in WhatsApp:');
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect.error = Boom)?.output?.statusCode !== 401;
      console.log('Connection closed. Reconnecting...', shouldReconnect);
      if (shouldReconnect) startBot();
    } else if (connection === 'open') {
      console.log('✅ Successfully connected to WhatsApp!');
    }
  });

  sock.ev.on('creds.update', saveCreds);
}

// Express endpoint
app.get('/', (req, res) => {
  res.send('<h2>CKLAMZY XMD Bot is running. Check your terminal to scan the QR code!</h2>');
});

// Start server and bot

app.get("/healthz", (req, res) => res.sendStatus(200));
app.listen(PORT, () => {
  console.log(`🌐 Portal running at http://localhost:${PORT}`);
  startBot();
});
