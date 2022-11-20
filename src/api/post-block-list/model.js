import mongoose, { Schema } from 'mongoose'
import { Post } from '../post'
import { Notification } from '../notification'
import { User } from '../user'
import { to, toAll } from '../../services/socket'

const blockListSchema = new Schema({
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  },
  reason: {
    type: String
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
})

blockListSchema.pre(/^find/, function (next) {
  if (this.options._recursed) {
    return next()
  }
  this.populate({
    path: 'author',
    options: { _recursed: true }
  })
  next()
})

blockListSchema.post(/^save/, async function (child) {
  await Post.findOneAndUpdate({ _id: child.post }, { $inc: { num_report: 1 } }).then(async (post) => {
    if (post.num_report >= 5) {
      post.set({ is_active: false }).save()
      const notification = await Notification.create({
        author: post.author,
        content: `${post.id} has unblocked, everyone can see it`,
        type: 'SYSTEM',
        receiver: post.author
      }).then((notification) => (notification ? notification.view() : null))

      await User.findById(post.author).then((user) =>
      /* `to` is a function that takes a socket event and a data and sends it to a specific user. */
        to('notification:create', notification, user)
      )
    }
  })
  try {
    if (!child.populated('author')) {
      await child
        .populate({
          path: 'author',
          options: { _recursed: true }
        })
        .execPopulate()
    }
  } catch (err) {
    console.log(err)
  }
})

blockListSchema.methods = {
  view () {
    return {
      // simple view
      _id: this.id,
      post: this.post,
      reason: this.reason,
      author: this.author.view(),
      created_at: this.created_at,
      updatedAt: this.updated_at

    }
  }
}

const model = mongoose.model('BlockList', blockListSchema)

export const schema = model.schema
export default model
