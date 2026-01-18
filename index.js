require('dotenv').config();
const Bot = require('./src/Bot');

const bot = new Bot();

bot.start(process.env.DISCORD_TOKEN).catch(err => {
    console.error('Failed to start bot:', err);
});