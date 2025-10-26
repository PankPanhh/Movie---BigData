// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    password: String, // Định nghĩa trường password để có thể loại trừ nó
  },
  {
    collection: "users", // Chỉ định Mongoose dùng đúng collection 'users'
  }
);

export default mongoose.model("User", userSchema);