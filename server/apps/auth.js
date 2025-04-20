import { Router } from 'express';
import { db } from '../utils/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const authRouter = Router();

// 🐨 Todo: Exercise #1
// ให้สร้าง API เพื่อเอาไว้ Register ตัว User แล้วเก็บข้อมูลไว้ใน Database ตามตารางที่ออกแบบไว้
authRouter.post('/register', async (req, res) => {
   //สร้าง object เก็บ data
   try {
      const user = {
         username: req.body.username,
         password: req.body.password,
         firstName: req.body.firstName,
         lastName: req.body.lastName,
      };
      // นำ password เข้ารหัส hash
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
      // เลือกไปเก็บข้อมูล ที่ collection users โดยการ insertOne users เข้าไป
      // console.log('user: ', user);
      // console.log('firstName: ', user.firstName);
      // console.log('lastName: ', user.lastName);
      const collection = db.collection('users');
      await collection.insertOne(user);

      return res.status(200).json({
         message: 'User has been created successfully',
      });
   } catch (error) {
      console.log('error :', error);
   }
});

// 🐨 Todo: Exercise #3
// ให้สร้าง API เพื่อเอาไว้ Login ตัว User ตามตารางที่ออกแบบไว้

authRouter.post('/login', async (req, res) => {
   try {
      // declaer req username pass
      const username = req.body.username;
      const password = req.body.password;
      // console.log('req.body: ', req.body);
      // ดึงข้อมูลจาก database โดยหาจาก id
      const user = await db.collection('users').findOne({ username: username });
      // console.log('user: ', user);
      if (!user) {
         return res.status(404).json({ message: 'user not found' });
      }
      // compare password จาก database ให้อยู่ในรูปแบบ ข้อความ
      const isValidPassword = await bcrypt.compare(password, user.password);
      // console.log('isValidPassword: ', isValidPassword);
      if (!isValidPassword) {
         return res.status(400).json({ message: 'password not valid' });
      }

      /*       
ทดลองแปลง id จาก string เป็น ObjectId เพื้อใช้คำสั่ง findOne
import { ObjectId } from 'mongodb';
const userId = user._id.toString();
      console.log(typeof userId);
      console.log('userId: ', userId);
      const newUserId = new ObjectId(userId);
      console.log(typeof newUserId);
      console.log('user._id :', newUserId);
      const findUser = await db.collection('users').findOne({ _id: newUserId });
      console.log('findUser: ', findUser); */

      // สร้าง token ให้กับ user
      const token = jwt.sign(
         { id: user._id, firstName: user.firstName, lastName: user.lastName },
         process.env.SECRET_KEY,
         { expiresIn: 900000 }
      );
      // ส่ง token ให้กับ user
      // console.log('token: ', token);
      return res.json({
         message: 'login succesfully',
         token,
      });
   } catch (error) {
      console.log(error);
   }
});
export default authRouter;
