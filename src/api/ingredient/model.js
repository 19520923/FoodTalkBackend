import mongoose, { Schema } from "mongoose";
import mongooseKeywords from "mongoose-keywords";

const ingredientSchema = new Schema(
  {
    ingr1: {
      type: String,
    },
    ingr2: {
      type: String,
    },
    npmi: {
      type: Number,
    },
    jaccard: {
      type: Number,
    },
    pmi: {
      type: Number,
    },
    pmi2: {
      type: Number,
    },
    pmi3: {
      type: Number,
    },
    ppmi: {
      type: Number,
    },
    co_occurence: {
      type: Number,
    },
    ingr1_count: {
      type: Number,
    },
    ingr2_count: {
      type: Number,
    },
    lable: {
      type: String,
    },
    ingr1_type: {
      type: String,
    },
    ingr2_type: {
      type: String,
    },
    pairing_type: {
      type: String,
    },
    npmi_normalized: {
      type: Number,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

ingredientSchema.methods = {
  view() {
    return {
      // simple view
      _id: this.id,
      ingr: this.ingr2,
      score: this.npmi,
      type: this.ingr2_type,
    };
  },
};

ingredientSchema.plugin(mongooseKeywords, { paths: ["ingr2"] });

const model = mongoose.model("Ingredient", ingredientSchema);

export const schema = model.schema;
export default model;
