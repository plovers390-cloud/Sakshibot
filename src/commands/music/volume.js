const embed = require("../../utils/embed");

module.exports = {
  name: "volume",
  aliases: ["vol", "v"],
  async execute(client, message, args) {
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

    // ✅ Check if volume argument provided
    if (!args[0]) {
      const currentVolume = Math.round((player.filters?.volume || 1) * 100);
      const embedData = embed("<:speakS:1476180874314907743> Current Volume", `Volume: **${currentVolume}%**\nUsage: \`!volume <1-200>\``, client);
      return message.reply({
        components: embedData.components,
        flags: embedData.flags
      });
    }

    // ✅ Validate volume
    const vol = Number(args[0]);
    if (!vol || vol < 1 || vol > 200) {
      const embedData = embed("<:close:1476181740207738930> Error", "Volume 1-200 ke beech hona chahiye", client);
      return message.reply({
        components: embedData.components,
        flags: embedData.flags
      });
    }

    // ✅ Set volume (Shoukaku uses 0.0 to 5.0, where 1.0 = 100%)
    try {
      await player.setGlobalVolume(vol);
      
      const embedData = embed("<:speakS:1476180874314907743> Volume Set", `Volume set to **${vol}%**`, client);
      message.reply({
        components: embedData.components,
        flags: embedData.flags
      });
    } catch (error) {
      console.error("❌ Volume error:", error);
      const embedData = embed("<:close:1476181740207738930> Error", "Volume set karne mein error aaya", client);
      message.reply({
        components: embedData.components,
        flags: embedData.flags
      });
    }
  }
};
