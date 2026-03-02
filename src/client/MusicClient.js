const { Client, GatewayIntentBits, Collection } = require("discord.js");
const { Shoukaku, Connectors } = require("shoukaku");
const PlayerManager = require("./PlayerManager");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const mode247 = require("../utils/247");

class MusicClient extends Client {
  constructor() {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent
      ]
    });

    this.commands = new Collection();
    this.playerManager = new PlayerManager();

    // ✅ Initialize Now Playing messages Map
    this.nowPlayingMessages = new Map();

    // ⏱️ Inactivity timers Map (guildId -> { timer, channelId, textChannel })
    this.inactivityTimers = new Map();

    // ✅ Initialize Gemini AI
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "YOUR_GEMINI_API_KEY");
    this.aiModel = this.genAI.getGenerativeModel({
      model: "gemini-2.5-flash"
    });

    this.shoukaku = new Shoukaku(
      new Connectors.DiscordJS(this),
      [
        {
          name: "main",
          url: "zac.hidencloud.com:24577",
          auth: " youshallnotpass "
        }
      ]
    );

    this.shoukaku.on("ready", (name) => {
      console.log(`🎵 Lavalink node READY: ${name}`);
    });

    this.shoukaku.on("error", (name, error) => {
      console.error(`❌ Lavalink error on ${name}`, error);
    });
  }

  // ✅ Helper function to truncate text to specified length
  truncateText(text, maxLength = 20) {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - 3) + "...";
  }

  // 🤖 AI-powered song analysis
  async analyzeSongWithAI(songTitle, artistName) {
    try {
      const prompt = `Analyze this song and provide similar song recommendations:

Song: "${songTitle}" by ${artistName}

Based on this song, provide:
1. Genre/Style (e.g., Sad, Happy, Romantic, Party, Bhojpuri, Punjabi, Hip-Hop, etc.)
2. Mood (e.g., Melancholic, Energetic, Romantic, Devotional)
3. Language (e.g., Hindi, English, Bhojpuri, Punjabi)
4. 10 similar song recommendations with artist names

Format your response EXACTLY like this (JSON format):
{
  "genre": "genre name",
  "mood": "mood name",
  "language": "language name",
  "suggestions": [
    {"title": "Song Name 1", "artist": "Artist Name 1"},
    {"title": "Song Name 2", "artist": "Artist Name 2"}
  ]
}

IMPORTANT: Return ONLY valid JSON, no extra text before or after.`;

      console.log('🤖 Asking Gemini AI for song analysis...');

      const result = await this.aiModel.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      console.log('🤖 AI Response:', text);

      // Clean response and parse JSON
      let cleanedText = text.trim();

      // Remove markdown code blocks if present
      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/```\n?/g, '');
      }

      cleanedText = cleanedText.trim();

      const aiAnalysis = JSON.parse(cleanedText);

      console.log('✅ AI Analysis:', {
        genre: aiAnalysis.genre,
        mood: aiAnalysis.mood,
        language: aiAnalysis.language,
        suggestions: aiAnalysis.suggestions.length
      });

      return aiAnalysis;

    } catch (error) {
      console.error('❌ AI Analysis Error:', error);
      return null;
    }
  }

  // 🎵 AI-powered similar songs search
  async getAISimilarSongs(currentTrack, node) {
    try {
      const songTitle = currentTrack.info.title;
      const artistName = currentTrack.info.author;

      console.log('🔍 Getting AI suggestions for:', songTitle);

      // Get AI analysis
      const aiAnalysis = await this.analyzeSongWithAI(songTitle, artistName);

      if (!aiAnalysis || !aiAnalysis.suggestions || aiAnalysis.suggestions.length === 0) {
        console.log('⚠️ AI did not provide suggestions, falling back to artist search');
        return await this.getArtistSimilarSongs(currentTrack, node);
      }

      console.log(`🎵 AI suggested ${aiAnalysis.suggestions.length} songs (Genre: ${aiAnalysis.genre}, Mood: ${aiAnalysis.mood})`);

      const suggestions = [];
      let foundCount = 0;

      // Search each AI suggestion on YouTube
      for (const suggestion of aiAnalysis.suggestions) {
        if (foundCount >= 10) break; // Limit to 10 results

        try {
          const searchQuery = `ytsearch:${suggestion.title} ${suggestion.artist}`;
          console.log(`🔍 Searching: ${searchQuery}`);

          const result = await node.rest.resolve(searchQuery);

          let track = null;

          if (result.loadType === "search" && result.data && result.data.length > 0) {
            track = result.data[0]; // First result
          } else if (result.loadType === "track" && result.data) {
            track = result.data;
          }

          if (track && track.encoded) {
            // Skip if same as current track
            if (track.info.identifier === currentTrack.info.identifier) {
              console.log('⏭️ Skipping current track');
              continue;
            }

            suggestions.push({
              title: track.info.title,
              author: track.info.author,
              durationMs: track.info.length,
              url: track.info.uri,
              id: track.info.identifier,
              encoded: track.encoded,
              info: track.info,
              aiContext: {
                genre: aiAnalysis.genre,
                mood: aiAnalysis.mood,
                language: aiAnalysis.language
              }
            });

            foundCount++;
            console.log(`✅ Found: ${track.info.title} by ${track.info.author}`);
          }

          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 300));

        } catch (searchError) {
          console.error(`❌ Error searching ${suggestion.title}:`, searchError.message);
          continue;
        }
      }

      console.log(`✅ AI Suggestions created: ${suggestions.length}`);

      // If AI suggestions are too few, add some artist songs
      if (suggestions.length < 5) {
        console.log('⚠️ Too few AI suggestions, adding artist songs');
        const artistSongs = await this.getArtistSimilarSongs(currentTrack, node);

        // Add unique artist songs
        for (const song of artistSongs) {
          if (suggestions.length >= 10) break;

          const isDuplicate = suggestions.some(s => s.id === song.id);
          if (!isDuplicate) {
            suggestions.push(song);
          }
        }
      }

      return suggestions;

    } catch (error) {
      console.error('❌ Error in AI similar songs:', error);
      // Fallback to artist-based search
      return await this.getArtistSimilarSongs(currentTrack, node);
    }
  }

  // 🎵 Fallback: Artist-based similar songs
  async getArtistSimilarSongs(currentTrack, node) {
    try {
      const suggestions = [];
      const artistName = currentTrack.info.author;

      if (!artistName || artistName === "Unknown" || artistName === "Unknown Artist") {
        console.log('⚠️ Artist name not found');
        return [];
      }

      console.log('🔍 Fallback: Searching songs by artist:', artistName);

      const searchQuery = `ytsearch:${artistName} songs`;
      const result = await node.rest.resolve(searchQuery);

      let tracks = [];

      if (result.loadType === "search" && result.data) {
        tracks = result.data;
      } else if (result.loadType === "track" && result.data) {
        tracks = [result.data];
      }

      if (!tracks || tracks.length === 0) {
        return [];
      }

      // Filter: Same artist + exclude current track
      tracks = tracks
        .filter(t => {
          if (t.info.identifier === currentTrack.info.identifier) return false;

          const trackArtist = (t.info.author || '').toLowerCase();
          const searchArtist = artistName.toLowerCase();

          return trackArtist.includes(searchArtist) || searchArtist.includes(trackArtist);
        })
        .slice(0, 10);

      for (const track of tracks) {
        if (!track.encoded) continue;

        suggestions.push({
          title: track.info.title,
          author: track.info.author,
          durationMs: track.info.length,
          url: track.info.uri,
          id: track.info.identifier,
          encoded: track.encoded,
          info: track.info
        });
      }

      return suggestions;

    } catch (error) {
      console.error("❌ Error in artist similar songs:", error);
      return [];
    }
  }

  // ⏱️ Start inactivity timer for a guild (5 minutes)
  startInactivityTimer(guildId, player, textChannel) {
    // Clear any existing timer first
    this.clearInactivityTimer(guildId);

    const vcChannelId = player.connection?.channelId;

    console.log(`⏱️ Starting 5-min inactivity timer for guild ${guildId}`);

    const timer = setTimeout(async () => {
      console.log(`⏱️ 5-min inactivity timeout reached for guild ${guildId}, disconnecting...`);

      // Clear VC status before disconnecting
      try {
        if (vcChannelId) {
          await this.rest.put(`/channels/${vcChannelId}/voice-status`, {
            body: { status: "" }
          });
        }
      } catch (err) {
        console.error("Failed to clear VC status:", err.message);
      }

      // Disconnect
      try {
        const currentPlayer = this.shoukaku.players.get(guildId);
        if (currentPlayer?.connection) {
          currentPlayer.connection.disconnect();
        }
        this.shoukaku.leaveVoiceChannel(guildId);
      } catch (err) {
        console.error("❌ Error disconnecting after inactivity:", err);
      }

      this.shoukaku.players.delete(guildId);
      this.playerManager.clearQueue(guildId);
      this.inactivityTimers.delete(guildId);

      // Send bye message
      try {
        const embed = require("../utils/embed");
        const embedData = embed("👋 Bye Bye!", "5 minute se koi song nahi chala, toh main chala! 🎵", this);
        await textChannel.send({
          components: embedData.components,
          flags: embedData.flags
        });
      } catch (err) {
        console.error("Failed to send inactivity message:", err);
      }
    }, 5 * 60 * 1000); // 5 minutes

    this.inactivityTimers.set(guildId, { timer, channelId: vcChannelId, textChannel });
  }

  // ⏱️ Clear inactivity timer for a guild
  clearInactivityTimer(guildId) {
    if (this.inactivityTimers.has(guildId)) {
      const timerData = this.inactivityTimers.get(guildId);
      clearTimeout(timerData.timer);
      this.inactivityTimers.delete(guildId);
      console.log(`⏱️ Cleared inactivity timer for guild ${guildId}`);
    }
  }

  // ✅ Setup player events (call this after player creation)
  setupPlayerEvents(player, channel) {
    // Remove old listeners to avoid duplicates
    player.removeAllListeners("end");
    player.removeAllListeners("exception");
    player.removeAllListeners("start");

    player.on("end", async (data) => {
      console.log("🎵 Track ended, reason:", data.reason);

      // ✅ Save channelId early before connection gets destroyed
      const vcChannelId = player.connection?.channelId;

      // ✅ Delete old Now Playing message
      if (this.nowPlayingMessages.has(player.guildId)) {
        const oldMsg = this.nowPlayingMessages.get(player.guildId);
        try {
          await oldMsg.delete();
          console.log("🗑️ Deleted old now playing message");
        } catch (err) {
          console.error("Failed to delete old now playing message:", err);
        }
        this.nowPlayingMessages.delete(player.guildId);
      }

      // Play next if track ended naturally or was skipped
      if (data.reason === "finished" || data.reason === "loadFailed" || data.reason === "stopped") {
        const loopMode = this.playerManager.getLoopMode(player.guildId);
        const currentTrack = this.playerManager.getCurrentTrack(player.guildId);

        // 🔂 TRACK LOOP: replay the same song
        if (loopMode === "track" && currentTrack && data.reason === "finished") {
          console.log("🔂 Looping track:", currentTrack.info.title);

          await player.playTrack({
            track: { encoded: currentTrack.encoded }
          });

          // Send now playing card
          const nowPlaying = require("../utils/nowPlaying");
          const ui = nowPlaying(
            this,
            {
              title: this.truncateText(currentTrack.info.title, 20),
              author: currentTrack.info.author,
              durationMs: currentTrack.info.length,
              thumbnail:
                currentTrack.info.artworkUrl ||
                `https://img.youtube.com/vi/${currentTrack.info.identifier}/hqdefault.jpg`,
              isStream: currentTrack.info.isStream,
            },
            null
          );

          const nowPlayingMsg = await channel.send({
            components: ui.components,
            flags: ui.flags
          });
          this.nowPlayingMessages.set(player.guildId, nowPlayingMsg);
          return;
        }

        // 🔁 QUEUE LOOP: push current track to end of queue
        if (loopMode === "queue" && currentTrack && data.reason === "finished") {
          this.playerManager.addTrack(player.guildId, currentTrack);
        }

        const queue = this.playerManager.getQueue(player.guildId);

        if (queue.length > 0) {
          // ⏱️ Cancel inactivity timer since we're playing next track
          this.clearInactivityTimer(player.guildId);
          const nextTrack = this.playerManager.removeTrack(player.guildId);
          console.log("🎵 Playing next track:", nextTrack.info.title);

          // Save as current track
          this.playerManager.setCurrentTrack(player.guildId, nextTrack);

          await player.playTrack({
            track: {
              encoded: nextTrack.encoded
            }
          });

          // 🎵 Update VC status to new song name
          try {
            if (vcChannelId) {
              await this.rest.put(`/channels/${vcChannelId}/voice-status`, {
                body: { status: `🎵 ${nextTrack.info.title}` }
              });
            }
          } catch (err) {
            console.error("Failed to set VC status:", err.message);
          }

          // Send now playing card with Components V2
          const nowPlaying = require("../utils/nowPlaying");

          const ui = nowPlaying(
            this,
            {
              title: this.truncateText(nextTrack.info.title, 20),
              author: nextTrack.info.author,
              durationMs: nextTrack.info.length,
              thumbnail:
                nextTrack.info.artworkUrl ||
                `https://img.youtube.com/vi/${nextTrack.info.identifier}/hqdefault.jpg`,
              isStream: nextTrack.info.isStream,
            },
            null
          );

          const nowPlayingMsg = await channel.send({
            components: ui.components,
            flags: ui.flags
          });

          this.nowPlayingMessages.set(player.guildId, nowPlayingMsg);
          console.log("✅ Sent new now playing message");
        } else {
          // ✅ Clear current track since nothing is playing anymore
          this.playerManager.setCurrentTrack(player.guildId, null);

          // Check if 24/7 mode is enabled
          if (mode247.has(player.guildId)) {
            console.log("🎵 Queue empty but 24/7 mode is enabled - staying in channel");
            return;
          }

          // ⏱️ Start 5-min inactivity timer instead of immediate disconnect
          console.log("🎵 Queue empty, starting 5-min inactivity timer...");

          // Clear VC status to show idle
          try {
            if (vcChannelId) {
              await this.rest.put(`/channels/${vcChannelId}/voice-status`, {
                body: { status: "⏱️ Waiting for songs..." }
              });
            }
          } catch (err) {
            console.error("Failed to set VC idle status:", err.message);
          }

          this.startInactivityTimer(player.guildId, player, channel);
        }
      }
    });

    player.on("exception", (data) => {
      console.error("❌ Player exception:", data);
    });
  }
}

module.exports = MusicClient;
