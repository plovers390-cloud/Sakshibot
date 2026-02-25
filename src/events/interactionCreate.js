const { InteractionType } = require("discord.js");
const embed = require("../utils/embed");

module.exports = {
  name: "interactionCreate",
  async execute(client, interaction) {
    // Only handle button interactions
    if (interaction.type !== InteractionType.MessageComponent) return;

    const customId = interaction.customId;

    // ===== NOW PLAYING FILTER DROPDOWN =====
    if (customId === "np_filter_select") {
      const selectedValue = interaction.values[0];

      const player = client.shoukaku.players.get(interaction.guild.id);
      if (!player) {
        const embedData = embed("<:close:1476181740207738930> Error", "No active player found", client);
        return interaction.reply({
          components: embedData.components,
          flags: embedData.flags,
          ephemeral: true
        });
      }

      const filters = {
        reset: { label: "Reset", filter: {} },
        bass: {
          label: "Bass Boost",
          filter: {
            equalizer: [
              { band: 0, gain: 0.75 }, { band: 1, gain: 0.65 }, { band: 2, gain: 0.5 },
              { band: 3, gain: 0.35 }, { band: 4, gain: 0.15 }, { band: 5, gain: 0.0 },
              { band: 6, gain: -0.05 }, { band: 7, gain: -0.05 }, { band: 8, gain: 0.0 },
              { band: 9, gain: 0.05 }, { band: 10, gain: 0.1 }, { band: 11, gain: 0.1 },
              { band: 12, gain: 0.05 }, { band: 13, gain: 0.0 }
            ]
          }
        },
        nightcore: {
          label: "Nightcore",
          filter: { timescale: { speed: 1.3, pitch: 1.3, rate: 1 } }
        },
        vaporwave: {
          label: "Vaporwave",
          filter: { timescale: { speed: 0.85, pitch: 0.8, rate: 1 } }
        },
        soft: {
          label: "Soft",
          filter: { lowPass: { smoothing: 20.0 } }
        },
        pop: {
          label: "Pop",
          filter: {
            equalizer: [
              { band: 0, gain: -0.25 }, { band: 1, gain: 0.48 }, { band: 2, gain: 0.59 },
              { band: 3, gain: 0.72 }, { band: 4, gain: 0.56 }, { band: 5, gain: 0.15 },
              { band: 6, gain: -0.24 }, { band: 7, gain: -0.24 }, { band: 8, gain: -0.16 },
              { band: 9, gain: -0.16 }, { band: 10, gain: 0 }, { band: 11, gain: 0 },
              { band: 12, gain: 0 }, { band: 13, gain: 0 }
            ]
          }
        },
        treblebass: {
          label: "Treble Bass",
          filter: {
            equalizer: [
              { band: 0, gain: 0.6 }, { band: 1, gain: 0.67 }, { band: 2, gain: 0.67 },
              { band: 3, gain: 0 }, { band: 4, gain: -0.5 }, { band: 5, gain: 0.15 },
              { band: 6, gain: -0.45 }, { band: 7, gain: 0.23 }, { band: 8, gain: 0.35 },
              { band: 9, gain: 0.45 }, { band: 10, gain: 0.55 }, { band: 11, gain: 0.6 },
              { band: 12, gain: 0.55 }, { band: 13, gain: 0 }
            ]
          }
        },
        eightd: {
          label: "8D",
          filter: { rotation: { rotationHz: 0.2 } }
        },
        karaoke: {
          label: "Karaoke",
          filter: { karaoke: { level: 1.0, monoLevel: 1.0, filterBand: 220.0, filterWidth: 100.0 } }
        },
        dj: {
          label: "DJ",
          filter: {
            equalizer: [
              { band: 0, gain: 0.75 }, { band: 1, gain: 0.6 }, { band: 2, gain: 0.35 },
              { band: 3, gain: 0.1 }, { band: 4, gain: -0.2 }, { band: 5, gain: -0.25 },
              { band: 6, gain: -0.1 }, { band: 7, gain: 0.15 }, { band: 8, gain: 0.35 },
              { band: 9, gain: 0.5 }, { band: 10, gain: 0.55 }, { band: 11, gain: 0.45 },
              { band: 12, gain: 0.35 }, { band: 13, gain: 0.2 }
            ],
            timescale: { speed: 1.02, pitch: 1.0, rate: 1.0 },
            tremolo: { frequency: 0.5, depth: 0.1 }
          }
        }
      };

      const selected = filters[selectedValue];
      if (!selected) return;

      try {
        await player.setFilters(selected.filter);
        const embedData = embed(
          selectedValue === "reset" ? "<:Tick:1476181795102920867> Filters Reset" : "<:Tick:1476181795102920867> Filter Applied",
          selectedValue === "reset" ? "All filters removed!" : `Filter set to: **${selected.label}**`
        );
        return interaction.reply({
          components: embedData.components,
          flags: embedData.flags,
          ephemeral: true
        });
      } catch (error) {
        console.error("❌ Filter error:", error);
        const embedData = embed("<:close:1476181740207738930> Error", "Filter apply karne mein error aaya", client);
        return interaction.reply({
          components: embedData.components,
          flags: embedData.flags,
          ephemeral: true
        });
      }
    }

    // ===== REMOVE TRACK FROM QUEUE =====
    if (customId.startsWith("remove_track_")) {
      const position = parseInt(customId.split("_")[2]);

      const player = client.shoukaku.players.get(interaction.guild.id);
      if (!player) {
        const embedData = embed("<:close:1476181740207738930> Error", "No active player found", client);
        return interaction.reply({
          components: embedData.components,
          flags: embedData.flags,
          ephemeral: true
        });
      }

      const queue = client.playerManager.getQueue(interaction.guild.id);

      if (!queue || queue.length === 0) {
        const embedData = embed("📭 Empty Queue", "No songs to remove", client);
        return interaction.reply({
          components: embedData.components,
          flags: embedData.flags,
          ephemeral: true
        });
      }

      // Remove from queue (position - 1 because queue is 0-indexed)
      const removedTrack = queue.splice(position - 1, 1)[0];

      if (!removedTrack) {
        const embedData = embed("<:close:1476181740207738930> Error", "Track not found at that position", client);
        return interaction.reply({
          components: embedData.components,
          flags: embedData.flags,
          ephemeral: true
        });
      }

      // Update the original message to show it was removed
      const removedEmbed = embed("<:Tick:1476181795102920867> Track Removed", `• **${removedTrack.info.title}**\n• Removed from queue`, client);
      await interaction.message.edit({
        components: removedEmbed.components,
        flags: removedEmbed.flags
      });

      const successEmbed = embed("<:Tick:1476181795102920867> Removed", `Removed **${removedTrack.info.title}** from queue`, client);
      return interaction.reply({
        components: successEmbed.components,
        flags: successEmbed.flags,
        ephemeral: true
      });
    }

    // ===== PLAY NEXT (MOVE TO FRONT OF QUEUE) =====
    if (customId.startsWith("play_next_")) {
      const position = parseInt(customId.split("_")[2]);

      const player = client.shoukaku.players.get(interaction.guild.id);
      if (!player) {
        const embedData = embed("<:close:1476181740207738930> Error", "No active player found", client);
        return interaction.reply({
          components: embedData.components,
          flags: embedData.flags,
          ephemeral: true
        });
      }

      const queue = client.playerManager.getQueue(interaction.guild.id);

      if (!queue || queue.length === 0) {
        const embedData = embed("📭 Empty Queue", "No songs in queue", client);
        return interaction.reply({
          components: embedData.components,
          flags: embedData.flags,
          ephemeral: true
        });
      }

      // Get the track and remove it from current position
      const track = queue.splice(position - 1, 1)[0];

      if (!track) {
        const embedData = embed("<:close:1476181740207738930> Error", "Track not found at that position", client);
        return interaction.reply({
          components: embedData.components,
          flags: embedData.flags,
          ephemeral: true
        });
      }

      // Add it to the front of the queue (position 0)
      queue.unshift(track);

      // Update the original message
      const playNextEmbed = embed("<:Tick:1476181795102920867> Playing Next", `• **${track.info.title}**\n• Moved to position 1 in queue`, client);
      await interaction.message.edit({
        components: playNextEmbed.components,
        flags: playNextEmbed.flags
      });

      const successEmbed = embed("<:Tick:1476181795102920867> Success", `**${track.info.title}** will play next!`, client);
      return interaction.reply({
        components: successEmbed.components,
        flags: successEmbed.flags,
        ephemeral: true
      });
    }

    // ===== MUSIC CONTROL BUTTONS (from your premium player) =====

    // Pause/Resume
    if (customId === "music_pause") {
      const player = client.shoukaku.players.get(interaction.guild.id);
      if (!player) {
        const embedData = embed("<:close:1476181740207738930> Error", "No active player", client);
        return interaction.reply({
          components: embedData.components,
          flags: embedData.flags,
          ephemeral: true
        });
      }

      player.setPaused(!player.paused);
      const embedData = embed(player.paused ? "<:Tick:1476181795102920867> Paused" : "<:Tick:1476181795102920867> Resumed", "Playback state changed", client);
      return interaction.reply({
        components: embedData.components,
        flags: embedData.flags,
        ephemeral: true
      });
    }

    // Rewind -10s
    if (customId === "music_rewind") {
      const player = client.shoukaku.players.get(interaction.guild.id);
      if (!player || !player.track) {
        const embedData = embed("<:close:1476181740207738930> Error", "No active track to seek", client);
        return interaction.reply({
          components: embedData.components,
          flags: embedData.flags,
          ephemeral: true
        });
      }

      const position = player.position || 0;
      let newPosition = position - 10000;
      if (newPosition < 0) newPosition = 0;

      await player.seekTo(newPosition);

      const formatTime = (ms) => {
        const s = Math.floor(ms / 1000);
        const m = Math.floor(s / 60);
        return `${m}:${String(s % 60).padStart(2, "0")}`;
      };

      const embedData = embed("<:Tick:1476181795102920867> Rewind", `**Rewinded 10s. Current time: ${formatTime(newPosition, client)}**`);
      return interaction.reply({
        components: embedData.components,
        flags: embedData.flags,
        ephemeral: true
      });
    }

    // Forward +10s
    if (customId === "music_forward") {
      const player = client.shoukaku.players.get(interaction.guild.id);
      if (!player || !player.track) {
        const embedData = embed("<:close:1476181740207738930> Error", "No active track to seek", client);
        return interaction.reply({
          components: embedData.components,
          flags: embedData.flags,
          ephemeral: true
        });
      }

      const trackLength = player.track.info?.length || 0;
      const position = player.position || 0;
      let newPosition = position + 10000;

      if (trackLength > 0 && newPosition >= trackLength) {
        // Fast-forwarding past the end skips the track or just goes to the end
        newPosition = trackLength - 1000;
      }

      await player.seekTo(newPosition);

      const formatTime = (ms) => {
        const s = Math.floor(ms / 1000);
        const m = Math.floor(s / 60);
        return `${m}:${String(s % 60).padStart(2, "0")}`;
      };

      const embedData = embed("<:Tick:1476181795102920867> Forward", `**Fast-forwarded 10s. Current time: ${formatTime(newPosition, client)}**`);
      return interaction.reply({
        components: embedData.components,
        flags: embedData.flags,
        ephemeral: true
      });
    }

    // Skip
    if (customId === "music_skip") {
      const player = client.shoukaku.players.get(interaction.guild.id);
      if (!player) {
        const embedData = embed("<:close:1476181740207738930> Error", "No active player", client);
        return interaction.reply({
          components: embedData.components,
          flags: embedData.flags,
          ephemeral: true
        });
      }

      player.stopTrack();
      const embedData = embed("<:Tick:1476181795102920867> Skipped", "**Playing next song**", client);
      return interaction.reply({
        components: embedData.components,
        flags: embedData.flags,
        ephemeral: true
      });
    }

    // Stop
    if (customId === "music_stop") {
      const player = client.shoukaku.players.get(interaction.guild.id);
      if (!player) {
        const embedData = embed("<:close:1476181740207738930> Error", "No active player", client);
        return interaction.reply({
          components: embedData.components,
          flags: embedData.flags,
          ephemeral: true
        });
      }

      client.playerManager.clearQueue(interaction.guild.id);
      player.stopTrack();

      const embedData = embed("<:Tick:1476181795102920867> Stopped", "**Queue cleared and playback stopped**", client);
      return interaction.reply({
        components: embedData.components,
        flags: embedData.flags,
        ephemeral: true
      });
    }

    // Loop
    if (customId === "music_loop") {
      const currentLoop = client.playerManager.getLoopMode?.(interaction.guild.id) || "off";
      const nextLoop = currentLoop === "off" ? "track" : currentLoop === "track" ? "queue" : "off";

      if (client.playerManager.setLoopMode) {
        client.playerManager.setLoopMode(interaction.guild.id, nextLoop);
      }

      const loopEmojis = { off: "🔁", track: "🔂", queue: "🔁" };
      const embedData = embed(`${loopEmojis[nextLoop]} Loop: ${nextLoop}`, `**Loop mode set to ${nextLoop}**`, client);
      return interaction.reply({
        components: embedData.components,
        flags: embedData.flags,
        ephemeral: true
      });
    }

    // Shuffle
    if (customId === "music_shuffle") {
      const queue = client.playerManager.getQueue(interaction.guild.id);

      if (!queue || queue.length < 2) {
        const embedData = embed("<:close:1476181740207738930> Error", "Need at least 2 songs to shuffle", client);
        return interaction.reply({
          components: embedData.components,
          flags: embedData.flags,
          ephemeral: true
        });
      }

      // Shuffle the queue
      for (let i = queue.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [queue[i], queue[j]] = [queue[j], queue[i]];
      }

      const embedData = embed("🔀 Shuffled", `Shuffled ${queue.length} songs`, client);
      return interaction.reply({
        components: embedData.components,
        flags: embedData.flags,
        ephemeral: true
      });
    }

    // Queue View - ✅ FIXED VERSION
    if (customId === "music_queue") {
      const player = client.shoukaku.players.get(interaction.guild.id);
      const queue = client.playerManager.getQueue(interaction.guild.id);

      if (!player || !player.track) {
        const embedData = embed("💌 Queue Empty", "No songs playing", client);
        return interaction.reply({
          components: embedData.components,
          flags: embedData.flags,
          ephemeral: true
        });
      }

      // ✅ Get current track info from player.track
      const currentTrack = player.track;
      let description = `**Now Playing:**\n• ${currentTrack.info?.title || "Unknown Track"}\n`;

      if (queue && queue.length > 0) {
        const tracks = queue
          .slice(0, 10)
          .map((t, i) => `**${i + 1}.** ${t.info.title}`)
          .join("\n");
        description += `\n**Up Next (${queue.length} songs):**\n${tracks}`;
      } else {
        description += `\n**Up Next:** Queue is empty`;
      }

      const embedData = embed("🎶 Music Queue", description, client);
      return interaction.reply({
        components: embedData.components,
        flags: embedData.flags,
        ephemeral: true
      });
    }

    // Add more button handlers as needed...
  }
};
