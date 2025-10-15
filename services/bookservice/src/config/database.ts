import { MongoClient, Db } from 'mongodb';

let db: Db | null = null;
let client: MongoClient | null = null;

export const connectToDatabase = async (): Promise<Db> => {
  if (db) return db;

  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/bookstore';
    client = new MongoClient(uri);

    await client.connect();
    console.log('Successfully connected to MongoDB');

    db = client.db('bookstore');

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      if (client) {
        await client.close();
        console.log('MongoDB connection closed');
        process.exit(0);
      }
    });

    return db;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
};

export const getDatabase = (): Db => {
  if (!db) {
    throw new Error('Database not initialized. Call connectToDatabase first.');
  }
  return db;
};