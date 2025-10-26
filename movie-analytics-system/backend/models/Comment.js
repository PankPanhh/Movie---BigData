// models/Comment.js
import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    text: String,
    name: String,
    email: String,
    date: Date,
    // Đây là phần quan trọng: Liên kết comment với movie
    movie_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie", // Tham chiếu đến model 'Movie'
    },
  },
  {
    collection: "comments", // Đảm bảo Mongoose dùng đúng collection
  }
);

export default mongoose.model("Comment", commentSchema);