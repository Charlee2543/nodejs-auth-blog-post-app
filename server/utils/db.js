import { MongoClient } from "mongodb";
import { createUsersCollection } from "../models/userCollection.js";

const connectionString = "mongodb://localhost:27017";

export const client = new MongoClient(connectionString, {
  useUnifiedTopology: true,
});

export const db = client.db("practice-mongo");

// เชื่อมต่อกับ MongoDB
export async function connectDB() {
  try {
    await client.connect();
    console.log('🎉 เชื่อมต่อกับ MongoDB สำเร็จ!');
    
    // สร้าง collection users
    await createUsersCollection();
    
    return client;
  } catch (error) {
    console.error('❌ เชื่อมต่อกับ MongoDB ล้มเหลว:', error);
    process.exit(1);
  }
}
