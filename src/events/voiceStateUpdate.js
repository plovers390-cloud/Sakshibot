const mode247 = require("../utils/247");

module.exports = {
  name: "voiceStateUpdate",
  execute(client, oldState, newState) {
    if (mode247.has(oldState.guild.id)) return;

    const player = client.shoukaku.players.get(oldState.guild.id);
    if (!player) return;

    // Check if player has valid connection
    if (!player.connection || !player.connection.channelId) return;

    // Get the voice channel where bot is connected
    const channel = oldState.guild.channels.cache.get(player.connection.channelId);
    
    if (!channel) return;

    // Check if only bot is left in channel
    const members = channel.members.filter(m => !m.user.bot);
    
    if (members.size === 0) {
      // Disconnect and destroy player
      player.connection.disconnect();
      client.shoukaku.players.delete(oldState.guild.id);
    }
  }
};