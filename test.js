const Client = require('./src/library/Client');

const bot = new Client({ username: 'me@jordanjones.org', host: 'localhost', port: 25565, version: '1.16.4' });

bot.login();
