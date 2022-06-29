import { Server } from 'socket.io'

export const socket = (httpServer) => {
  const io = new Server(httpServer, { /* options */ })

  io.on('connection', (socket) => {
    // ...
  })

  httpServer.listen(3000)
}
