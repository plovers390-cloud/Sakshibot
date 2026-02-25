const MusicClient = require("./client/MusicClient");
const { token } = require("./config/config");
const loadCommands = require("./handlers/commandHandler");
const loadEvents = require("./handlers/eventHandler");
const express = require("express");

// Express server for Render hosting
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.json({
    status: "Online",
    bot: "Sakshi Music Bot",
    uptime: Math.floor(process.uptime()),
    ping: client.ws.ping
  });
});

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

app.listen(PORT, () => {
  console.log(`🌐 Express server running on port ${PORT}`);
});

// Bot setup
const client = new MusicClient();

loadCommands(client);
loadEvents(client);

// 🔥 VERY IMPORTANT FOR SHOUKAKU
client.on("raw", (packet) => {
  client.shoukaku.emit("raw", packet);
});

client.login(token);
