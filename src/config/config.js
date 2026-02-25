require("dotenv").config();


module.exports = {
    token: process.env.DISCORD_TOKEN,
    prefix: process.env.PREFIX,
    ownerId: process.env.OWNER_ID
};