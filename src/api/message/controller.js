import { success, notFound, authorOrAdmin } from '../../services/response/'
import { Message } from '.'
import { User } from '../user'
import { to } from '../../services/socket'

export const create = ({ user, bodymen: { body } }, res, next) =>
  Message.create({ ...body, author: user })
    .then((message) => {
      const send_u = message.chat.user_1 == user.id ? message.chat.user_2 : message.chat.user_1
      User.findById(send_u).then((u) => 
        to('message:create', message.view(), u)
      )
      return message.view()
    })
    .then(success(res, 201))
    .catch(next)

export const index = (
  { params, querymen: { query, select, cursor } },
  res,
  next
) =>
  Message.count({ ...query, chat: params.id })
    .then((count) =>
      Message.find({ ...query, chat: params.id }, select, cursor)
        .sort('-created_at')
        .then((messages) => ({
          count,
          rows: messages.map((message) => message.view())
        }))
    )
    .then(success(res))
    .catch(next)

export const update = ({ user, bodymen: { body }, params }, res, next) =>
  Message.findById(params.id)
    .then(notFound(res))
    .then(authorOrAdmin(res, user, 'author'))
    .then((message) => (message ? Object.assign(message, body).save() : null))
    .then((message) => (message ? message.view(true) : null))
    .then(success(res))
    .catch(next)

export const destroy = ({ user, params }, res, next) =>
  Message.findById(params.id)
    .then(notFound(res))
    .then(authorOrAdmin(res, user, 'author'))
    .then((message) => (message ? message.remove() : null))
    .then(success(res, 204))
    .catch(next)
