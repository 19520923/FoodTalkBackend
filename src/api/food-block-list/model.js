import mongoose, { Schema } from 'mongoose'
import { to } from '../../services/socket'
import { Food } from '../food'
import { Notification } from '../notification'
import { User } from '../user'

const foodBlockListSchema = new Schema({
  author: {
    type: Schema.ObjectId,
    ref: 'User',
    required: true
  },
  food: {
    type: Schema.ObjectId,
    ref: 'Food'
  },
  reason: {
    type: String
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
})

foodBlockListSchema.pre(/^find/, function (next) {
  if (this.options._recursed) {
    return next()
  }
  this.populate({
    path: 'author',
    options: { _recursed: true }
  })
  next()
})

foodBlockListSchema.post(/^save/, async function (child) {
  await Food.findOneAndUpdate({ _id: child.food }, { $inc: { num_report: 1 } }).then(async (food) => {
    if (food.num_report >= 5) {
      food.set({ is_active: false }).save()
      const notification = await Notification.create({
        author: food.author,
        content: `${food.id} has unblocked, everyone can see it`,
        type: 'SYSTEM',
        receiver: food.author
      }).then((notification) => (notification ? notification.view() : null))

      await User.findById(food.author).then((user) =>
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

foodBlockListSchema.methods = {
  view () {
    return {
      // simple view
      _id: this.id,
      author: this.author.view(),
      food: this.food.view(),
      reason: this.reason,
      created_at: this.created_at,
      updated_at: this.updated_at
    }
  }
}

const model = mongoose.model('FoodBlockList', foodBlockListSchema)

export const schema = model.schema
export default model
