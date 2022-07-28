import { success, notFound, authorOrAdmin } from "../../services/response/";
import { Food } from ".";
import { toAll, to } from "../../services/socket";
import { Notification } from "../notification";
import { User } from "../user";

export const create = ({ user, bodymen: { body } }, res, next) =>
  Food.create({
    author: user.id,
    name: body.name,
    ingredients: body.ingredients,
    recipe: body.recipe,
  })
    .then((food) => food.view())
    .then(toAll("food:create"))
    .then(async (food) => {
      food.author.follower.forEach(async (follower) => {
        const notification = await Notification.create({
          author: food.author,
          content: `${food.author.username} has added new food recipe`,
          type: "FOOD",
          food_data: food,
          receiver: follower,
        }).then((notification) => (notification ? notification.view() : null));

        await User.findById(follower.id).then(
          to("notification:create", notification)
        );
      });

      return food;
    })
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
  { user, params, querymen: { query, select, cursor } },
  res,
  next
) =>
  Food.count(
    { author: params.id === "me" ? user.id : params.id },
    query,
    select,
    cursor
  )
    .then((count) =>
      Food.find({ author: params.id === "me" ? user.id : params.id  }, query, select, cursor).then((foods) => ({
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

export const update = ({ bodymen: { body }, user, params }, res, next) =>
  Food.findById(params.id)
    .then(notFound(res))
    .then(authorOrAdmin(res, user, "author"))
    .then((food) => (food ? Object.assign(food, body).save() : null))
    .then((food) => (food ? food.view() : null))
    .then(success(res))
    .catch(next);

export const destroy = ({ params }, res, next) =>
  Food.findById(params.id)
    .then(notFound(res))
    .then(authorOrAdmin(res, user, "author"))
    .then((food) => (food ? food.remove() : null))
    .then(success(res, 204))
    .catch(next);
