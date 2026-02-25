const config = require("../config/config");

module.exports = {
  name: "messageCreate",
  async execute(client, message) {
    // Ignore bots
    if (message.author.bot) return;

    // Check prefix
    if (!message.content.startsWith(config.prefix)) return;

    // Parse command and args
    const args = message.content.slice(config.prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    console.log(`📨 Command: ${commandName}, Args:`, args);

    // Get command
    const command = client.commands.get(commandName) || 
                    client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) return;

    try {
      await command.execute(client, message, args);
    } catch (error) {
      console.error(`❌ Error executing ${commandName}:`, error);
      message.reply("<:close:1476181740207738930> Command execute karte waqt error aaya!");
    }
  }
};