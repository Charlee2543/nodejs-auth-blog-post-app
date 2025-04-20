import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { client } from './utils/db.js';
import postRouter from './apps/posts.js';
import authRouter from './apps/auth.js';
import dotenv from 'dotenv';

async function init() {
   const app = express();
   const port = 4000;
   dotenv.config();
   await client.connect();
   // `cors` เป็น Middleware ที่ทำให้ Client ใดๆ ตามที่กำหนด
   // สามารถสร้าง Request มาหา Server เราได้
   // ในโค้ดบรรทัดล่างนี้คือให้ Client ไหนก็ได้สามารถสร้าง Request มาหา Server ได้
   app.use(cors());
   app.use(express.json());
   // app.use(express.urlencoded({ extended: true }));
   app.use(bodyParser.json());
   app.use('/posts', postRouter);
   app.use('/', authRouter);

   app.get('/', (req, res) => {
      res.send('Hello World!');
   });

   // app.get('*', (req, res) => {
   //    res.status(404).send('Not found');
   // });

   app.listen(port, () => {
      console.log(`Example app listening on port ${port}`);
   });
}

init();
