import { GameDig } from 'gamedig';

const query = async (instance) => new Promise((resolve) => {
  GameDig.query({
    type: 'minecraft',
    host: '127.0.0.1',
    port: instance.port,
    timeout: 2000,
  }).then((state) => {
    resolve({
      online: true,
      version: state?.version,
      ping: state?.ping,
      onlinePlayers: state?.numplayers,
      players: state?.players ?? [],
    });
  }).catch(() => {
    resolve({
      online: false,
      version: '',
      ping: '',
      onlinePlayers: 0,
      players: [],
    });
  });
});

export default query;
