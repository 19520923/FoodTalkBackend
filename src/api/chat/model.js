import mongoose, { Schema } from "mongoose";
import mongooseKeywords from "mongoose-keywords";

const chatSchema = new Schema(
  {
    user_1: {
      type: Schema.ObjectId,
      ref: "User",
      required: true,
    },
    user_2: {
      type: Schema.ObjectId,
      ref: "User",
      required: true,
    },
    is_user_1_seen: {
      type: Boolean,
      default: false,
    },
    is_user_2_seen: {
      type: Boolean,
      default: false,
    },
    last_message: {
      type: Schema.ObjectId,
      ref: "Message",
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

chatSchema.pre(/^find/, function (next) {
  if (this.options._recursed) {
    return next();
  }
  this.populate({
    path: "user_1 user_2 last_message",
    options: { _recursed: true },
  });
  next();
});

chatSchema.post(/^save/, async function (child) {
  try {
    if (!child.populated("user_1 user_2 last_message")) {
      await child.populate("user_1 user_2 last_message").execPopulate();
    }
  } catch (err) {
    console.log(err);
  }
});

chatSchema.methods = {
  view() {
    return {
      // simple view
      _id: this.id,
      user_1: this.user_1.view(),
      user_2: this.user_2.view(),
      is_user_1_seen: this.is_user_1_seen,
      is_user_2_seen: this.is_user_2_seen,
      last_message: this.last_message?.view(),
      created_at: this.created_at,
      updated_at: this.updated_at,
    };
  },

  seen(user) {
    if (this.user_1.id === user.id) {
      this.set({ is_user_1_seen: true }).save();
      return this.user_2;
    }
    this.set({ is_user_2_seen: true }).save();
    return this.user_1;
  },

  getU(user) {
    return this.user_1.id === user.id ? this.user_2 : this.user_1;
  },
};

chatSchema.plugin(mongooseKeywords, { paths: ["user_1", "user_2"] });

const model = mongoose.model("Chat", chatSchema);

export const schema = model.schema;
export default model;
