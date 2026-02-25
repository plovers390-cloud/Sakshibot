const embed = require("../../utils/embed");
const {
  ContainerBuilder,
  TextDisplayBuilder,
  SectionBuilder,
  SeparatorBuilder,
  ThumbnailBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags
} = require("discord.js");

// SeparatorSpacingSize enum values
const SeparatorSpacingSize = {
  Small: 1,
  Large: 2
};

// Function to truncate text
function truncate(text, max = 20) {
  if (!text) return "Unknown Track";
  return text.length > max ? text.slice(0, max) + "..." : text;
}

// Format duration helper
function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000);
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Get accent color helper
function getAccentColor(client) {
  const color = client.color || '#2B2D31';
  if (typeof color === 'string') {
    return parseInt(color.replace('#', ''), 16);
  }
  return color;
}

// Helper function to show queue embed with Components V2
function showQueueEmbed(channel, track, position, client) {
  if (!track || !track.info) {
    console.error("ShowQueueEmbed called with invalid track");
    return;
  }

  const container = new ContainerBuilder()
    .setAccentColor(getAccentColor(client))

    // Header
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent('Track Enqueued')
    )

    .addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
    )

    // Track info with bot pfp thumbnail
    .addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`**Next:** ${truncate(track.info.title, 20)}`),
          new TextDisplayBuilder().setContent(
            `**Duration:** ${formatDuration(track.info.length)}\n` +
            `**Position in queue:** ${position ?? "?"}`
          )
        )
        .setThumbnailAccessory(
          new ThumbnailBuilder()
            .setURL(track.info.artworkUrl || `https://img.youtube.com/vi/${track.info.identifier}/hqdefault.jpg`)
            .setDescription('Track Thumbnail')
        )
    );

  // Buttons
  container.addSeparatorComponents(
    new SeparatorBuilder()
      .setSpacing(SeparatorSpacingSize.Large)
      .setDivider(true)
  );

  const removeBtn = new ButtonBuilder()
    .setCustomId(`remove_track_${position}`)
    .setLabel("Remove")
    .setStyle(ButtonStyle.Danger);

  const playNextBtn = new ButtonBuilder()
    .setCustomId(`play_next_${position}`)
    .setLabel("Play Next")
    .setStyle(ButtonStyle.Success);

  container.addActionRowComponents(
    new ActionRowBuilder().addComponents(removeBtn, playNextBtn)
  );

  return channel.send({
    components: [container],
    flags: MessageFlags.IsComponentsV2
  });
}

// Queue command with Components V2
module.exports = {
  name: "queue",
  aliases: ["q"],
  async execute(client, message) {
    const player = client.shoukaku.players.get(message.guild.id);
    if (!player || !client.playerManager.getCurrentTrack(message.guild.id)) {
      return message.reply({
        embeds: [embed("💌 Queue Empty", "No songs in queue", client)],
      });
    }

    const currentTrack = client.playerManager.getCurrentTrack(message.guild.id);
    const queue = client.playerManager.getQueue(message.guild.id);

    const container = new ContainerBuilder()
      .setAccentColor(getAccentColor(client))

      // Header
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent('🎶 Music Queue')
      )

      .addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
      )

      // Now Playing with bot pfp
      .addSectionComponents(
        new SectionBuilder()
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent('**Now Playing:**'),
            new TextDisplayBuilder().setContent(
              `• ${currentTrack.info.title}\n` +
              `• Duration: ${formatDuration(currentTrack.info.length)}`
            )
          )
          .setThumbnailAccessory(
            new ThumbnailBuilder()
              .setURL(currentTrack.info.artworkUrl || `https://img.youtube.com/vi/${currentTrack.info.identifier}/hqdefault.jpg`)
              .setDescription('Track Thumbnail')
          )
      );

    // Up Next section
    if (queue && queue.length > 0) {
      const tracks = queue
        .slice(0, 10)
        .map((t, i) => `**${i + 1}.** ${t.info.title}`)
        .join('\n');

      container.addSeparatorComponents(
        new SeparatorBuilder()
          .setSpacing(SeparatorSpacingSize.Large)
          .setDivider(true)
      )
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`**Up Next (${queue.length} songs):**`)
        )
        .addSeparatorComponents(
          new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
        )
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(tracks)
        );
    } else {
      container.addSeparatorComponents(
        new SeparatorBuilder()
          .setSpacing(SeparatorSpacingSize.Large)
          .setDivider(true)
      )
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent('*No songs in the queue*')
        );
    }

    message.reply({
      components: [container],
      flags: MessageFlags.IsComponentsV2
    });
  },

  // Export helper function
  showQueueEmbed,
};
