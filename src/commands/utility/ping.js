const embed = require("../../utils/embed");

module.exports = {
    name: "ping",
    aliases: ["latency"],
    async execute(client, message, args) {
        const msg = await message.reply("Pinging...");

        const latency = msg.createdTimestamp - message.createdTimestamp;
        const apiLatency = Math.round(client.ws.ping);

        const embedData = embed(
            "🏓 Pong!",
            `**Bot Latency:** \`${latency}ms\`\n**API Latency:** \`${apiLatency}ms\``
        );

        await msg.edit({
            content: null,
            components: embedData.components,
            flags: embedData.flags
        });
    },
};
