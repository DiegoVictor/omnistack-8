import socketio from 'socket.io';
import Connection from './app/models/Connection';

import parseStringAsArray from './app/helpers/parseStringAsArray';
import calculateDistance from './app/helpers/calculateDistance';

let io;

export function setupWebSocket(server) {
  io = socketio(server);

  io.on('connection', async socket => {
    const { latitude, longitude, techs } = socket.handshake.query;

    await Connection.create({
      socket_id: socket.id,
      coordinates: {
        latitude: Number(latitude),
        longitude: Number(longitude),
      },
      techs: parseStringAsArray(techs),
    });

    io.on('disconnect', async () => {
      const connection = await Connection.find({ socket_id: socket.id });
      await connection.remove();
    });
  });
}

export async function findConnection(coordinates, techs) {
  const connections = await Connection.find({ techs: { $in: techs } });
  return connections.filter(connection => {
    return calculateDistance(coordinates, connection.coordinates) < 10;
  });
}

export function sendMessage(to, message, data) {
  to.forEach(({ socket_id }) => {
    io.to(socket_id).emit(message, data);
  });
}