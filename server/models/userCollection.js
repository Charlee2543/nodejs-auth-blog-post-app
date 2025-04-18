import { db } from '../utils/db.js';
import { userSchemaValidation } from './userSchema.js';
import bcrypt from 'bcryptjs';

// ชื่อ collection
export const COLLECTION_NAME = 'users';

// สร้าง collection users
export async function createUsersCollection() {
  try {
    // ตรวจสอบว่ามี collection users หรือยัง
    const collections = await db.listCollections({ name: COLLECTION_NAME }).toArray();
    
    // ถ้ายังไม่มี collection ให้สร้างใหม่
    if (collections.length === 0) {
      await db.createCollection(COLLECTION_NAME, userSchemaValidation);
      // สร้าง indexes
      await db.collection(COLLECTION_NAME).createIndex({ username: 1 }, { unique: true });
      console.log('✅ สร้าง collection users สำเร็จ!');
    } else {
      console.log('📦 collection users มีอยู่แล้ว');
    }
  } catch (error) {
    console.error('❌ ตรวจสอบ collection users ล้มเหลว:', error);
    throw error;
  }
}

// เข้ารหัสรหัสผ่าน
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// สร้าง user ใหม่
export async function createUser(userData) {
  try {
    // ตรวจสอบข้อมูลที่จำเป็น
    const { username, password, firstName, lastName } = userData;
    if (!username || !password || !firstName || !lastName) {
      throw new Error('กรุณากรอกข้อมูลให้ครบถ้วน');
    }

    // ตรวจสอบว่ามี username ซ้ำหรือไม่
    const existingUser = await findUserByUsername(username);
    if (existingUser) {
      throw new Error('ชื่อผู้ใช้นี้ถูกใช้งานแล้ว');
    }

    // เข้ารหัสรหัสผ่าน
    const hashedPassword = await hashPassword(password);

    // สร้าง user ใหม่
    const newUser = {
      username,
      password: hashedPassword,
      firstName,
      lastName,
      role: 'user',
      createdAt: new Date()
    };

    const result = await db.collection(COLLECTION_NAME).insertOne(newUser);
    
    // ส่งข้อมูลกลับโดยไม่รวมรหัสผ่าน
    const { password: _, ...userWithoutPassword } = newUser;
    return { ...userWithoutPassword, _id: result.insertedId };
  } catch (error) {
    console.error('❌ สร้าง user ล้มเหลว:', error);
    throw error;
  }
}

// ค้นหา user ด้วย username
export async function findUserByUsername(username) {
  try {
    return await db.collection(COLLECTION_NAME).findOne({ username });
  } catch (error) {
    console.error('❌ ค้นหา user ด้วย username ล้มเหลว:', error);
    throw error;
  }
}

// ตรวจสอบรหัสผ่าน
async function verifyPassword(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword);
}

// เช็คการ login
export async function checkLogin(username, password) {
  try {
    // ค้นหา user จาก username
    const user = await findUserByUsername(username);
    if (!user) {
      throw new Error('ไม่พบชื่อผู้ใช้นี้ในระบบ');
    }

    // ตรวจสอบรหัสผ่าน
    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      throw new Error('รหัสผ่านไม่ถูกต้อง');
    }

    // ส่งข้อมูลผู้ใช้กลับไป (ไม่รวมรหัสผ่าน)
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    console.error('❌ Login ล้มเหลว:', error);
    throw error;
  }
} 