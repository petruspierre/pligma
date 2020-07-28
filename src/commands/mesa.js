const { MessageEmbed } = require('discord.js');

module.exports = {
  name: 'mesa',
  aliases: ['info'],
  description: 'Informações sobre a partida atual',
  usage: '',
  cooldown: 5,
  execute(_, message, args, serverGame, games) {
    if (!serverGame) {
      message.reply('não está rolando nenhuma partida no momento!');
    } else {
      if (!serverGame.hasStarted) {
        return message.reply('a partida ainda não foi iniciada!');
      }
      const data = serverGame.users.map(({ user, cartas, moedas }) => `**${user.username}**\nCartas: **${cartas.length}**\nMoedas: **${moedas}**`);

      const embed = new MessageEmbed()
        .setTitle('Informações da mesa')
        .addField('Jogadores no momento:', data.join('\n\n'));

      message.channel.send(embed);
    }
  },
};
