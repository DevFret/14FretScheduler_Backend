import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  refreshToken: {
    type: String,
    required: true,
  },
});

export default mongoose.model("RefreshToken", refreshTokenSchema);
