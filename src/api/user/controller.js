import { success, notFound } from "../../services/response/";
import { User } from ".";
import { sign } from "../../services/jwt";
import { to } from "../../services/socket";

export const index = ({ querymen: { query, select, cursor } }, res, next) =>
  User.count(query)
    .then((count) =>
      User.find(query, select, cursor).then((users) => ({
        rows: users.map((user) => user.view()),
        count,
      }))
    )
    .then(success(res))
    .catch(next);

export const show = ({ params }, res, next) =>
  User.findById(params.id)
    .then(notFound(res))
    .then((user) => (user ? user.view() : null))
    .then(success(res))
    .catch(next);

export const showMe = ({ user }, res) => res.json(user.view());

export const create = ({ bodymen: { body } }, res, next) =>
  User.create(body)
    .then((user) => {
      sign(user.id)
        .then((token) => ({ token, user: user.view() }))
        .then(success(res, 201));
    })
    .catch((err) => {
      /* istanbul ignore else */
      if (err.name === "MongoError" && err.code === 11000) {
        res.status(409).json({
          valid: false,
          param: "email",
          message: "email already registered",
        });
      } else {
        next(err);
      }
    });

export const update = ({ bodymen: { body }, params, user }, res, next) =>
  User.findById(params.id === "me" ? user.id : params.id)
    .then(notFound(res))
    .then((result) => {
      if (!result) return null;
      const isAdmin = user.role === "admin";
      const isSelfUpdate = user.id === result.id;
      if (!isSelfUpdate && !isAdmin) {
        res.status(401).json({
          valid: false,
          message: "You can't change other user's data",
        });
        return null;
      }
      return result;
    })
    .then((user) => (user ? Object.assign(user, body).save() : null))
    .then((user) => (user ? user.view() : null))
    .then(success(res))
    .catch(next);

export const updatePassword = (
  { bodymen: { body }, params, user },
  res,
  next
) =>
  User.findById(params.id === "me" ? user.id : params.id)
    .then(notFound(res))
    .then((result) => {
      if (!result) return null;
      const isSelfUpdate = user.id === result.id;
      if (!isSelfUpdate) {
        res.status(401).json({
          valid: false,
          param: "password",
          message: "You can't change other user's password",
        });
        return null;
      }
      return result;
    })
    .then((user) =>
      user ? user.set({ password: body.password }).save() : null
    )
    .then((user) => (user ? user.view() : null))
    .then(success(res))
    .catch(next);

export const destroy = ({ params }, res, next) =>
  User.findById(params.id)
    .then(notFound(res))
    .then((user) => (user ? user.remove() : null))
    .then(success(res, 204))
    .catch(next);

export const follow = ({ params, user }, res, next) => {
  User.findById(params.id)
    .then(notFound(res))
    .then((result) => {
      if (!result) return null;
      if (user.id === params.id) {
        res.status(401).json({
          error: "Follow failed",
          message: "You can't follow yourself",
        });
        return null;
      }

      if (result.follower.includes(user)) {
        res.status(401).json({
          error: "Follow failed",
          message: "Already followed",
        });
        return null;
      }
      return result;
    })
    .then((u) => (u ? u.follow(user.id) : null))
    .then((u) => (u ? u.view() : null))
    .then(to("user:follow", user))
    .then(success(res))
    .catch(next);
};

export const unfollow = ({ params, user }, res, next) => {
  User.findById(params.id)
    .then(notFound(res))
    .then((result) => {
      if (!result) return null;
      if (user.id === params.id) {
        res.status(401).json({
          error: "Follow failed",
          message: "You can't unfollow yourself",
        });
        return null;
      }

      if (!result.follower.includes(user)) {
        res.status(401).json({
          error: "Follow failed",
          message: "Already unfollowed",
        });
        return null;
      }
      return result;
    })
    .then((u) => (u ? u.unfollow(user.id) : null))
    .then((u) => (u ? u.view() : null))
    .then(success(res))
    .catch(next);
};
