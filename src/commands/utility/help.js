const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags
} = require('discord.js');

// SeparatorSpacingSize enum values
const SeparatorSpacingSize = {
  Small: 1,
  Large: 2
};

module.exports = {
  name: "help",
  aliases: ["h"],
  async execute(client, message, args) {

    /* ===== GET ACCENT COLOR ===== */
    const getAccentColor = () => {
      const color = client.color || '#2B2D31';
      if (typeof color === 'string') {
        return parseInt(color.replace('#', ''), 16);
      }
      return color;
    };

    /* ===== HELP CONTAINER ===== */
    const container = new ContainerBuilder()
      .setAccentColor(getAccentColor())

      // Header
      .addTextDisplayComponents(
        new TextDisplayBuilder()
          .setContent('**Sakshi Music Bot - Help Menu**')
      )

      .addSeparatorComponents(
        new SeparatorBuilder()
          .setSpacing(SeparatorSpacingSize.Large)
          .setDivider(true)
      )

      // About Section
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**<:dotred:1459597087292522751> About Bot**\n` +
          `A powerful music bot with high-quality playback and easy controls.\n` +
          `Use the buttons below to navigate through command categories.`
        )
      )

      .addSeparatorComponents(
        new SeparatorBuilder()
          .setSpacing(SeparatorSpacingSize.Large)
          .setDivider(true)
      )

      // Music Commands Section
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**<:dotred:1459597087292522751> Music Commands**\n` +
          `\`play\` - Play a song from YouTube/Spotify\n` +
          `\`pause\` - Pause/Resume current track\n` +
          `\`skip\` - Skip to next track\n` +
          `\`stop\` - Stop playback and clear queue\n` +
          `\`queue\` - View current queue\n` +
          `\`loop\` - Toggle loop mode\n` +
          `\`shuffle\` - Shuffle the queue\n` +
          `\`volume\` - Adjust playback volume\n` +
          `\`filter\` - Apply audio effects (bass, nightcore, etc.)`
        )
      )

      .addSeparatorComponents(
        new SeparatorBuilder()
          .setSpacing(SeparatorSpacingSize.Large)
          .setDivider(true)
      )

      // Utility Commands Section
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**<:dotred:1459597087292522751> Utility Commands**\n` +
          `\`help\` - Show this help menu\n` +
          `\`ping\` - Check bot latency\n` +
          `\`nowplaying\` - Show current track info\n` +
          `\`invite\` - Get bot invite link`
        )
      );

    /* ===== NAVIGATION BUTTONS ===== */
    container.addSeparatorComponents(
      new SeparatorBuilder()
        .setSpacing(SeparatorSpacingSize.Large)
        .setDivider(true)
    );

    const musicButton = new ButtonBuilder()
      .setCustomId('help_music')
      .setLabel('Music')
      .setStyle(ButtonStyle.Primary);

    const utilityButton = new ButtonBuilder()
      .setCustomId('help_utility')
      .setLabel('Utility')
      .setStyle(ButtonStyle.Secondary);

    const settingsButton = new ButtonBuilder()
      .setCustomId('help_settings')
      .setLabel('Settings')
      .setStyle(ButtonStyle.Secondary);

    const supportButton = new ButtonBuilder()
      .setCustomId('help_support')
      .setLabel('Support')
      .setStyle(ButtonStyle.Success);

    container.addActionRowComponents(
      new ActionRowBuilder().addComponents(
        musicButton, utilityButton, settingsButton, supportButton
      )
    );

    return message.reply({
      components: [container],
      flags: MessageFlags.IsComponentsV2
    });
  }
};