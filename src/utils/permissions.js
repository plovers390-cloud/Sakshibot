module.exports = (message) => {
  return message.member.roles.cache.some(r => r.name === "DJ");
};
