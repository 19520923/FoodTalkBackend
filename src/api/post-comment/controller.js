import { success, notFound, authorOrAdmin } from '../../services/response/'
import { PostComment } from '.'
import { toAll, to } from '../../services/socket'
import { Notification } from '../notification'

export const create = ({ user, bodymen: { body } }, res, next) =>
  PostComment.create({ ...body, author: user })
    .then(async (postComment) => {
      if (user.id != postComment.post.author._id) {
        const notification = await Notification.create({
          author: user,
          content: `${user.username} has commented on your post`,
          type: 'POST',
          post_data: postComment.post,
          receiver: postComment.post.author
        }).then((notification) => (notification ? notification.view() : null))

        to('notification:create', notification, postComment.post.author)
      }

      return postComment.view()
    })
    .then((postComment) => toAll('post-comment:create', postComment))
    .then(success(res))
    .catch(next)

export const index = ({ params, querymen: { query, select, cursor } }, res, next) =>
  PostComment.count({ ...query, post: params.id })
    .then(count => PostComment.find({ ...query, post: params.id }, select, cursor)
      .then((postComments) => ({
        count,
        rows: postComments.map((postComment) => postComment.view())
      }))
    )
    .then(success(res))
    .catch(next)

export const update = ({ user, bodymen: { body }, params }, res, next) =>
  PostComment.findById(params.id)
    .then(notFound(res))
    .then(authorOrAdmin(res, user, 'author'))
    .then((postComment) => postComment ? Object.assign(postComment, body).save() : null)
    .then((postComment) => postComment ? postComment.view(true) : null)
    .then(success(res))
    .catch(next)

export const destroy = ({ user, params }, res, next) =>
  PostComment.findById(params.id)
    .then(notFound(res))
    .then(authorOrAdmin(res, user, 'author'))
    .then((postComment) => postComment ? postComment.remove() : null)
    .then(success(res, 204))
    .catch(next)
