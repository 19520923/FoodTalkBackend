import { success, notFound, authorOrAdmin } from '../../services/response/'
import { Food } from '.'
import { toAll, to } from '../../services/socket'
import { Notification } from '../notification'
import { User } from '../user'

export const create = ({ user, bodymen: { body } }, res, next) =>
  Food.create({
    author: user.id,
    name: body.name,
    ingredients: body.ingredients,
    recipe: body.recipe,
    photo: body.photo
  })
    .then((food) => food.view())
    .then((food) => toAll('food:create', food))
    .then(async (food) => {
      food.author.follower.forEach(async (follower) => {
        const notification = await Notification.create({
          author: food.author,
          content: `${food.author.username} has added new food recipe`,
          type: 'FOOD',
          food_data: food,
          receiver: follower
        }).then((notification) => (notification ? notification.view() : null))

        await User.findById(follower).then((user) =>
          to('notification:create', notification, user)
        )
      })

      return food
    })
    .then(success(res, 201))
    .catch(next)

export const index = ({ querymen: { query, select, cursor } }, res, next) =>
  Food.count(query)
    .then((count) =>
      Food.find(query, select, cursor).then((foods) => ({
        count,
        rows: foods.map((food) => food.view())
      }))
    )
    .then(success(res))
    .catch(next)

export const reported = ({ querymen: { query, select, cursor } }, res, next) =>
  Food.count({ ...query, num_report: { $gt: 1 }, is_active: true })
    .then((count) =>
      Food.find({ ...query, num_report: { $gt: 1 }, is_active: true }, select, cursor).then((foods) => ({
        count,
        rows: foods.map((food) => food.view())
      }))
    )
    .then(success(res))
    .catch(next)

export const showPersonal = (
  { user, params, querymen: { query, select, cursor } },
  res,
  next
) =>
  Food.count(
    { ...query, author: params.id === 'me' ? user.id : params.id },
    select,
    cursor
  )
    .then((count) =>
      Food.find(
        { ...query, author: params.id === 'me' ? user.id : params.id },
        select,
        cursor
      ).then((foods) => ({
        count,
        rows: foods.map((food) => food.view())
      }))
    )
    .then(success(res))
    .catch(next)

export const show = ({ params }, res, next) =>
  Food.findById(params.id)
    .then(notFound(res))
    .then((food) => (food ? food.view() : null))
    .then(success(res))
    .catch(next)

export const update = ({ bodymen: { body }, user, params }, res, next) =>
  Food.findById(params.id)
    .then(notFound(res))
    .then(authorOrAdmin(res, user, 'author'))
    .then((food) => (food ? Object.assign(food, body).save() : null))
    .then((food) => (food ? food.view() : null))
    .then(success(res))
    .catch(next)

export const destroy = ({ params, user }, res, next) =>
  Food.findById(params.id)
    .then(notFound(res))
    .then(authorOrAdmin(res, user, 'author'))
    .then((food) => (food ? food.set({ is_active: false }).save() : null))
    .then((food) => food.view())
    .then(success(res, 204))
    .catch(next)
