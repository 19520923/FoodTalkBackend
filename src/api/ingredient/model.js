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
      ingr1: this.ingr1,
      ingr2: this.ingr2,
      npmi: this.npmi,
      jaccard: this.jaccard,
      pmi: this.pmi,
      pmi2: this.pmi2,
      pmi3: this.pmi3,
      ppmi: this.ppmi,
      co_occurence: this.co_occurence,
      ingr1_count: this.ingr1_count,
      ingr2_count: this.ingr2_count,
      lable: this.lable,
      ingr1_type: this.ingr1_type,
      ingr2_type: this.ingr2_type,
      pairing_type: this.pairing_type,
      npmi_normalized: this.npmi_normalized,
      created_at: this.created_at,
      updated_at: this.updated_at,
    };
  },
};

ingredientSchema.plugin(mongooseKeywords, { paths: ["ingr1"] });

const model = mongoose.model("Ingredient", ingredientSchema);

export const schema = model.schema;
export default model;
