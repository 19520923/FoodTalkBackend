import mongoose, { Schema } from 'mongoose'
import { Post } from '../post'

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
  await Post.updateOne({ _id: child.post }, { $inc: { num_report: 1 } })
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
