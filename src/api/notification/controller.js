import { success, notFound } from '../../services/response/'
import { Notification } from '.'

export const create = ({ bodymen: { body } }, res, next) =>
  Notification.create(body)
    .then((notification) => notification.view())
    .then(success(res, 201))
    .catch(next)

export const index = (
  { user, querymen: { query, select, cursor } },
  res,
  next
) =>
  Notification.count({ ...query, receiver: user })
    .then((count) =>
      Notification.find({ ...query, receiver: user }, select, cursor).sort('-created_at').then(
        (notifications) => ({
          count,
          rows: notifications.map((notification) => notification.view())
        })
      )
    )
    .then(success(res))
    .catch(next)

export const seen = ({ user, params }, res, next) =>
  Notification.findById(params.id)
    .then(notFound(res, 404))
    .then((notification) =>
      notification
        .set({ is_seen: true })
        .save()
        .then(() => ({ message: params.id + ' has been seen.' }))
    )
    .then(success(res, 200))
    .catch(next)

export const destroy = ({ params }, res, next) =>
  Notification.findById(params.id)
    .then(notFound(res))
    .then((notification) => (notification ? notification.remove() : null))
    .then(success(res, 204))
    .catch(next)
