import mongoose, { Schema } from 'mongoose'
import mongooseKeywords from 'mongoose-keywords'
import { Chat } from '../chat'

const messageSchema = new Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chat',
      required: true
    },
    content: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['TEXT', 'HTML', 'PICTURE'],
      default: 'TEXT'
    }
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
)

messageSchema.pre(/^find/, function (next) {
  if (this.options._recursed) {
    return next()
  }
  this.populate({
    path: 'author chat',
    options: { _recursed: true }
  })
  next()
})

messageSchema.post(/^save/, async function (child) {
  try {
    await Chat.updateOne({ id: child.chat._id }, { last_message: child })

    if (!child.populated('author chat')) {
      await child
        .populate({
          path: 'author chat',
          options: { _recursed: true }
        })
        .execPopulate()
    }
  } catch (err) {
    console.log(err)
  }
})

messageSchema.methods = {
  view () {
    return {
      // simple view
      _id: this.id,
      author: this.author.view(),
      chat: this.chat.id,
      content: this.content,
      type: this.type,
      created_at: this.created_at,
      updated_at: this.updated_at
    }
  }
}

messageSchema.plugin(mongooseKeywords, { paths: ['content'] })

const model = mongoose.model('Message', messageSchema)

export const schema = model.schema
export default model
