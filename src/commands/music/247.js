const embed = require("../../utils/embed");
const mode247 = require("../../utils/247");

module.exports = {
  name: "247",
  aliases: ["stay", "alwayson"],
  async execute(client, message, args) {
    const guildId = message.guild.id;
    const isEnabled = mode247.has(guildId);

    if (isEnabled) {
      mode247.disable(guildId);
      const embedData = embed("<:Tick:1476181795102920867> 24/7 Mode Disabled", "Bot will now disconnect when the queue is empty or if it's left alone.", client);
      return message.reply({
        components: embedData.components,
        flags: embedData.flags
      });
    } else {
      mode247.enable(guildId);
      const embedData = embed("<:Tick:1476181795102920867> 24/7 Mode Enabled", "Bot will now stay in the voice channel even after the queue is empty.", client);
      return message.reply({
        components: embedData.components,
        flags: embedData.flags
      });
    }
  },
};
