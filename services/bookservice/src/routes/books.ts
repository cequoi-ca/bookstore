import Router from '@koa/router';
import { getDatabase } from '../config/database';
import { IBook } from '../types/book.interface';

const router = new Router();

// GET /books - Get all books
router.get('/books', async (ctx) => {
  try {
    const db = getDatabase();
    const books = await db.collection<IBook>('books').find({}).toArray();

    ctx.body = books;
    ctx.status = 200;
  } catch (error: any) {
    console.error('Error fetching books:', error);
    ctx.status = 500;
    ctx.body = {
      error: {
        message: 'Failed to fetch books',
        details: error.message
      }
    };
  }
});

// GET /health - Health check endpoint
router.get('/health', async (ctx) => {
  try {
    const db = getDatabase();
    // Ping the database to check connection
    await db.command({ ping: 1 });

    ctx.body = {
      status: 'healthy',
      service: 'bookservice',
      timestamp: new Date().toISOString(),
      database: 'connected'
    };
    ctx.status = 200;
  } catch (error) {
    ctx.body = {
      status: 'unhealthy',
      service: 'bookservice',
      timestamp: new Date().toISOString(),
      database: 'disconnected'
    };
    ctx.status = 503;
  }
});

export default router;