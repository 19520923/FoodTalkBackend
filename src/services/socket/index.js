import socketInit from 'socket.io'
import passport from 'passport'
import { User } from '../../api/user'

let io
let socket

const wrapMiddlewareForSocketIo = (middleware) => (socket, next) =>
  middleware(socket.request, {}, next)

export const initSocket = function (server) {
  io = socketInit().listen(server)

  io.use(wrapMiddlewareForSocketIo(passport.initialize()))
  io.use(wrapMiddlewareForSocketIo(passport.session()))
  io.use(wrapMiddlewareForSocketIo(passport.authenticate(['jwt'])))

  io.on('connection', function (s) {
    socket = s
    const user = s.request.user

    s.broadcast.emit('user:connect', { user_id: user.id })
    storeSocketIdInDB(s.id, user.id)

    socket.on('disconnect', () => {
      socket.broadcast.emit('user:disconnect', {
        user_id: user.id
      })
      storeSocketIdInDB(s.id, user.id)
    })
  })
}

export const toAll = (message, data) => {
  if (socket) socket.broadcast.emit(message, data)
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
