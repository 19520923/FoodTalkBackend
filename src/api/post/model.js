import mongoose, { Schema } from 'mongoose'

const postSchema = new Schema(
  {
    foods: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Food',
        default: []
      }
    ],

    content: {
      type: String,
      trim: true
    },

    photos: [
      {
        type: String,
        default: []
      }
    ],

    reactions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],

    num_comment: {
      type: Number,
      default: 0
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },

    location: {
      name: {
        type: String,
        default: ''
      },
      lat: {
        type: String,
        default: ''
      },
      lng: {
        type: String,
        default: ''
      }
    },

    is_public: {
      type: Boolean,
      default: true
    },

    is_active: {
      type: Boolean,
      default: true
    },

    num_report: {
      type: Boolean,
      default: 0
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
)

postSchema.pre(/^find/, function (next) {
  if (this.options._recursed) {
    return next()
  }
  this.populate({
    path: 'author foods',
    options: { _recursed: true },
    populate: { path: 'author', options: { _recursed: true } }
  })
  next()
})

postSchema.post(/^save/, async function (child) {
  try {
    if (!child.populated('author foods')) {
      await child
        .populate({
          path: 'author foods',
          options: { _recursed: true },
          populate: { path: 'author', options: { _recursed: true } }
        })
        .execPopulate()
    }
  } catch (err) {
    console.log(err)
  }
})

postSchema.methods = {
  view () {
    return {
      // simple view
      _id: this.id,
      author: this.author.view(),
      foods: this.foods.map((food) => food.view()),
      content: this.content,
      photos: this.photos,
      reactions: this.reactions,
      num_comment: this.num_comment,
      num_heart: this.num_heart,
      location: this.location,
      is_public: this.is_public,
      created_at: this.created_at,
      updated_at: this.updated_at,
      is_active: this.is_active,
      num_report: this.num_report
    }
  },

  likeDislike (user_id) {
    if (!this.reactions.includes(user_id)) {
      this.reactions.push(user_id)
    } else {
      this.reactions.splice(this.reactions.indexOf(user_id), 1)
    }

    this.save()
    return {
      _id: this._id,
      reactions: this.reactions
    }
  }
}

const model = mongoose.model('Post', postSchema)

export const schema = model.schema
export default model
