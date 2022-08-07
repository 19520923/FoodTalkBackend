import mongoose, { Schema } from "mongoose";
import { Food } from "../food";

const foodRateSchema = new Schema(
  {
    author: {
      type: Schema.ObjectId,
      ref: "User",
      required: true,
    },
    food: {
      type: Schema.ObjectId,
      ref: "Food",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    score: {
      type: Number,
      default: 10,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

foodRateSchema.pre(/^find/, function (next) {
  if (this.options._recursed) {
    return next();
  }
  this.populate({
    path: "author food",
    options: { _recursed: true },
  });
  next();
});

foodRateSchema.post(/^save/, async function (child) {
  try {
    await Food.updateOne(
      { _id: child.food },
      { $inc: { num_rate: 1, score: child.score } }
    );

    if (!child.populated("author food")) {
      await child.populate("author food").execPopulate();
    }

  } catch (err) {
    console.log(err);
  }
});

foodRateSchema.methods = {
  view() {
    return {
      // simple view
      _id: this.id,
      author: this.author.view(),
      food: this.food.view(),
      content: this.content,
      score: this.score,
      created_at: this.created_at,
      updated_at: this.updated_at,
    };
  },
};

const model = mongoose.model("FoodRate", foodRateSchema);

export const schema = model.schema;
export default model;
