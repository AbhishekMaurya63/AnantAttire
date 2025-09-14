import express from "express";
import Query from "../models/Query.js";
import User from "../models/User.js";
const router = express.Router();
import { sendMail } from "../utils/mail.js";
// ✅ Create a new query
router.post("/", async (req, res) => {
  try {
    const { customer, order, additionalMessage, timestamp } = req.body;

    // ✅ Validations
    if (!customer || !customer.name || !customer.email || !customer.phone || !customer.address) {
      return res.status(400).json({ error: "Customer details are required" });
    }

    if (!order || !order.items || order.items.length === 0) {
      return res.status(400).json({ error: "Order details are required" });
    }

    // ✅ Save query
    const query = await Query.create({
      customer,
      order,
      additionalMessage: additionalMessage || "",
      timestamp: timestamp || new Date(),
    });

    // ✅ Fetch all admin users
    // const admins = await User.find({ role: "admin" }).select("email");
    // const adminEmails = admins.map((admin) => admin.email);

//     if (adminEmails.length > 0) {
//       // ✅ Send email to all admins
//       const mailOptions = {
//         from: `"Order Query" <${process.env.ADMIN_EMAIL}>`,
//         to: adminEmails, // send to all admins
//         subject: `🛒 New Order Query from ${customer.name}`,
//       html: `
//   <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
//     <div style="max-width: 650px; margin: auto; background: #ffffff; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">
      
//       <!-- Header -->
//       <div style="background: #4CAF50; color: #fff; padding: 20px; text-align: center;">
//         <h2 style="margin: 0;">🛒 New Query Received</h2>
//       </div>

//       <!-- Customer Info -->
//       <div style="padding: 20px;">
//         <h3 style="margin-bottom: 10px; color: #333;">👤 Customer Details</h3>
//         <table style="width: 100%; border-collapse: collapse;">
//           <tr><td style="padding: 6px 0;"><b>Name:</b></td><td>${customer.name}</td></tr>
//           <tr><td style="padding: 6px 0;"><b>Email:</b></td><td>${customer.email}</td></tr>
//           <tr><td style="padding: 6px 0;"><b>Phone:</b></td><td>${customer.phone}</td></tr>
//           <tr><td style="padding: 6px 0;"><b>Address:</b></td><td>${customer.address}</td></tr>
//         </table>
//       </div>

//       <!-- Order Details -->
//       <div style="padding: 20px; background: #fafafa; border-top: 1px solid #eee; border-bottom: 1px solid #eee;">
//         <h3 style="margin-bottom: 10px; color: #333;">📦 Order Details</h3>
//         <table style="width: 100%; border-collapse: collapse;">
//           ${order.items.map(item => `
//             <tr style="border-bottom: 1px solid #eee;">
//               <td style="padding: 10px; text-align: center;">
//                 <img src="${item.thumbnail}" width="70" height="70" style="border-radius: 6px; object-fit: cover;"/>
//               </td>
//               <td style="padding: 10px;">
//                 <b style="color: #333;">${item.productName}</b><br/>
//                 Size: ${item.size || "N/A"} | Color: ${item.color || "N/A"}<br/>
//                 Qty: ${item.quantity} × ₹${item.price}<br/>
//                 <b style="color: #4CAF50;">Total: ₹${item.quantity * item.price}</b>
//               </td>
//             </tr>
//           `).join("")}
//         </table>
//       </div>

//       <!-- Summary -->
//       <div style="padding: 20px;">
//         <h3 style="margin-bottom: 10px; color: #333;">🧾 Summary</h3>
//         <p><b>Total Amount:</b> <span style="color: #4CAF50; font-size: 16px;">₹${order.totalAmount}</span></p>
//         <p><b>Item Count:</b> ${order.itemCount}</p>
//         <p><b>Message:</b> ${additionalMessage || "N/A"}</p>
//         <p style="font-size: 12px; color: #777;"><i>Submitted at: ${new Date(query.timestamp).toLocaleString()}</i></p>
//       </div>

//       <!-- Footer -->
//       <div style="background: #4CAF50; color: #fff; text-align: center; padding: 12px; font-size: 14px;">
//         <p style="margin: 0;">E-Commerce Admin Panel | Powered by Express.js</p>
//       </div>
//     </div>
//   </div>
// `

//       };

//       await sendMail(mailOptions);
//     }

    res.status(201).json({ message: "Query created & email sent to all admins", query });
  } catch (err) {
    console.error("❌ Error creating query:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get all queries
router.get("/", async (req, res) => {
  try {
    const queries = await Query.find().sort({ createdAt: -1 });
    res.json(queries);
  } catch (err) {
    console.error("❌ Error fetching queries:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get single query by ID
router.get("/:id", async (req, res) => {
  try {
    const query = await Query.findById(req.params.id);
    if (!query) return res.status(404).json({ error: "Query not found" });
    res.json(query);
  } catch (err) {
    console.error("❌ Error fetching query:", err);
    res.status(500).json({ error: err.message });
  }
});


router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    // Validate status
    const validStatuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const updatedQuery = await Query.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updatedQuery) {
      return res.status(404).json({ error: "Query not found" });
    }

    res.json(updatedQuery);
  } catch (err) {
    console.error("❌ Error updating status:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const deletedQuery = await Query.findByIdAndDelete(req.params.id);

    if (!deletedQuery) {
      return res.status(404).json({ error: "Query not found" });
    }

    res.json({ message: "Query deleted successfully", deletedQuery });
  } catch (err) {
    console.error("❌ Error deleting query:", err);
    res.status(500).json({ error: "Server error" });
  }
});



export default router;
