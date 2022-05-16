const Discord = require('discord.js');

const client = new Discord.Client({
  intents: 38911,
});

require('./Handlers')(client);

client.login(TOKEN);
