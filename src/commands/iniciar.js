const { MessageEmbed } = require('discord.js');
const shuffle = require('../util/shuffleArray');
const { start } = require('../util/game');

module.exports = {
  name: 'iniciar',
  aliases: ['jogar'],
  description: 'Inicie uma partida de Plígma',
  usage: '',
  cooldown: 5,
  guildOnly: true,
  execute(_, message, args, serverGame, games) {
    // 0 - Duque
    // 1 - Assassino
    // 2 - Condessa
    // 3 - Capitão
    // 4 - Embaixador
    // 5 - Inquisidor

    const deck = ['Duque', 'Duque', 'Duque', 'Assassino', 'Assassino', 'Assassino',
      'Condessa', 'Condessa', 'Condessa', 'Capitão', 'Capitão', 'Capitão', 'Embaixador',
      'Embaixador', 'Embaixador', 'Inquisidor', 'Inquisidor', 'Inquisidor'];

    function createPlayer(user) {
      shuffle(deck);
      const userData = {
        user,
        cartas: [deck[0], deck[1]],
        moedas: 2,
      };
      deck.shift();
      deck.shift();

      return userData;
    }

    if (!serverGame) {
      const channel = message.guild.channels.cache.find((ch) => ch.name === '🃏pligma');
      const gameContract = {
        users: [],
        hasStarted: false,
        channel,
        shift: 0,
        roundMessage: null,
        round: 0,
      };

      games.set(message.guild.id, gameContract);
      serverGame = games.get(message.guild.id);

      const firstPlayer = createPlayer(message.author);
      gameContract.users.push(firstPlayer);

      const description = 'Você criou uma partida, aguarde novos jogadores entrarem!\n\nPara entrar na partida, basta reagir a esta mensagem com ➕\n\nO tempo limite para aceitar o jogo é de 2 minutos, caso ultrapasse o tempo, a partida será iniciada caso haja 2 ou mais jogadores ou cancelada se não atingir 2 jogadores!\n\n**JOGADORES NA PARTIDA:**';
      let jogadores = `\n${message.author.username}`;

      const embed = new MessageEmbed()
        .setTitle('Partida criada!')
        .setDescription(description + jogadores);

      const filter = (reaction, user) => ['➕', '▶️'].includes(reaction.emoji.name) && user.bot === false;

      message.channel.send(embed).then((msg) => {
        msg.react('➕');

        const collector = msg.createReactionCollector(filter, { time: 120000 });
        collector.on('collect', (r, user) => {
          if (r.emoji.name === '➕') {
            const filteredServerGame = serverGame.users
              .filter(({ user: u }) => u.id === user.id);

            if (filteredServerGame.length === 0) {
              const newPlayer = createPlayer(user);
              serverGame.users.push(newPlayer);
              jogadores += `\n${user.username}`;
              embed.setDescription(description + jogadores);

              r.message.edit(embed);
            }
          } else if (r.emoji.name === '▶️') {
            if (serverGame.users.length < 2) return msg.channel.send('A partida precisa ter pelo menos 2 jogadores para iniciar!');
            serverGame.hasStarted = true;

            start(serverGame);
          }
          if (serverGame.users.length === 2) msg.react('▶️');
        });
      });
    } else {
      message.reply('Uma partida já está sendo iniciada ou em andamento!');
    }
  },
};
