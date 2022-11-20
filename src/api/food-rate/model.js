import mongoose, { Schema } from 'mongoose'
import { Food } from '../food'

const foodRateSchema = new Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    food: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Food',
      required: true
    },
    content: {
      type: String,
      required: true
    },
    score: {
      type: Number,
      default: 10
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
)

foodRateSchema.pre(/^find/, function (next) {
  if (this.options._recursed) {
    return next()
  }
  this.populate({
    path: 'author',
    options: { _recursed: true }
  })
  next()
})

foodRateSchema.post(/^save/, async function (child) {
  try {
    await Food.updateOne(
      { _id: child.food },
      { $inc: { num_rate: 1, score: child.score } }
    )

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

foodRateSchema.methods = {
  view () {
    return {
      // simple view
      _id: this.id,
      author: this.author.view(),
      food: this.food,
      content: this.content,
      score: this.score,
      created_at: this.created_at,
      updated_at: this.updated_at
    }
  }
}

const model = mongoose.model('FoodRate', foodRateSchema)

export const schema = model.schema
export default model
