import mongoose from "mongoose";

const querySchema = new mongoose.Schema(
  {
    customer: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
    },
    order: {
      items: [
        {
          productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
          },
          productName: { type: String, required: true },
          size: { type: String },
          color: { type: String },
          quantity: { type: Number, required: true },
          price: { type: Number, required: true },
          thumbnail: { type: String, required: true },
        },
      ],
      totalAmount: { type: Number, required: true },
      itemCount: { type: Number, required: true },
    },
    additionalMessage: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Query = mongoose.model("Query", querySchema);
export default Query;
