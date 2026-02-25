const embed = require("../../utils/embed");

module.exports = {
  name: "resume",
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

    // ✅ Get player from Shoukaku
    const player = client.shoukaku.players.get(message.guild.id);
    
    if (!player) {
      const embedData = embed("<:close:1476181740207738930> Error", "Koi song nahi chal raha", client);
      return message.reply({
        components: embedData.components,
        flags: embedData.flags
      });
    }

    // ✅ Check if already playing
    if (!player.paused) {
      const embedData = embed("<:dmodtick:1452652788466188483> Already Playing", "Music pehle se chal raha hai", client);
      return message.reply({
        components: embedData.components,
        flags: embedData.flags
      });
    }

    // ✅ Resume playback
    player.setPaused(false);
    
    // ✅ Send success message in Components V2
    const embedData = embed("<:dmodtick:1452652788466188483> Resumed", "Music resume kar diya", client);
    message.reply({ 
      components: embedData.components,
      flags: embedData.flags
    });
  }
};
