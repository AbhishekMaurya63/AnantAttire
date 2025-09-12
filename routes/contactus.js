import express from "express";
const router = express.Router();
import { sendMail } from "../utils/mail.js";



router.post("/", async (req, res) =>  {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    // 1. Send message to company email
    await sendMail({
      from: `"${name}" <${email}>`,
      to: "anantattire355@gmail.com", // Anant Attire email
      subject: `Contact Form: ${subject}`,
     html: `
  <div style="font-family: Arial, sans-serif; background-color:#f4f4f4; padding:20px;">
    <div style="max-width:600px; margin:auto; background:#fff; border-radius:10px; box-shadow:0 4px 12px rgba(0,0,0,0.1); padding:25px;">
      
      <!-- Header -->
      <h2 style="color:#4CAF50; text-align:center; margin-bottom:20px;">📩 New Contact Request</h2>
      <p style="color:#555; font-size:15px; text-align:center; margin-bottom:30px;">
        You’ve received a new message from your website’s contact form.
      </p>
      
      <!-- Details -->
      <table style="width:100%; border-collapse:collapse; font-size:15px; color:#333;">
        <tr>
          <td style="padding:10px; font-weight:bold; width:120px;">👤 Name:</td>
          <td style="padding:10px; background:#f9f9f9; border-radius:5px;">${name}</td>
        </tr>
        <tr>
          <td style="padding:10px; font-weight:bold;">📧 Email:</td>
          <td style="padding:10px; background:#f9f9f9; border-radius:5px;">${email}</td>
        </tr>
        <tr>
          <td style="padding:10px; font-weight:bold;">📝 Subject:</td>
          <td style="padding:10px; background:#f9f9f9; border-radius:5px;">${subject}</td>
        </tr>
        <tr>
          <td style="padding:10px; font-weight:bold; vertical-align:top;">💬 Message:</td>
          <td style="padding:10px; background:#f9f9f9; border-radius:5px;">${message}</td>
        </tr>
      </table>

      <!-- Footer -->
      <div style="margin-top:30px; font-size:12px; color:#888; text-align:center;">
        <p>⚡ This message was sent via your website contact form.</p>
        <p>© ${new Date().getFullYear()} Anant Attire. All rights reserved.</p>
      </div>

    </div>
  </div>
`

    });

    // 2. Send auto-response mail to user
    await sendMail({
      from: `"Anant Attire" support@anantattire.com`,
      to: email,
      subject: `We received your message: ${subject}`,
      html: `
  <div style="font-family: Arial, sans-serif; background-color:#f4f4f4; padding:20px;">
    <div style="max-width:600px; margin:auto; background:#fff; border-radius:10px; box-shadow:0 4px 12px rgba(0,0,0,0.1); padding:25px;">
      
      <!-- Header -->
      <h2 style="color:#4CAF50; text-align:center; margin-bottom:20px;">🤝 Thank You for Contacting Us</h2>
      <p style="color:#555; font-size:15px; text-align:center; margin-bottom:25px;">
        Hi <b>${name}</b>, we’ve received your message and our team will get back to you shortly.
      </p>

      <!-- User Message -->
      <div style="background:#f9f9f9; border-left:4px solid #4CAF50; padding:15px; border-radius:5px; margin-bottom:20px;">
        <p style="margin:0; font-size:14px; color:#333;"><b>Your Message:</b></p>
        <p style="margin:5px 0 0 0; font-size:14px; color:#555;">${message}</p>
      </div>

      <!-- Footer -->
      <p style="color:#555; font-size:14px; margin-top:20px;">
        Best Regards,<br/>
        <b>Anant Attire Team</b>
      </p>

      <hr style="margin:30px 0; border:none; border-top:1px solid #eee;">
      <p style="font-size:12px; color:#888; text-align:center;">
        📩 This is an automated response. Please don’t reply directly to this email.<br/>
        © ${new Date().getFullYear()} Anant Attire. All rights reserved.
      </p>
    </div>
  </div>
`

    });

    res.status(200).json({
      success: true,
      message: "Message sent successfully. Confirmation mail sent to user."
    });
  } catch (error) {
    console.error("Mail error:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});

export default router;