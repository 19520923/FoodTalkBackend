import { success, notFound } from '../../services/response/'
import { UserBlockList } from '.'

export const create = ({ user, bodymen: { body } }, res, next) =>
  UserBlockList.create({ ...body, author: user })
    .then((userBlockList) => userBlockList.view(true))
    .then(success(res, 201))
    .catch(next)

export const index = ({ querymen: { query, select, cursor } }, res, next) =>
  UserBlockList.count(query)
    .then(count => UserBlockList.find(query, select, cursor)
      .then((userBlockLists) => ({
        count,
        rows: userBlockLists.map((userBlockList) => userBlockList.view())
      }))
    )
    .then(success(res))
    .catch(next)

export const destroy = ({ params }, res, next) =>
  UserBlockList.find({ user: params.id })
    .then(notFound(res))
    .then((userBlockList) => userBlockList ? userBlockList.map(u => u.remove()) : null)
    .then(success(res, 204))
    .catch(next)
