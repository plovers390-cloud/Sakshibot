const embed = require("../../utils/embed");
const nowPlaying = require("../../utils/nowPlaying");
const { showQueueEmbed } = require("./queue");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "play",
  aliases: ["p"],
  async execute(client, message, args) {

    // 1️⃣ Voice channel check
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
      const embedData = embed("<:close:1476181740207738930> Error", "Pehle voice channel join karo", client);
      return message.reply({
        components: embedData.components,
        flags: embedData.flags
      });
    }

    // 2️⃣ Query check
    const query = args.join(" ");
    if (!query) {
      const embedData = embed("<:close:1476181740207738930> Error", "Song name ya URL do", client);
      return message.reply({
        components: embedData.components,
        flags: embedData.flags
      });
    }

    // 3️⃣ Lavalink node
    const node = client.shoukaku.nodes.get("main");
    if (!node) {
      const embedData = embed("<:close:1476181740207738930> Error", "Lavalink node ready nahi hai", client);
      return message.reply({
        components: embedData.components,
        flags: embedData.flags
      });
    }

    try {
      // 4️⃣ Send "Searching..." embed
      const searchingEmbed = new EmbedBuilder()
        .setColor(0x880808)
        .setDescription('<:searchS:1476180998034296913> **Searching a song...**')

      const searchingMsg = await message.channel.send({
        embeds: [searchingEmbed]
      });

      // 5️⃣ Resolve track
      const isUrl = query.startsWith("http");
      const searchQuery = isUrl ? query : `ytsearch:${query}`;
      const result = await node.rest.resolve(searchQuery);

      // ✅ Delete searching message
      try { await searchingMsg.delete(); } catch { }

      const tracks =
        result.loadType === "track" ? [result.data] :
          result.loadType === "search" ? result.data :
            result.loadType === "playlist" ? result.data.tracks : null;

      if (!tracks || !tracks.length) {
        const embedData = embed("<:close:1476181740207738930> Error", "Koi song nahi mila", client);
        return message.reply({
          components: embedData.components,
          flags: embedData.flags
        });
      }

      const track = tracks[0];

      // 5️⃣ Player check
      let player = client.shoukaku.players.get(message.guild.id);
      // Check if player is actively playing (not idle)
      const queue = client.playerManager.getQueue(message.guild.id);
      const isPlaying = player && client.playerManager.getCurrentTrack(message.guild.id);

      // 6️⃣ Create player
      if (!player) {
        player = await client.shoukaku.joinVoiceChannel({
          guildId: message.guild.id,
          channelId: voiceChannel.id,
          shardId: 0,
          deaf: true
        });

        client.setupPlayerEvents(player, message.channel);
      }

      // 7️⃣ Queue or Play
      if (isPlaying) {
        client.playerManager.addTrack(message.guild.id, track);
        const position = client.playerManager.getQueueLength(message.guild.id);
        showQueueEmbed(message.channel, track, position, client);
      } else {
        // ⏱️ Cancel inactivity timer since user is playing a new song
        client.clearInactivityTimer(message.guild.id);

        // Play the track
        await player.playTrack({
          track: { encoded: track.encoded }
        });

        // Save as current track for loop
        client.playerManager.setCurrentTrack(message.guild.id, track);

        // 🎵 Set VC status to song name
        try {
          await client.rest.put(`/channels/${voiceChannel.id}/voice-status`, {
            body: { status: `🎵 ${track.info.title}` }
          });
        } catch (err) {
          console.error("Failed to set VC status:", err.message);
        }

        // ✅ Now Playing UI
        const ui = nowPlaying(
          client,
          {
            title: track.info.title,
            author: track.info.author,
            durationMs: track.info.length,
            thumbnail:
              track.info.artworkUrl ||
              `https://img.youtube.com/vi/${track.info.identifier}/hqdefault.jpg`,
            isStream: track.info.isStream,
            url: track.info.uri,
            identifier: track.info.identifier
          },
          message.author
        );

        // Send with components and flags
        const nowPlayingMsg = await message.channel.send({
          components: ui.components,
          flags: ui.flags
        });

        // ✅ Save reference
        if (!client.nowPlayingMessages) {
          client.nowPlayingMessages = new Map();
        }
        client.nowPlayingMessages.set(message.guild.id, nowPlayingMsg);
      }

    } catch (error) {
      console.error("<:close:1476181740207738930> Play command error:", error);
      const embedData = embed("<:close:1476181740207738930> Error", `Kuch galat ho gaya: ${error.message}`, client);
      return message.reply({
        components: embedData.components,
        flags: embedData.flags
      });
    }
  }
};
