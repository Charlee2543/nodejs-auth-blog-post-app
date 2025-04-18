import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';
import { db } from '../utils/db.js';

// Collection name
const COLLECTION = 'users';

// User Schema Validation Rules
const userSchemaValidation = {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["username", "email", "password"],
      properties: {
        _id: {
          bsonType: "objectId"
        },
        username: {
          bsonType: "string",
          minLength: 3,
          description: "ชื่อผู้ใช้ต้องมีความยาวอย่างน้อย 3 ตัวอักษร"
        },
        email: {
          bsonType: "string",
          pattern: "^\\w+([\\.-]?\\w+)*@\\w+([\\.-]?\\w+)*(\\.\\w{2,3})+$",
          description: "กรุณาระบุอีเมลที่ถูกต้อง"
        },
        password: {
          bsonType: "string",
          minLength: 6,
          description: "รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร"
        },
        role: {
          bsonType: "string",
          enum: ["user", "admin"],
          default: "user"
        },
        createdAt: {
          bsonType: "date",
          default: new Date()
        }
      }
    }
  }
};

// สร้าง collection และ validation
async function createCollection() {
  try {
    await db.createCollection(COLLECTION, userSchemaValidation);
    await db.collection(COLLECTION).createIndex({ username: 1 }, { unique: true });
    await db.collection(COLLECTION).createIndex({ email: 1 }, { unique: true });
  } catch (error) {
    if (error.code !== 48) { // ข้าม error ถ้า collection มีอยู่แล้ว
      throw error;
    }
  }
}

// เข้ารหัสรหัสผ่าน
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// ตรวจสอบรหัสผ่าน
async function comparePassword(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword);
}

// สร้าง User
async function createUser(userData) {
  const { password, ...rest } = userData;
  const hashedPassword = await hashPassword(password);
  
  return db.collection(COLLECTION).insertOne({
    ...rest,
    password: hashedPassword,
    createdAt: new Date()
  });
}

// ค้นหา User ด้วย email
async function findUserByEmail(email) {
  return db.collection(COLLECTION).findOne({ email });
}

// ค้นหา User ด้วย username
async function findUserByUsername(username) {
  return db.collection(COLLECTION).findOne({ username });
}

// ค้นหา User ด้วย ID
async function findUserById(id) {
  return db.collection(COLLECTION).findOne({ _id: new ObjectId(id) });
}

export {
  createCollection,
  createUser,
  findUserByEmail,
  findUserByUsername,
  findUserById,
  comparePassword
}; 