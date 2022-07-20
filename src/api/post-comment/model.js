import mongoose, { Schema } from "mongoose";
import { Post } from "../post";

const postCommentSchema = new Schema(
  {
    author: {
      type: Schema.ObjectId,
      ref: "User",
      required: true,
    },

    post: {
      type: Schema.ObjectId,
      ref: "Post",
      required: true,
    },

    content: {
      type: String,
      trim: true,
      required: true,
    },

    parent: {
      type: Schema.ObjectId,
      ref: "PostComment",
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

postCommentSchema.pre(/^find/, function (next) {
  if (this.options._recursed) {
    return next();
  }
  this.populate({
    path: "author post",
    options: { _recursed: true },
  });
  next();
});

postCommentSchema.post(/^save/, async function (child) {
  try {
    if (!child.populated("author post")) {
      await child.populate("author post").execPopulate();
    }

    await Post.updateOne({ id: child.post }, { $inc: { num_comment: 1 } });
  } catch (err) {
    console.log(err);
  }
});

postCommentSchema.post(/^remove/, async function (child) {
  try {
    await Post.updateOne({ id: this.post }, { $dec: { num_comment: 1 } });
  } catch (err) {
    console.log(err);
  }
});

postCommentSchema.virtual("children", {
  ref: "PostComment",
  localField: "_id",
  foreignField: "parent",
  sort: { created_at: 1 },
});

postCommentSchema.methods = {
  view() {
    return {
      // simple view
      id: this.id,
      author: this.author.view(),
      post: this.post,
      content: this.content,
      parent: this.parent,
      created_at: this.created_at,
      updated_at: this.updated_at,
    };
  },
};

const model = mongoose.model("PostComment", postCommentSchema);

export const schema = model.schema;
export default model;
