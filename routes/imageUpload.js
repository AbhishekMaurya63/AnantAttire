import express from "express";
import upload from "../config/multer.js";
import cloudinary from "../config/cloudinary.js";

const router = express.Router();

// -------------------------
// Upload Image
// -------------------------
router.post("/upload", upload.single("image"), async (req, res) => {
  try {

    if (!req.file) {
      return res.status(400).json({ success: false, error: "No file uploaded" });
    }


    res.json({
      success: true,
      url: req.file.path,     
      public_id: req.file.filename, 
    });
  } catch (error) {
    console.error("❌ Cloudinary upload error:", error);
    res.status(500).json({
      success: false,
      error: error.message || JSON.stringify(error),
    });
  }
});

// -------------------------
// Delete Image
// -------------------------
router.delete("/delete", async (req, res) => {
  try {
    const { public_id } = req.body;

    if (!public_id) {
      return res.status(400).json({ success: false, error: "public_id is required" });
    }

    const result = await cloudinary.uploader.destroy(public_id);

    res.json({ success: true, result });
  } catch (error) {
    console.error("❌ Delete error:", error);
    res.status(500).json({
      success: false,
      error: error.message || JSON.stringify(error),
    });
  }
});

export default router;
