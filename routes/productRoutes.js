import express from "express";
import Product from "../models/Product.js";
import Category from "../models/Category.js";

const router = express.Router();

// -----------------------------
// Create product
// -----------------------------
router.post("/", async (req, res) => {
  try {
    const {
      name,
      description,
      originalPrice,
      discountedPrice,
      ratings,
      details,       // { materials, careInstructions, features }
      category,
      thumbnail,     // { public_id, url }
      images,        // [{ public_id, url }]
      sizes,         // [{ size }]
      colors,        // [{ name }]
      label,         // optional
      featured,      // optional
      isActive       // optional
    } = req.body;

    // Validate required fields
    if (!name || !description || !originalPrice) {
      return res.status(400).json({ error: "Name, description, and originalPrice are required" });
    }

    // Validate category
    const categoryExists = await Category.findById(category);
    if (!categoryExists) return res.status(400).json({ error: "Invalid category" });

    // Validate thumbnail
    if (!thumbnail || !thumbnail.public_id || !thumbnail.url)
      return res.status(400).json({ error: "Thumbnail is required" });

    // Validate images
    if (!images || !Array.isArray(images) || images.length === 0)
      return res.status(400).json({ error: "At least one image is required" });

    // Validate sizes
    if (sizes && (!Array.isArray(sizes) || sizes.some(s => !s.size))) {
      return res.status(400).json({ error: "Sizes must be an array of objects with a 'size' field" });
    }

    // Validate colors
    if (colors && (!Array.isArray(colors) || colors.some(c => !c.name))) {
      return res.status(400).json({ error: "Colors must be an array of objects with a 'name' field" });
    }

    // Create product
    const product = await Product.create({
      name,
      description,
      thumbnail,
      images,
      originalPrice,
      discountedPrice,
      ratings: ratings || 0,
      details: details || {},
      category,
      sizes: sizes || [],
      colors: colors || [],
      label: label || "",
      featured: featured || false,
      isActive: isActive || false
    });

    res.status(201).json(product);
  } catch (err) {
    console.error("❌ Error creating product:", err);
    res.status(400).json({ error: err.message });
  }
});


// -----------------------------
// Get all products with filters
// -----------------------------
router.get("/", async (req, res) => {
  try {
    const { categoryId, productName, minPrice, maxPrice } = req.query;
    let query = {};
    if (categoryId) query.category = categoryId;
    if (productName) query.name = { $regex: productName, $options: "i" };
    if (minPrice || maxPrice) {
      query.discountedPrice = {};
      if (minPrice) query.discountedPrice.$gte = Number(minPrice);
      if (maxPrice) query.discountedPrice.$lte = Number(maxPrice);
    }

    const products = await Product.find(query).populate("category");
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -----------------------------
// Get product by ID
// -----------------------------
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("category");
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -----------------------------
// Update product
// -----------------------------
router.put("/:id", async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// -----------------------------
// Delete product (with Cloudinary cleanup if needed)
// -----------------------------
router.delete("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ error: "Product not found" });

    // You can optionally delete images from Cloudinary here using product.thumbnail.public_id & product.images[i].public_id

    await Product.findByIdAndDelete(req.params.id);

    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting product:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
