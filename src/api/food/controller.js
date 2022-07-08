import { success, notFound } from "../../services/response/";
import { Food } from ".";
import { toAll } from "../../services/socket";

export const create = ({ user, bodymen: { body } }, res, next) =>
  Food.create({
    author: user.id,
    name: body.name,
    ingredients: body.ingredients,
    recipe: body.recipe,
  })
    .then((food) => food.view())
    .then(toAll("food:create"))
    .then(success(res, 201))
    .catch(next);

export const index = ({ querymen: { query, select, cursor } }, res, next) =>
  Food.count(query)
    .then((count) =>
      Food.find(query, select, cursor).then((foods) => ({
        count,
        rows: foods.map((food) => food.view()),
      }))
    )
    .then(success(res))
    .catch(next);

export const showPersonal = (
  { user, querymen: { query, select, cursor } },
  res,
  next
) =>
  Food.count({ author: user.id }, query, select, cursor)
    .then((count) =>
      Food.find({ author: user.id }, query, select, cursor).then((foods) => ({
        count,
        rows: foods.map((food) => food.view()),
      }))
    )
    .then(success(res))
    .catch(next);

export const show = ({ params }, res, next) =>
  Food.findById(params.id)
    .then(notFound(res))
    .then((food) => (food ? food.view() : null))
    .then(success(res))
    .catch(next);

export const update = ({ bodymen: { body }, params }, res, next) =>
  Food.findById(params.id)
    .then(notFound(res))
    .then((food) => (food ? Object.assign(food, body).save() : null))
    .then((food) => (food ? food.view() : null))
    .then(success(res))
    .catch(next);

export const destroy = ({ params }, res, next) =>
  Food.findById(params.id)
    .then(notFound(res))
    .then((food) => (food ? food.remove() : null))
    .then(success(res, 204))
    .catch(next);
