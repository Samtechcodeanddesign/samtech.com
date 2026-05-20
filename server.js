import express from "express";
import cors from "cors";
import fs from "fs";
import nodemailer from "nodemailer";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ================= EMAIL SETUP =================
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "YOUR_EMAIL@gmail.com",
    pass: "YOUR_APP_PASSWORD"
  }
});

// ================= DATA FILE =================
const DATA_FILE = "./data.json";

// ================= HELPERS =================
const readData = () => {
  if (!fs.existsSync(DATA_FILE)) return [];
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
};

const saveData = (data) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

// ================= CONTACT ROUTE =================
app.post("/contact", (req, res) => {
  const { name, email, message } = req.body;

  const data = readData();

  const newMessage = {
    type: "contact",
    name,
    email,
    message,
    date: new Date()
  };

  data.push(newMessage);
  saveData(data);

  const mailOptions = {
    from: email,
    to: "YOUR_EMAIL@gmail.com",
    subject: "New Contact Message - SamyTech",
    text: `
Name: ${name}
Email: ${email}
Message: ${message}
    `
  };

  transporter.sendMail(mailOptions, (err) => {
    if (err) {
      console.log("Email Error:", err);
      return res.json({
        success: true,
        message: "Saved but email failed"
      });
    }

    res.json({
      success: true,
      message: "Message sent successfully"
    });
  });
});

// ================= ORDER SYSTEM =================
app.post("/order", (req, res) => {
  const { name, product, price, phone } = req.body;

  const data = readData();

  const newOrder = {
    type: "order",
    name,
    product,
    price,
    phone,
    date: new Date()
  };

  data.push(newOrder);
  saveData(data);

  res.json({
    success: true,
    message: "Order received successfully"
  });
});

// ================= ADMIN LOGIN (NEW SECURITY LAYER) =================
const ADMIN_PASSWORD = "samytech123";

app.post("/admin/login", (req, res) => {
  const { password } = req.body;

  if (password === ADMIN_PASSWORD) {
    return res.json({
      success: true,
      token: "admin-auth-2026"
    });
  }

  res.json({
    success: false,
    message: "Wrong password"
  });
});

// ================= ADMIN DATA (PROTECTED) =================
app.get("/admin/data", (req, res) => {
  const token = req.headers.authorization;

  if (token !== "admin-auth-2026") {
    return res.status(401).json({ message: "Unauthorized" });
  }

  res.json(readData());
});

// ================= START SERVER =================
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
