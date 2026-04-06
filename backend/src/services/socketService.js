let io;

export const setSocketServer = (server) => {
  io = server;
};

export const emitRealtimeUpdate = (event, payload) => {
  if (!io) {
    return;
  }

  io.emit(event, payload);
};
