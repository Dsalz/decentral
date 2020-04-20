import { Schema, model } from "mongoose";

const userSchema = new Schema({
  address: {
    type: String,
    required: true
  }
});

export default model("Users", userSchema);
