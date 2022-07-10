import mongoose, { Schema } from "mongoose";

const notificationSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["FOOD", "SYSTEM", "POST", "USER"],
      default: "SYSTEM",
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    destination: {
      type: String,
    },
    is_seen: {
      type: Boolean,
      default: false,
    },
    content: {
      type: String,
    },
    post_data: {
      type: Schema.Types.ObjectId,
      ref: "Post",
    },
    food_data: {
      type: Schema.Types.ObjectId,
      ref: "Food",
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

notificationSchema.pre(/^find/, function (next) {
  if (this.options._recursed) {
    return next();
  }
  this.populate({
    path: "author",
    options: { _recursed: true },
  }).populate({
    path: "receiver",
    options: { _recursed: true },
  });
  next();
});

notificationSchema.post(/^save/, async function (child) {
  try {
    if (!child.populated("author receiver")) {
      await child.populate("author").populate("receiver").execPopulate();
    }
  } catch (err) {}
});

notificationSchema.methods = {
  view() {
    return {
      // simple view
      _id: this.id,
      type: this.type,
      author: this.author.view(),
      receiver: this.receiver.view(),
      destination: this.destination,
      is_seen: this.is_seen,
      content: this.content,
      data: this.data,
      created_at: this.created_at,
      updated_at: this.updated_at,
    };
  },
};

const model = mongoose.model("Notification", notificationSchema);

export const schema = model.schema;
export default model;
