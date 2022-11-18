import mongoose, { Schema } from "mongoose";
import { fields } from "../user";

const notificationSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["FOOD", "SYSTEM", "POST", "USER"],
      default: "SYSTEM",
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
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
    populate: { path: "follower following", select: fields },
  })
    .populate({
      path: "receiver",
      options: { _recursed: true },
    })
    .populate("post_data food_data");
  next();
});

notificationSchema.post(/^save/, async function (child) {
  try {
    if (!child.populated("author receiver post_data food_data")) {
      await child
        .populate({
          path: "author receiver post_data food_data",
          populate: { path: "follower following", select: fields },
        })
        .execPopulate();
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
      post_data: this.post_data,
      food_data: this.food_data,
      created_at: this.created_at,
      updated_at: this.updated_at,
    };
  },
};

const model = mongoose.model("Notification", notificationSchema);

export const schema = model.schema;
export default model;
