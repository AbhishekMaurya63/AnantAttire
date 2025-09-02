import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary.js";


// Multer storage directly uploads to Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "products", // Cloudinary folder
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  },
});


const upload = multer({ storage });

// Debug middleware to log incoming files
upload.single("image");

export default upload;
