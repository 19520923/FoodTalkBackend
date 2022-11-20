import { success, notFound } from '../../services/response/'
import { FoodBlockList } from '.'

export const create = ({ user, bodymen: { body } }, res, next) =>
  FoodBlockList.create({ ...body, author: user })
    .then((foodBlockList) => foodBlockList.view())
    .then(success(res, 201))
    .catch(next)

export const index = ({ querymen: { query, select, cursor } }, res, next) =>
  FoodBlockList.count(query)
    .then(count => FoodBlockList.find(query, select, cursor)
      .then((foodBlockLists) => ({
        count,
        rows: foodBlockLists.map((foodBlockList) => foodBlockList.view())
      }))
    )
    .then(success(res))
    .catch(next)

export const destroy = ({ params }, res, next) =>
  FoodBlockList.find({ food: params.id })
    .then(notFound(res))
    .then((foodBlockList) => foodBlockList ? foodBlockList.map(b => b.remove()) : null)
    .then(success(res, 204))
    .catch(next)
