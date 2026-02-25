const {
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    SectionBuilder,
    ThumbnailBuilder,
    MessageFlags
} = require('discord.js');

// SeparatorSpacingSize enum values
const SeparatorSpacingSize = {
    Small: 1,
    Large: 2
};

module.exports = {
    name: "love",
    aliases: ["sakshi", "gf"],
    async execute(client, message, args) {

        const getAccentColor = () => {
            const color = '#FF1493'; // Deep Pink for love
            return parseInt(color.replace('#', ''), 16);
        };

        // 💖 Sakshi's photo URL — Replace with actual photo
        const sakshiPhoto = client.user.displayAvatarURL({ size: 512 });

        const container = new ContainerBuilder()
            .setAccentColor(getAccentColor())

            // Header with thumbnail
            .addSectionComponents(
                new SectionBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(
                            `# About My Sakshi`
                        )
                    )
                    .setThumbnailAccessory(
                        new ThumbnailBuilder()
                            .setURL(sakshiPhoto)
                            .setDescription('My Sakshi ❤️')
                    )
            )

            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Large)
                    .setDivider(true)
            )

            // Love message
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    `Sakshi is not just my girlfriend, she is the most beautiful part of my life. ` +
                    `She has the purest heart and the most caring nature. Her smile can brighten even my darkest days, ` +
                    `and her voice feels like peace to my soul. She understands me in ways no one else does and always supports me no matter what.`
                )
            )

            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Small)
                    .setDivider(false)
            )

            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    `She is kind, loving, and incredibly strong. Being with her makes me a better person every day. ` +
                    `I feel lucky and blessed to have Sakshi in my life. She is not just my girlfriend, she is my happiness, my comfort, and my forever. 💕`
                )
            )

            .addSeparatorComponents(
                new SeparatorBuilder()
                    .setSpacing(SeparatorSpacingSize.Large)
                    .setDivider(true)
            )

            // Footer
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    `-# Made with ❤️ by Aditya for his Sakshi`
                )
            );

        return message.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2
        });
    }
};
