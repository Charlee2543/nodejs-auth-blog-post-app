import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// ใช้ค่า JWT_SECRET จาก .env
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('❌ กรุณากำหนดค่า JWT_SECRET ใน .env file');
  process.exit(1);
}

// Middleware ตรวจสอบ token
const verifyToken = (req, res, next) => {
  try {
    // รับ token จาก header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        message: 'Access denied, token missing'
      });
    }

    // ตรวจสอบ format ของ token (Bearer <token>)
    const [bearer, token] = authHeader.split(' ');
    if (bearer !== 'Bearer' || !token) {
      return res.status(401).json({
        message: 'Invalid token format'
      });
    }

    try {
      // ตรวจสอบความถูกต้องของ token
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // เพิ่มข้อมูล user เข้าไปใน request
      req.user = decoded;
      next();
    } catch (error) {
      // แยกประเภท error
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          message: 'Token expired'
        });
      } else if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          message: 'Invalid token'
        });
      } else {
        return res.status(401).json({
          message: 'Token verification failed'
        });
      }
    }
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(500).json({
      message: 'Internal server error'
    });
  }
};

export default verifyToken; 