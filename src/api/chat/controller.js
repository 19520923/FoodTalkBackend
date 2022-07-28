import { success, notFound } from "../../services/response/";
import { Chat } from ".";
import { User } from "../user";

export const create = ({ user, params }, res, next) =>
  Chat.create({
    user_1: user,
    user_2: params.id,
  })
    .then((chat) => {
      User.findById(params.id).then(to("chat:create", chat));
      return chat.view();
    })
    .then(success(res, 201))
    .catch(next);

export const index = (
  { user, querymen: { query, select, cursor } },
  res,
  next
) =>
  Chat.count({ ...query, $or: [{ user_1: user.id }, { user_2: user.id }] })
    .then((count) =>
      Chat.find(
        { ...query, $or: [{ user_1: user.id }, { user_2: user.id }] },
        select,
        cursor
      )
        .sort("-updated_at")
        .then((chats) => ({
          count,
          rows: chats.map((chat) => chat.view()),
        }))
    )
    .then(success(res))
    .catch(next);

export const destroy = ({ params }, res, next) =>
  Chat.findById(params.id)
    .then(notFound(res))
    .then((chat) => (chat ? chat.remove() : null))
    .then(success(res, 204))
    .catch(next);

export const seenChat = ({ params, user }, res, next) =>
  Chat.findById(params.id)
    .then(notFound(res))
    .then((chat) => chat.seen(user))
    .then(to("chat:seen", user))
    .success(res)
    .catch(next);
