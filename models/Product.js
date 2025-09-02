const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description:{type: String, required: true},
    // ✅ Store both public_id & url for thumbnail
    thumbnail: {
      public_id: { type: String, required: true },
      url: { type: String, required: true },
    },

    // ✅ Store both public_id & url for multiple images
    images: [
      {
        public_id: { type: String, required: true },
        url: { type: String, required: true },
      },
    ],

    originalPrice: { type: Number, required: true },
    discountedPrice: { type: Number },
    ratings: { type: Number, default: 0 },
    inStock:{type: Boolean, default:true},
    label:{type: String},
    featured:{type:Boolean, default: false}, 
    details: {
      materials: { type: String },
      careInstructions: [{ type: String }],
      features: [{ type: String }],
    },

    // ✅ Sizes object (example: S, M, L with stock count)
    sizes: [
      {
        size: { type: String, required: true }
      },
    ],

    // ✅ Colors object (store available colors with hex code if needed)
    colors: [
      {
        name: { type: String, required: true }, // e.g. "Red", "Blue"
      },
    ],

    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    isActive: {type:Boolean, default: false}
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);
