import { success, notFound, authorOrAdmin } from '../../services/response/'
import { FoodRate } from '.'
import { Notification } from '../notification'
import { User } from '../user'
import { toAll, to } from '../../services/socket'

export const create = ({ user, bodymen: { body } }, res, next) =>
  FoodRate.create({ ...body, author: user })
    .then(async (foodRate) => {
      if (user.id != foodRate.food.author._id) {
        const notification = await Notification.create({
          author: user,
          content: `${user.username} has rate your food recipe`,
          type: 'FOOD',
          food_data: foodRate.food,
          receiver: foodRate.food.author
        }).then((noti) => (noti ? noti.view() : null))

        await User.findById(user.id).then((user) =>
          to('notification:create', notification, user)
        )
      }
      return foodRate.view()
    })
    .then((foodRate) => toAll('food-rate:create', foodRate))
    .then(success(res, 201))
    .catch(next)

export const index = (
  { params, querymen: { query, select, cursor } },
  res,
  next
) =>
  FoodRate.count({ food: params.id, ...query })
    .then((count) =>
      FoodRate.find({ food: params.id, ...query }, select, cursor)
        .sort('-created_at')
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
    .then((foodRate) =>
      foodRate ? Object.assign(foodRate, body).save() : null
    )
    .then((foodRate) => (foodRate ? foodRate.view() : null))
    .then(success(res))
    .catch(next)

export const destroy = ({ user, params }, res, next) =>
  FoodRate.findById(params.id)
    .then(notFound(res))
    .then(authorOrAdmin(res, user, 'author'))
    .then((foodRate) => (foodRate ? foodRate.remove() : null))
    .then(success(res, 204))
    .catch(next)
