import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import postRouter from "./apps/posts.js";
import authRouter from "./apps/auth.js";
import { connectDB } from "./utils/db.js";
import { createUsersCollection } from './models/userCollection.js';

async function init() {
  const app = express();
  const port = process.env.PORT || 4001;

  // เชื่อมต่อกับ MongoDB และสร้าง collection
  await connectDB();
  console.log(`
============================================
📡 เชื่อมต่อกับ MongoDB สำเร็จ!
✨ Collection: users พร้อมใช้งาน
============================================
  `);

  // Middlewares
  app.use(cors());
  app.use(bodyParser.json());

  // Routes
  app.use("/posts", postRouter);
  app.use("/auth", authRouter);

  // Health check
  app.get("/", (req, res) => {
    res.json({
      status: "success",
      message: "API พร้อมใช้งาน 🚀",
      timestamp: new Date()
    });
  });

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({
      status: "error",
      message: "ไม่พบ endpoint ที่ร้องขอ"
    });
  });

  // Error handler
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
      status: "error",
      message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์",
      error: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  });

  // Start server
  app.listen(port, () => {
    console.log(`
============================================
🚀 Blog API Server
============================================
📡 Status    : Running
🌐 URL       : http://localhost:${port}
⚡ Port      : ${port}
🔧 Mode      : ${process.env.NODE_ENV || 'development'}
⏰ Time      : ${new Date().toLocaleString()}
============================================
    `);
  });
}

init().catch(console.error);
