const active247 = new Set();

module.exports = {
  enable: (guildId) => active247.add(guildId),
  disable: (guildId) => active247.delete(guildId),
  has: (guildId) => active247.has(guildId)
};
