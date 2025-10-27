// scripts/seedLargeDataset.js
import mongoose from "mongoose";
import { faker } from "@faker-js/faker";
import Movie from "../models/Movie.js";
import User from "../models/User.js";
import Theater from "../models/Theater.js";
import Comment from "../models/Comment.js";

const MOVIE_GENRES = [
  "Action",
  "Adventure",
  "Animation",
  "Biography",
  "Comedy",
  "Crime",
  "Documentary",
  "Drama",
  "Family",
  "Fantasy",
  "Film-Noir",
  "History",
  "Horror",
  "Music",
  "Musical",
  "Mystery",
  "Romance",
  "Sci-Fi",
  "Sport",
  "Thriller",
  "War",
  "Western",
];

const THEATER_CITIES = [
  "Hà Nội",
  "Hồ Chí Minh",
  "Đà Nẵng",
  "Cần Thơ",
  "Hải Phòng",
  "Biên Hòa",
  "Vũng Tàu",
  "Quy Nhơn",
  "Nha Trang",
  "Huế",
];

async function generateMovies(count = 5000) {
  console.log(`🎬 Tạo ${count} phim mẫu...`);

  const movies = [];
  for (let i = 0; i < count; i++) {
    // Random year from 1950 to 2024
    const year = faker.number.int({ min: 1950, max: 2024 });

    // Random genres (1-4 genres per movie)
    const numGenres = faker.number.int({ min: 1, max: 4 });
    const genres = faker.helpers.arrayElements(MOVIE_GENRES, numGenres);

    // Random rating
    const rating = faker.number.float({ min: 1.0, max: 10.0, precision: 0.1 });

    const movie = {
      title: faker.lorem.words({ min: 2, max: 6 }),
      year: year,
      genres: genres,
      imdb: {
        rating: rating,
      },
      poster: faker.image.url({ width: 300, height: 450 }),
    };

    movies.push(movie);

    if (i % 1000 === 0) {
      console.log(`  Đã tạo ${i} phim...`);
    }
  }

  // Insert in batches to avoid memory issues
  const batchSize = 1000;
  for (let i = 0; i < movies.length; i += batchSize) {
    const batch = movies.slice(i, i + batchSize);
    await Movie.insertMany(batch);
    console.log(
      `  Đã chèn batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
        movies.length / batchSize
      )}`
    );
  }

  console.log(`✅ Đã tạo ${count} phim thành công!`);
  return movies.length;
}

async function generateUsers(count = 2000) {
  console.log(`👥 Tạo ${count} người dùng mẫu...`);

  const users = [];
  for (let i = 0; i < count; i++) {
    const user = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      role: faker.helpers.arrayElement(["user", "admin"]),
    };
    users.push(user);
  }

  await User.insertMany(users);
  console.log(`✅ Đã tạo ${count} người dùng thành công!`);
  return users;
}

async function generateTheaters(count = 50) {
  console.log(`🏛️  Tạo ${count} rạp chiếu phim mẫu...`);

  const theaters = [];
  for (let i = 0; i < count; i++) {
    const theater = {
      name: `${faker.company.name()} Cinema`,
      location: {
        address: faker.location.streetAddress(),
        city: faker.helpers.arrayElement(THEATER_CITIES),
        coordinates: {
          lat: faker.location.latitude(),
          lng: faker.location.longitude(),
        },
      },
      capacity: faker.number.int({ min: 100, max: 500 }),
      facilities: faker.helpers.arrayElements(
        ["3D", "IMAX", "Dolby Atmos", "VIP Lounge", "Parking"],
        faker.number.int({ min: 1, max: 3 })
      ),
    };
    theaters.push(theater);
  }

  await Theater.insertMany(theaters);
  console.log(`✅ Đã tạo ${count} rạp chiếu phim thành công!`);
  return theaters;
}

async function generateComments(movieIds, userIds, count = 10000) {
  console.log(`💬 Tạo ${count} bình luận mẫu...`);

  const comments = [];
  for (let i = 0; i < count; i++) {
    const comment = {
      movieId: faker.helpers.arrayElement(movieIds),
      userId: faker.helpers.arrayElement(userIds),
      content: faker.lorem.sentences({ min: 1, max: 3 }),
      rating: faker.number.int({ min: 1, max: 10 }),
      createdAt: faker.date.past({ years: 2 }),
    };
    comments.push(comment);
  }

  // Insert in batches
  const batchSize = 2000;
  for (let i = 0; i < comments.length; i += batchSize) {
    const batch = comments.slice(i, i + batchSize);
    await Comment.insertMany(batch);
    console.log(
      `  Đã chèn batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
        comments.length / batchSize
      )}`
    );
  }

  console.log(`✅ Đã tạo ${count} bình luận thành công!`);
  return comments.length;
}

async function clearExistingData() {
  console.log("🗑️  Xóa dữ liệu cũ...");
  await Promise.all([
    Movie.deleteMany({}),
    User.deleteMany({}),
    Theater.deleteMany({}),
    Comment.deleteMany({}),
  ]);
  console.log("✅ Đã xóa dữ liệu cũ!");
}

async function createIndexes() {
  console.log("🔍 Tạo indexes cho performance...");

  // Movie indexes
  await Movie.collection.createIndex({ year: 1 });
  await Movie.collection.createIndex({ genres: 1 });
  await Movie.collection.createIndex({ "imdb.rating": -1 });
  await Movie.collection.createIndex({ year: 1, genres: 1 }); // Compound index

  // User indexes
  await User.collection.createIndex({ email: 1 }, { unique: true });

  // Theater indexes
  await Theater.collection.createIndex({ "location.city": 1 });

  // Comment indexes
  await Comment.collection.createIndex({ movieId: 1 });
  await Comment.collection.createIndex({ userId: 1 });
  await Comment.collection.createIndex({ createdAt: -1 });

  console.log("✅ Đã tạo indexes!");
}

async function seedDatabase() {
  try {
    console.log("🌱 Bắt đầu seed database...\n");

    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/movie-analytics"
    );
    console.log("📡 Đã kết nối MongoDB\n");

    // Clear existing data
    await clearExistingData();

    // Generate data
    const movieCount = await generateMovies(5000);
    const users = await generateUsers(2000);
    const theaters = await generateTheaters(50);
    const commentCount = await generateComments(
      (await Movie.find({}, "_id")).map((m) => m._id),
      users.map((u) => u._id),
      10000
    );

    // Create indexes
    await createIndexes();

    console.log("\n🎉 Hoàn thành seed database!");
    console.log("📊 Thống kê:");
    console.log(`   - ${movieCount} phim`);
    console.log(`   - ${users.length} người dùng`);
    console.log(`   - ${theaters.length} rạp chiếu phim`);
    console.log(`   - ${commentCount} bình luận`);
    console.log("\n💡 Mẹo: Chạy lại script này để tạo thêm dữ liệu!");
  } catch (error) {
    console.error("❌ Lỗi:", error);
  } finally {
    await mongoose.disconnect();
    console.log("👋 Đã ngắt kết nối MongoDB");
  }
}

// Chạy nếu được gọi trực tiếp
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase();
}

export default seedDatabase;
