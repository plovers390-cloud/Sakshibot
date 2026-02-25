const embed = require("../../utils/embed");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "skip",
  aliases: ["s"],
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

    // ✅ Get player from Shoukaku (not manager)
    const player = client.shoukaku.players.get(message.guild.id);

    if (!player || !player.track) {
      const embedData = embed("<:close:1476181740207738930> Error", "Koi song nahi chal raha", client);
      return message.reply({
        components: embedData.components,
        flags: embedData.flags
      });
    }

    // ✅ Get current track info before skipping
    const skippedTrack = player.track;
    const trackTitle = skippedTrack?.info?.title || 'Unknown';
    const trackAuthor = skippedTrack?.info?.author || 'Unknown Artist';
    const trackThumbnail = skippedTrack?.info?.artworkUrl ||
      `https://img.youtube.com/vi/${skippedTrack?.info?.identifier}/hqdefault.jpg`;

    // ✅ Delete old Now Playing message
    if (client.nowPlayingMessages && client.nowPlayingMessages.has(message.guild.id)) {
      const oldMsg = client.nowPlayingMessages.get(message.guild.id);
      try {
        await oldMsg.delete();
        console.log("Deleted old now playing message (skip)");
      } catch (err) {
        console.error("Failed to delete old now playing message:", err);
      }
      client.nowPlayingMessages.delete(message.guild.id);
    }

    // ✅ Stop track (this will trigger 'end' event which plays next song)
    player.stopTrack();

    // ✅ Send rich skip embed with thumbnail
    const skipEmbed = new EmbedBuilder()
      .setColor(0xED4245)
      .setAuthor({ name: 'Song Skipped' })
      .setDescription(`**${trackTitle}**\nby ${trackAuthor}`)
      .setThumbnail(trackThumbnail)
      .setFooter({
        text: `Skipped by ${message.author.username}`,
        iconURL: message.author.displayAvatarURL({ size: 32 })
      })
      .setTimestamp();

    message.reply({ embeds: [skipEmbed] });
  }
};
