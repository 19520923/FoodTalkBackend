import mongoose, { Schema } from "mongoose";
import mongooseKeywords from "mongoose-keywords";

const ingredientSchema = new Schema(
  {
    ingr: {
      type: String,
    }
  },
);

ingredientSchema.methods = {
  view() {
    return {
      // simple view
      _id: this.id,
      ingr: this.ingr
    };
  },
};

ingredientSchema.plugin(mongooseKeywords, { paths: ["ingr"] });

const model = mongoose.model("Ingredient", ingredientSchema);

export const schema = model.schema;
export default model;
