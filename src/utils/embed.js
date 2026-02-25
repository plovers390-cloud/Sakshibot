const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
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

module.exports = (title, description, client = null) => {
  const container = new ContainerBuilder()
    .setAccentColor(0xFF0000);

  // Add bot avatar if client is provided
  if (client && client.user) {
    container.addMediaGalleryComponents(
      new MediaGalleryBuilder().addItems(
        new MediaGalleryItemBuilder()
          .setURL(client.user.displayAvatarURL({ size: 256 }))
      )
    );
  }

  // Title
  container.addTextDisplayComponents(
    new TextDisplayBuilder()
      .setContent(`${title}`)
  )
    .addSeparatorComponents(
      new SeparatorBuilder()
        .setSpacing(SeparatorSpacingSize.Small)
        .setDivider(true)
    );

  // Description
  if (description) {
    container.addTextDisplayComponents(
      new TextDisplayBuilder()
        .setContent(`<:starS:1476181103885815940>  ${description}`)
    )
      .addSeparatorComponents(
        new SeparatorBuilder()
          .setSpacing(SeparatorSpacingSize.Small)
          .setDivider(true)
      );
  }

  return {
    components: [container],
    flags: MessageFlags.IsComponentsV2
  };
};