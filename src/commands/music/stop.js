const embed = require("../../utils/embed");

module.exports = {
  name: "stop",
  async execute(client, message) {
    // ✅ Check voice channel
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
      const embedData = embed("<:close:1476181740207738930> Error", "Pehle voice channel join karo", client);
      return message.reply({
        components: embedData.components,
        flags: embedData.flags
      });
    }

    // ✅ Get player from Shoukaku
    const player = client.shoukaku.players.get(message.guild.id);

    if (!player) {
      const embedData = embed("<:close:1476181740207738930> Error", "Koi song nahi chal raha", client);
      return message.reply({
        components: embedData.components,
        flags: embedData.flags
      });
    }

    // ✅ Delete old Now Playing message
    if (client.nowPlayingMessages && client.nowPlayingMessages.has(message.guild.id)) {
      const oldMsg = client.nowPlayingMessages.get(message.guild.id);
      try {
        await oldMsg.delete();
        console.log("🗑️ Deleted old now playing message (stop)");
      } catch (err) {
        console.error("Failed to delete old now playing message:", err);
      }
      client.nowPlayingMessages.delete(message.guild.id);
    }

    // ⏱️ Clear inactivity timer
    client.clearInactivityTimer(message.guild.id);

    // ✅ Clear queue and stop player
    client.playerManager.clearQueue(message.guild.id);
    player.stopTrack();

    // 🎵 Clear VC status
    try {
      await client.rest.put(`/channels/${voiceChannel.id}/voice-status`, {
        body: { status: "" }
      });
    } catch (err) {
      console.error("Failed to clear VC status:", err.message);
    }

    // ✅ Disconnect from voice channel
    try {
      if (player.connection) {
        player.connection.disconnect();
      }
      client.shoukaku.leaveVoiceChannel(message.guild.id);
    } catch (err) {
      console.error(" Error disconnecting:", err);
    }

    // ✅ Cleanup
    client.shoukaku.players.delete(message.guild.id);

    // ✅ Send success message in Components V2
    const embedData = embed("<:Tick:1476181795102920867> Stopped", "Music stopped and queue cleared", client);
    message.reply({
      components: embedData.components,
      flags: embedData.flags
    });
  }
};
