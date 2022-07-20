import { success, notFound, authorOrAdmin } from "../../services/response/";
import { Post } from ".";
import { Notification } from "../notification";
import { User } from "../user";
import { toAll } from "../../services/socket";

export const create = ({ user, bodymen: { body } }, res, next) =>
  Post.create({ ...body, author: user })
    .then((post) => post.view())
    .then(toAll("post:create"))
    .then((post) => {
      post.author.follower.forEach(async (follower) => {
        const notification = await Notification.create({
          author: post.author,
          content: `${post.author.username} has added new  post`,
          type: "POST",
          post_data: post,
          receiver: follower,
        }).then((notification) => (notification ? notification.view() : null));

        await User.findById(follower.id).then(
          to("notification:create", notification)
        );
      });
      return post;
    })
    .then(success(res, 201))
    .catch(next);

export const index = ({ querymen: { query, select, cursor } }, res, next) =>
  Post.count(query)
    .then((count) =>
      Post.find(query, select, cursor).then((posts) => ({
        count,
        rows: posts.map((post) => post.view()),
      }))
    )
    .then(success(res))
    .catch(next);

export const showUser = (
  { parmas, querymen: { query, select, cursor } },
  res,
  next
) =>
  Post.count({ ...query, author: parmas.id })
    .then((count) =>
      Post.find({ ...query, author: parmas.id }, select, cursor).sort('-created_at').then(
        (posts) => ({
          count,
          rows: posts.map((post) => post.view()),
        })
      )
    )
    .then(success(res))
    .catch(next);

export const show = ({ params }, res, next) =>
  Post.findById(params.id)
    .then(notFound(res))
    .then((post) => (post ? post.view() : null))
    .then(success(res))
    .catch(next);

export const update = ({ user, bodymen: { body }, params }, res, next) =>
  Post.findById(params.id)
    .then(notFound(res))
    .then(authorOrAdmin(res, user, "author"))
    .then((post) => (post ? Object.assign(post, body).save() : null))
    .then((post) => (post ? post.view(true) : null))
    .then(success(res))
    .catch(next);

export const destroy = ({ user, params }, res, next) =>
  Post.findById(params.id)
    .then(notFound(res))
    .then(authorOrAdmin(res, user, "author"))
    .then((post) => (post ? post.remove() : null))
    .then(success(res, 204))
    .catch(next);

export const likeDislike = ({ user, params }, res, next) => {
  Post.findById(params.id)
    .then(notFound(res))
    .then((post) => (post ? post.likeDislike(user.id) : null))
    .then(toAll('post-reactions:likeDislike'))
    .then(success(res))
    .catch(next);
};

export const showLike = ({ user, params }, res, next) => {
  Post.findById(params.id)
    .populate("reactions")
    .then(notFound(res))
    .then((post) =>
      post
        ? { reactions: post.reactions.map((reaction) => reaction.view()) }
        : null
    )
    .then(success(res))
    .catch(next);
};
