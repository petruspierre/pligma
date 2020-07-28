const { MessageEmbed } = require('discord.js');

module.exports = {
  start: (serverGame) => {
    const { users, channel } = serverGame;

    users.forEach(({ user, cartas }) => {
      const embed = new MessageEmbed()
        .setTitle('O jogo começou!')
        .setDescription('Você inicia o jogo com 2 cartas e 2 moedas. Mantenha suas cartas em **segredo**!')
        .addField('Suas cartas:', cartas.join(' e '));
      user.send(embed);
    });

    const embed = new MessageEmbed()
      .setTitle('O jogo começou!')
      .setDescription('Enviei na DM dos jogadores suas cartas!\nVamos começar em **10** segundos.')
      .setFooter('Se você não recebeu a mensagem provavelmente sua DM está bloqueada para mim!');
    channel.send(embed);

    setTimeout(() => {
      this.newRound(serverGame);

      serverGame.shift += 1;
      if (serverGame.shift === users.length) serverGame.shift = 0;
    }, 1000);
  },
  newRound: (serverGame) => {
    const { shift, users, channel } = serverGame;
    const { user, cartas, moedas } = users[shift];

    const embed = new MessageEmbed()
      .setTitle(`Vez de ${user.username}`)
      .setDescription('Você tem 1 minuto para realizar sua jogada ou sua vez será pulada!')
      .addField('Na mão:', `**${cartas.length}** carta(s)\n**${moedas}** moeda(s)`)
      .addField('Você pode executar uma das seguintes ações reagindo a esta mensagem:',
        '1️⃣ - Pegar uma moeda\n2️⃣ - Pegar duas moedas\n🃏 - Golpe de estado [7 moedas]\n')
      .addField('Duque:', '3️⃣ - Pegar 3 moedas')
      .addField('Capitão', '🔫 - Roubar 2 moedas')
      .addField('Inquisidor', '☝️ - Trocar 1 carta\n👀 - Ver 1 carta de outro jogador')
      .addField('Embaixador', '✌️ - Trocar 2 cartas')
      .addField('Assassino', '🗡 - Assassinar alguem [3 moedas]');

    channel.send(embed).then((msg) => {
      msg.react('1️⃣');
      msg.react('2️⃣');
      msg.react('🃏');
      msg.react('3️⃣');
      msg.react('🔫');
      msg.react('☝️');
      msg.react('👀');
      msg.react('✌️');
      msg.react('🗡');

      const filter = (reaction, u) => ['1️⃣', '2️⃣', '🃏', '3️⃣', '🔫', '☝️', '👀', '✌️', '🗡'].includes(reaction.emoji.name) && u.id === user.id;

      const collector = msg.createReactionCollector(filter, { max: 1, time: 60000, error: ['time'] });
      collector.on('collect', (r, u) => {
        if (r.emoji.name === '1️⃣') {
          channel.send(`${u.username} escolheu pegar 1 moeda.\nEssa jogada não pode ser contestada!`);
        }
      });
      collector.on('error', (r, u) => {
        channel.send('O jogador da vez não jogou... Pulando para o próximo!');
      });
    });
  },
};
