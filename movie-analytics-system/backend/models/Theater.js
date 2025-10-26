// models/Theater.js
import mongoose from "mongoose";

const theaterSchema = new mongoose.Schema(
  {
    theaterId: Number,
    location: {
      address: {
        street1: String,
        city: String,
        state: String,
        zipcode: String,
      },
      // Dữ liệu 'geo' chứa tọa độ
      geo: {
        type: { type: String, enum: ["Point"], default: "Point" },
        coordinates: { type: [Number] }, // [longitude, latitude]
      },
    },
  },
  {
    collection: "theaters", // Chỉ định Mongoose dùng đúng collection 'theaters'
  }
);

export default mongoose.model("Theater", theaterSchema);