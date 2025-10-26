import mongoose from "mongoose";

const movieSchema = new mongoose.Schema(
  {
    title: String,
    year: Number,

    // 1. Sửa từ 'genre: String' thành 'genres: [String]' (mảng các chuỗi)
    genres: [String],

    // 2. 'rating' nằm bên trong đối tượng 'imdb'
    imdb: {
      rating: Number,
      // votes: Number, // Bạn có thể thêm các trường khác nếu cần
      // id: Number
    },
    
    // Thêm trường poster để hiển thị ảnh nếu muốn
    poster: String, 
  },
  {
    // 3. Chỉ định Mongoose sử dụng đúng collection 'movies'
    // Nếu không có dòng này, Mongoose có thể sẽ tìm collection 'movie' (số ít)
    collection: "movies",
  }
);

export default mongoose.model("Movie", movieSchema);