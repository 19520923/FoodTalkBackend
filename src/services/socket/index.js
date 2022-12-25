import { Server } from 'socket.io'
import passport from 'passport'
import { User } from '../../api/user'

let io

const wrapMiddlewareForSocketIo = (middleware) => (socket, next) =>
  middleware(socket.request, {}, next)

export const initSocket = function (server) {
  io = new Server(server, { cors: { origin: '*' } })

  io.use(wrapMiddlewareForSocketIo(passport.initialize()))
  io.use(wrapMiddlewareForSocketIo(passport.session()))
  io.use(wrapMiddlewareForSocketIo(passport.authenticate(['jwt'])))

  io.on('connection', function (socket) {
    const user = socket.request.user

    socket.emit('user:connect', { user_id: user.id })
    storeSocketIdInDB(socket.id, user.id)

    socket.on('disconnect', () => {
      socket.emit('user:disconnect', {
        user_id: user.id
      })
      storeSocketIdInDB('', user.id)
    })
  })
}

export const toAll = (message, data) => {
  io.emit(message, data)
  return data
}

export const to = (message, data, payload) => {
  if (payload.socket_id) io.to(payload.socket_id).emit(message, data)
  return data
}

async function storeSocketIdInDB (socket_id, user_id) {
  await User.updateOne(
    { _id: user_id },
    { $set: { socket_id: socket_id } },
    function (err) {
      console.log(err)
    }
  )
}
