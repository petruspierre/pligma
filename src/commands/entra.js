const shuffle = require('../util/shuffleArray');

module.exports = {
  name: 'entra',
  aliases: ['entrar'],
  description: 'Entre na partida de Plígma',
  usage: '',
  cooldown: 5,
  execute(_, message, args, serverGame, games) {
    // 0 - Duque
    // 1 - Assassino
    // 2 - Condessa
    // 3 - Capitão
    // 4 - Embaixador
    // 5 - Inquisidor

    const deck = [0, 0, 0, 1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5];
    shuffle(deck);
    console.log(deck);

    const userData = {
      user: message.author,
      cartas: [0, 2],
      moedas: 2,
    };

    if (!serverGame) {
      const gameContract = {
        users: [],
        hasStarted: false,
      };

      games.set(message.guild.id, gameContract);

      gameContract.users.push(userData);

      message.reply('você entrou no jogo.\nNo momento tem 1 pessoa na partida.\nAguarde pelo menos mais 1 pessoa para iniciar!');
    } else {
      const filteredServerGame = serverGame.users
        .filter(({ user }) => user.id === message.author.id);

      if (filteredServerGame.length > 0) {
        return message.reply('você já está nesse jogo!');
      }

      serverGame.users.push(userData);
      message.reply(`você entrou no jogo.\nNo momento tem ${serverGame.users.length} pessoas na partida.\nDigite \`>iniciar\` para começar a jogar!`);
      console.log(serverGame);
    }
  },
};
