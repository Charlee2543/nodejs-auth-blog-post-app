import express from 'express';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { createUser, checkLogin } from '../models/userCollection.js';
import { userValidationRules, loginValidationRules, validate } from '../middleware/validators.js';
import verifyToken from '../middleware/auth.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const authRouter = express.Router();

// ใช้ค่า JWT_SECRET และ JWT_EXPIRES_IN จาก .env
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

if (!JWT_SECRET) {
  console.error('❌ กรุณากำหนดค่า JWT_SECRET ใน .env file');
  process.exit(1);
}

// Rate limiting configuration
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // จำกัด 5 ครั้งต่อ IP
  message: {
    message: 'Too many login attempts, please try again later'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Rate limiting สำหรับการลงทะเบียน
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // จำกัด 3 accounts ต่อ IP ต่อชั่วโมง
  message: {
    message: 'Too many accounts created, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /auth/register - สร้างผู้ใช้ใหม่
authRouter.post('/register', registerLimiter, userValidationRules, validate, async (req, res) => {
  try {
    const { username, password, firstName, lastName } = req.body;

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!username || !password || !firstName || !lastName) {
      return res.status(400).json({
        status: 'error',
        message: 'กรุณากรอกข้อมูลให้ครบถ้วน'
      });
    }

    // สร้างผู้ใช้ใหม่
    const newUser = await createUser({
      username,
      password,
      firstName,
      lastName,
      role: 'user'  // เพิ่ม default role
    });

    // ส่งผลลัพธ์กลับ
    res.status(201).json({
      status: 'success',
      message: 'ลงทะเบียนสำเร็จ',
      data: {
        user: {
          _id: newUser._id,
          username: newUser.username,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          role: newUser.role
        }
      }
    });

  } catch (error) {
    // จัดการ error กรณีต่างๆ
    if (error.message.includes('ถูกใช้งานแล้ว')) {
      return res.status(400).json({
        status: 'error',
        message: error.message
      });
    }

    // error อื่นๆ
    console.error('❌ Register error:', error);
    res.status(500).json({
      status: 'error',
      message: 'เกิดข้อผิดพลาดในการลงทะเบียน'
    });
  }
});

// POST /auth/login - เข้าสู่ระบบ
authRouter.post('/login', loginLimiter, loginValidationRules, validate, async (req, res) => {
  try {
    const { username, password } = req.body;

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!username || !password) {
      return res.status(401).json({
        status: 'error',
        message: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน'
      });
    }

    // ตรวจสอบ username และ password
    const user = await checkLogin(username, password);

    // สร้าง JWT token พร้อมข้อมูล user
    const token = jwt.sign(
      { 
        id: user.id || user._id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      },
      JWT_SECRET,
      { 
        expiresIn: JWT_EXPIRES_IN
      }
    );

    // ส่งผลลัพธ์กลับ
    res.json({
      status: 'success',
      message: 'เข้าสู่ระบบสำเร็จ',
      data: {
        token,
        user: {
          id: user.id || user._id,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        }
      }
    });

  } catch (error) {
    // กรณี login ไม่สำเร็จ
    console.error('Login error:', error.message);
    res.status(401).json({
      status: 'error',
      message: error.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'
    });
  }
});

// GET /auth/verify - ทดสอบ token
authRouter.get('/verify', verifyToken, (req, res) => {
  res.json({
    message: 'Token is valid',
    user: req.user
  });
});

// POST /auth/test-expired - สร้าง token ที่หมดอายุเร็ว (สำหรับทดสอบ)
authRouter.post('/test-expired', async (req, res) => {
  try {
    const token = jwt.sign(
      { 
        id: '123',
        firstName: 'Test',
        lastName: 'User'
      },
      JWT_SECRET,
      { expiresIn: '1s' } // หมดอายุใน 1 วินาที
    );

    res.json({
      message: 'Test token created',
      token
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error creating test token'
    });
  }
});

// 🐨 Todo: Exercise #3
// ให้สร้าง API เพื่อเอาไว้ Login ตัว User ตามตารางที่ออกแบบไว้

export default authRouter;
