import mongoose, { Schema } from 'mongoose'
import mongooseKeywords from 'mongoose-keywords'

const chatSchema = new Schema(
  {
    user_1: {
      type: Schema.ObjectId,
      ref: 'User',
      required: true
    },
    user_2: {
      type: Schema.ObjectId,
      ref: 'User',
      required: true
    },
    is_seen: {
      type: Boolean,
      default: false
    },
    last_message: {
      type: Schema.ObjectId,
      ref: 'Message'
    }
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
)

chatSchema.pre(/^find/, function (next) {
  if (this.options._recursed) {
    return next()
  }
  this.populate({
    path: 'user_1 user_2 last_message',
    options: { _recursed: true }
  })
  next()
})

chatSchema.post(/^save/, async function (child) {
  try {
    if (!child.populated('user_1 user_2 last_message')) {
      await child
        .populate({
          path: 'user_1 user_2 last_message',
          options: { _recursed: true }
        })
        .execPopulate()
    }
  } catch (err) {
    console.log(err)
  }
})

chatSchema.methods = {
  view () {
    return {
      // simple view
      _id: this.id,
      user_1: this.user_1.view(),
      user_2: this.user_2.view(),
      is_seen: this.is_seen,
      last_message: this.last_message?.view(),
      created_at: this.created_at,
      updated_at: this.updated_at
    }
  },

  getU (user) {
    return this.user_1._id === user.id ? this.user_2 : this.user_1
  }
}

chatSchema.plugin(mongooseKeywords, { paths: ['user_1', 'user_2'] })

const model = mongoose.model('Chat', chatSchema)

export const schema = model.schema
export default model
