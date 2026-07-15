const { Server } = require('socket.io');

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    socket.on('join-project', (projectId) => {
      if (!projectId) return;
      socket.join(`project:${projectId}`);
      socket.join(`workspace:${projectId}`);
    });

    socket.on('leave-project', (projectId) => {
      if (!projectId) return;
      socket.leave(`project:${projectId}`);
      socket.leave(`workspace:${projectId}`);
    });
  });

  return io;
};

const getIO = () => io;

const emitTaskEvent = (eventName, payload) => {
  if (!io || !payload) return;

  const projectId = payload.project?._id || payload.project || payload.projectId;
  if (!projectId) return;

  io.to(`project:${projectId}`).emit(eventName, payload);
  io.to(`workspace:${projectId}`).emit(eventName, payload);
};

module.exports = {
  initSocket,
  getIO,
  emitTaskEvent,
};
