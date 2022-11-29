import mongoose, { Schema } from 'mongoose'
import { Post } from '../post'
import { fields } from '../user/model'

const postCommentSchema = new Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true
    },

    content: {
      type: String,
      trim: true,
      required: true
    },

    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PostComment'
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: {
      virtuals: true
    },
    toObject: {
      virtuals: true
    }
  }
)

postCommentSchema.pre(/^find/, function (next) {
  if (this.options._recursed) {
    return next()
  }
  this.populate({
    path: 'author children',
    options: { _recursed: true },
    populate: { path: 'author', select: fields }
  })
  next()
})

postCommentSchema.post(/^save/, async function (child) {
  try {
    await Post.updateOne({ _id: child.post }, { $inc: { num_comment: 1 } })

    if (!child.populated('author')) {
      await child
        .populate({
          path: 'author',
          options: { _recursed: true },
        })
        .execPopulate()
    }
  } catch (err) {
    console.log(err)
  }
})

postCommentSchema.post(/^remove/, async function (child) {
  try {
    await Post.updateOne({ _id: this.post }, { $dec: { num_comment: 1 } })
  } catch (err) {
    console.log(err)
  }
})

postCommentSchema.virtual('children', {
  ref: 'PostComment',
  localField: '_id',
  foreignField: 'parent',
  sort: { created_at: 1 }
})

postCommentSchema.methods = {
  view () {
    return {
      // simple view
      _id: this.id,
      author: this.author.view(),
      post: this.post,
      content: this.content,
      created_at: this.created_at,
      updated_at: this.updated_at,
      children: this.children,
      parent: this.parent
    }
  }
}

const model = mongoose.model('PostComment', postCommentSchema)

export const schema = model.schema
export default model
