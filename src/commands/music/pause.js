const embed = require("../../utils/embed");

module.exports = {
  name: "pause",
  async execute(client, message) {
    const player = client.shoukaku.players.get(message.guild.id);
    if (!player) return;

    player.setPaused(true);

    const embedData = embed("<:Tick:1476181795102920867> ⏸ Paused", "Music paused", client);
    message.reply({
      components: embedData.components,
      flags: embedData.flags
    });
  }
};
