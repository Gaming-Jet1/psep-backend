import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import path from "path";
import { fileURLToPath } from "url";

// Setup for __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config(); // Load .env file

console.log("🔍 Loaded .env values:");
console.log("EMAIL_USER =", process.env.EMAIL_USER);
console.log("EMAIL_PASS =", process.env.EMAIL_PASS);
console.log("TO_EMAIL =", process.env.TO_EMAIL);
console.log("OPENROUTER_API_KEY =", process.env.OPENROUTER_API_KEY?.slice(0, 10) + '...');

const app = express();

// Serve frontend static files from "public" folder
app.use(express.static(path.join(__dirname, "public")));

app.use(cors({
  origin: "https://psep.byethost12.com", // change as needed
  methods: ["POST"],
  credentials: false,
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

/** Chatbot Endpoint **/
app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;

  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://psep.byethost12.com",
        "X-Title": "Pakistan Smart Education Chatbot",
      },
      body: JSON.stringify({
        model: "mistralai/mistral-7b-instruct",
        messages: [{ role: "user", content: userMessage }],
      }),
    },
  );

  const data = await response.json();
  res.json(data);
});

/** Contact Form Email Endpoint **/
app.post("/send-email", async (req, res) => {
  const { name, email, message } = req.body;
  console.log("📨 Received contact form:", { name, email, message });

  if (!name || !email || !message) {
    return res.status(400).json({ error: "All fields are required." });
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.TO_EMAIL,
      subject: `New Contact Form Submission from ${name}`,
      html: `
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong><br>${message}</p>
      `
    });

    console.log("✅ Email sent:", info.messageId);
    res.json({ success: true });
  } catch (error) {
    console.error("❌ Email send failed:", error);
    res.status(500).json({ error: "Email send failed", details: error.message });
  }
});

// Fallback route for SPA: Serve index.html for unmatched GET routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

/** Server Start **/
app.listen(3000, () => console.log("✅ Server running on port 3000"));
