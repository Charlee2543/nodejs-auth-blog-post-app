// import { MongoClient } from 'mongodb';

// const connectionString = 'mongodb://127.0.0.1:27017';

// export const client = new MongoClient(connectionString);

// export const db = client.db('practice-mongo');

import { MongoClient } from 'mongodb';

const connectionString = 'mongodb://127.0.0.1:27017'; //url ของ mongo ที่จะเชื่อม

export const client = new MongoClient(connectionString);

export const db = client.db('practice-mongo'); // ชื่อ db
