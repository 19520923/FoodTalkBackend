import mongoose, { Schema } from 'mongoose'
import mongooseKeywords from 'mongoose-keywords'
import { Notification } from '../notification'
import { User } from '../user'
import { toAll, to } from '../../services/socket'

const foodSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      index: true
    },
    ingredients: [
      {
        type: String,
        default: [],
        required: true
      }
    ],
    recipe: [
      {
        type: String,
        default: [],
        required: true
      }
    ],
    score: {
      type: Number,
      default: 0
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    photo: {
      type: String,
      default: ''
    },
    num_rate: {
      type: Number,
      default: 0
    },
    is_active: {
      type: Boolean,
      default: true
    },
    num_report: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
)

foodSchema.path('is_active').set(async function (is_active) {
  if (is_active === false) {
    const notification = await Notification.create({
      author: this.author,
      content: `${this.id} has unblocked, everyone can see it`,
      type: 'SYSTEM',
      post_data: this,
      receiver: this.author
    }).then((notification) => (notification ? notification.view() : null))

    await User.findById(this.author).then((user) =>
      /* `to` is a function that takes a socket event and a data and sends it to a specific user. */
      to('notification:create', notification, user)
    )

    toAll('food:deactivate', this)
  }

  return is_active
})

foodSchema.pre(/^find/, function (next) {
  if (this.options._recursed) {
    return next()
  }
  this.populate({
    path: 'author',
    options: { _recursed: true }
  })
  next()
})

foodSchema.pre(/^save/, function (next) {
  if (this.num_report >= 5) {
    this.is_active = false
  }
  next()
})

foodSchema.post(/^save/, async function (child) {
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

foodSchema.methods = {
  view () {
    return {
      // simple view
      _id: this.id,
      name: this.name,
      ingredients: this.ingredients,
      recipe: this.recipe,
      score: this.score,
      author: this.author.view(),
      photo: this.photo,
      num_rate: this.num_rate,
      created_at: this.created_at,
      is_active: this.is_active,
      num_report: this.num_report
    }
  }
}

foodSchema.plugin(mongooseKeywords, { paths: ['name'] })

const model = mongoose.model('Food', foodSchema)

export const schema = model.schema
export default model
