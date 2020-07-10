const Discord = require('discord.js');

module.exports = {
  name: 'say',
  aliases: ['falar'],
  description: 'Deixe o bot falar algo',
  usage: '<mensagem>',
  cooldown: 5,
  args: true,
  execute(_, message, args) {
    if (!args) {
      return message.reply('você precisa dizer algo para eu repetir!');
    }

    message.channel.send(args);
  },
};
