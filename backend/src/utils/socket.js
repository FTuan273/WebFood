let io;

module.exports = {
  init: httpServer => {
    io = require('socket.io')(httpServer, {
      cors: {
        origin: '*', // Trong môi trường thực tế, cấu hình lại địa chỉ frontend cho bảo mật
        methods: ['GET', 'POST', 'PUT', 'DELETE']
      }
    });

    io.on('connection', socket => {
      console.log('⚡ Socket client connected:', socket.id);
      
      socket.on('disconnect', () => {
        console.log('❌ Socket client disconnected:', socket.id);
      });
    });

    return io;
  },
  getIO: () => {
    if (!io) throw new Error('Socket.io未 initialized!');
    return io;
  }
};
