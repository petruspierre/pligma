require('dotenv').config();
const fs = require('fs');
const { resolve } = require('path');
const Discord = require('discord.js');

const { prefix, defaultCooldown } = require('../config.json');

const client = new Discord.Client();
const cooldowns = new Discord.Collection();
client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync(resolve(__dirname, 'commands')).filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(resolve(__dirname, 'commands', file));
  client.commands.set(command.name, command);
}

const games = new Map();

client.once('ready', () => {
  client.user.setActivity('Plígma!', { type: 'PLAYING' });
  console.log('-> Plígma online');
});

client.on('message', async (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command = client.commands.get(commandName)
    || client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName));

  if (!command) return message.reply('não entendi, tem certeza que esse comando existe?');

  if (command.args && !args.length) {
    let reply = 'preciso de mais informações para executar esse comando!';

    if (command.usage) {
      reply += `\nA maneira correta é: \`${prefix}${command.name} ${command.usage}\``;
    }

    return message.reply(reply);
  }

  if (command.guildOnly && message.channel.type !== 'text') {
    return message.reply('não realizo esse comando na DM, use em um servidor!');
  }

  if (!cooldowns.has(command.name)) {
    cooldowns.set(command.name, new Discord.Collection());
  }

  const now = Date.now();
  const timestamps = cooldowns.get(command.name);
  const cooldownAmount = (command.cooldown || defaultCooldown) * 1000;

  if (timestamps.has(message.author.id)) {
    const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;
      return message.reply(`por favor aguarde ${timeLeft.toFixed(1)} segundos antes de tentar o comando \`${command.name}\` novamente.`);
    }
  } else {
    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
  }

  try {
    const serverGame = games.get(message.guild.id);
    command.execute(client, message, args, serverGame, games);
  } catch (error) {
    console.error(error);
    message.reply('ocorreu um erro ao tentar executar esse comando');
  }
});

client.login(process.env.TOKEN);
