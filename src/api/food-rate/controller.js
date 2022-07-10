import { success, notFound, authorOrAdmin } from '../../services/response/'
import { FoodRate } from '.'

export const create = ({ user, bodymen: { body } }, res, next) =>
  FoodRate.create({ ...body, author: user })
    .then((foodRate) => foodRate.view())
    .then(success(res, 201))
    .catch(next)

export const index = ({ params, querymen: { query, select, cursor }}, res, next) =>
  FoodRate.count({food: params.id, ...query})
    .then(count => FoodRate.find({food: params.id, ...query}, select, cursor)
      .then((foodRates) => ({
        count,
        rows: foodRates.map((foodRate) => foodRate.view())
      }))
    )
    .then(success(res))
    .catch(next)

export const update = ({ user, bodymen: { body }, params }, res, next) =>
  FoodRate.findById(params.id)
    .then(notFound(res))
    .then(authorOrAdmin(res, user, 'author'))
    .then((foodRate) => foodRate ? Object.assign(foodRate, body).save() : null)
    .then((foodRate) => foodRate ? foodRate.view() : null)
    .then(success(res))
    .catch(next)

export const destroy = ({ user, params }, res, next) =>
  FoodRate.findById(params.id)
    .then(notFound(res))
    .then(authorOrAdmin(res, user, 'author'))
    .then((foodRate) => foodRate ? foodRate.remove() : null)
    .then(success(res, 204))
    .catch(next)
