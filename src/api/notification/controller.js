import { success, notFound } from '../../services/response/'
import { Notification } from '.'

export const create = ({ bodymen: { body } }, res, next) =>
  Notification.create(body)
    .then((notification) => notification.view())
    .then(success(res, 201))
    .catch(next)

export const index = ({ querymen: { query, select, cursor } }, res, next) =>
  Notification.count(query)
    .then(count => Notification.find(query, select, cursor)
      .then((notifications) => ({
        count,
        rows: notifications.map((notification) => notification.view())
      }))
    )
    .then(success(res))
    .catch(next)

export const destroy = ({ params }, res, next) =>
  Notification.findById(params.id)
    .then(notFound(res))
    .then((notification) => notification ? notification.remove() : null)
    .then(success(res, 204))
    .catch(next)
