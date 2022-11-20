import mongoose, { Schema } from 'mongoose'
import { Food } from '../food'

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
  await Food.updateOne({ _id: child.food }, { $inc: { num_report: 1 } })

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
