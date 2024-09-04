import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  nickname: {
    type: String,
    required: true,
  },
});

export default mongoose.model("Users", userSchema);
