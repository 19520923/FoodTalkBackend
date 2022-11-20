import mongoose, { Schema } from 'mongoose'
import { User } from '../user'

const userBlockListSchema = new Schema({
  author: {
    type: Schema.ObjectId,
    ref: 'User',
    required: true
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  reason: {
    type: String
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
})

userBlockListSchema.pre(/^find/, function (next) {
  if (this.options._recursed) {
    return next()
  }
  this.populate({
    path: 'author',
    options: { _recursed: true }
  })
  next()
})

userBlockListSchema.post(/^save/, async function (child) {
  await User.findOneAndUpdate({ _id: child.user }, { $inc: { num_report: 1 } }).then(user => {
    if (user.num_report >= 5) {
      user.set({ is_active: false }).save()
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

userBlockListSchema.methods = {
  view () {
    return {
      // simple view
      _id: this.id,
      author: this.author.view(),
      user: this.user,
      reason: this.reason,
      created_at: this.created_at,
      updated_at: this.updated_at
    }
  }
}

const model = mongoose.model('UserBlockList', userBlockListSchema)

export const schema = model.schema
export default model
