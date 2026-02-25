const embed = require("../../utils/embed");

module.exports = {
    name: "join",
    aliases: ["j", "come"],
    async execute(client, message, args) {
        // 1️⃣ Voice channel check
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) {
            const embedData = embed("❌ Error", "Pehle voice channel join karo", client);
            return message.reply({
                components: embedData.components,
                flags: embedData.flags
            });
        }

        // 2️⃣ Check if bot is already in a channel
        let player = client.shoukaku.players.get(message.guild.id);
        if (player) {
            const embedData = embed("❌ Error", "Main pehle se hi ek voice channel mein hoon", client);
            return message.reply({
                components: embedData.components,
                flags: embedData.flags
            });
        }

        try {
            // 3️⃣ Join Voice Channel
            player = await client.shoukaku.joinVoiceChannel({
                guildId: message.guild.id,
                channelId: voiceChannel.id,
                shardId: 0,
                deaf: true
            });

            client.setupPlayerEvents(player, message.channel);

            const embedData = embed("✅ Joined", `Main **${voiceChannel.name}** channel mein aa gaya hoon!`, client);
            return message.reply({
                components: embedData.components,
                flags: embedData.flags
            });

        } catch (error) {
            console.error("❌ Join command error:", error);
            const embedData = embed("❌ Error", `Join karne mein error aayi: ${error.message}`, client);
            return message.reply({
                components: embedData.components,
                flags: embedData.flags
            });
        }
    }
};
