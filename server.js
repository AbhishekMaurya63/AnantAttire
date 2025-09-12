// server.js
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import cloudinary from "cloudinary";

// Load env vars
dotenv.config();

const app = express();

// Connect to DB
connectDB();

// Cloudinary config
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import uploadImage from "./routes/imageUpload.js";
import queryRoutes from "./routes/queryRoutes.js";
import contact from "./routes/contactus.js";
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/queries", queryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/contact", contact);
app.use('/api',uploadImage)
// Basic root
app.get("/", (req, res) => res.send("API Running"));

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server started on port ${PORT}`));
