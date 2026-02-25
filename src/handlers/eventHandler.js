const fs = require("fs");
const path = require("path");

module.exports = (client) => {
  const eventsPath = path.join(__dirname, "../events");

  fs.readdirSync(eventsPath).forEach(file => {
    const event = require(`${eventsPath}/${file}`);
    client.on(event.name, (...args) => event.execute(client, ...args));
  });

  console.log("✅ Events loaded");
};
