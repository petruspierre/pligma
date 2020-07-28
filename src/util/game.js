const { MessageEmbed } = require('discord.js');

const nextRound = async (serverGame) => {
  const { users } = serverGame;
  serverGame.round += 1;
  serverGame.shift += 1;
  if (serverGame.shift === users.length) serverGame.shift = 0;

  newRound(serverGame);
};

const handleReactions = (serverGame, msg) => {
  const {
    shift, channel, users,
  } = serverGame;
  const { user, cartas, moedas } = users[shift];

  serverGame.roundMessage = msg;
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

  const collector = msg.createReactionCollector(filter, { max: 1, time: 120000, error: ['time'] });
  collector.on('collect', (r, u) => {
    if (r.emoji.name === '1️⃣') {
      channel.send(`<@${u.id}> escolheu pegar 1 moeda.\nEssa jogada não pode ser contestada!`);
      serverGame.users[shift].moedas += 1;
      nextRound(serverGame);
    } else if (r.emoji.name === '2️⃣') {
      channel.send(`<@${u.id}> escolheu pegar 2 moedas.\nEssa jogada pode ser contestada por um Duque reagindo com ⚔️\n10 segundos para contestar!`)
        .then((challengeMsg) => {
          challengeMsg.react('⚔️');

          const challengeFilter = (reaction, challenger) => ['⚔️'].includes(reaction.emoji.name) && challenger.bot === false && challenger.id !== u.id;
          const challengeCollector = challengeMsg.createReactionCollector(challengeFilter, { max: 1, time: 10000, error: ['time'] });
          challengeCollector.on('collect', (challengeReaction, challenger) => {
            channel.send(`<@${challenger.id}> contestou a jogada de <@${u.id}>!\nOs jogadores tem mais 10 segundos para contestar se <@${challenger.id}> tem o Duque!`)
              .then((revengeMsg) => {
                revengeMsg.react('🛡️');

                const revengeFilter = (reaction, avenger) => ['🛡️'].includes(reaction.emoji.name) && avenger.bot === false && avenger.id !== challenger.id;
                const revengeCollector = revengeMsg.createReactionCollector(revengeFilter, { max: 1, time: 10000, error: ['time'] });
                revengeCollector.on('collect', (revengeReaction, avenger) => {
                  checkChallenge(serverGame, challenger, avenger, 'Duque');
                });
              });
          });
          challengeCollector.on('end', (collected, reason) => {
            if (reason === 'time') {
              channel.send(`Ninguém contestou e <@${u.id}> recebe 2 moedas!`);
              serverGame.users[shift].moedas += 2;
              nextRound(serverGame);
            }
          });
        });
    }
  });
  collector.on('end', (collected, reason) => {
    if (reason === 'time') {
      channel.send('O jogador da vez não jogou... Pulando para o próximo!');
      nextRound(serverGame);
    }
  });
};

const newRound = async (serverGame) => {
  const {
    shift, users, channel, round,
  } = serverGame;
  const { user, cartas, moedas } = users[shift];

  const bareMessage = new MessageEmbed()
    .setTitle(`Vez de ${user.username}`)
    .setDescription(`Você tem 2 minutos para realizar sua jogada ou sua vez será pulada!\n\n**Na mão:**\n**${cartas.length}** carta(s)\n**${moedas}** moeda(s)`)
    .addField('Você pode executar uma das seguintes ações reagindo a esta mensagem:',
      '1️⃣ - Pegar uma moeda\n2️⃣ - Pegar duas moedas\n🃏 - Golpe de estado [7 moedas]\n')
    .addField('Duque', '3️⃣ - Pegar 3 moedas')
    .addField('Capitão', '🔫 - Roubar 2 moedas')
    .addField('Inquisidor', '☝️ - Trocar 1 carta\n👀 - Ver 1 carta de outro jogador')
    .addField('Embaixador', '✌️ - Trocar 2 cartas')
    .addField('Assassino', '🗡 - Assassinar alguem [3 moedas]');

  channel.send(`Vez de <@${user.id}>`);
  if (round % 3 === 0 || round === 1) {
    channel.send(bareMessage).then((msg) => handleReactions(serverGame, msg));
  } else {
    serverGame.roundMessage.edit(bareMessage).then((msg) => handleReactions(serverGame, msg));
  }
};

const checkChallenge = (serverGame, target, challenger, card) => {
  const {
    channel, users,
  } = serverGame;

  channel.send('checkChallenge');
};

const removeCard = (target, amount) => {

};

const start = (serverGame) => {
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
    nextRound(serverGame);
  }, 1000);
};

module.exports = {
  start, newRound,
};
