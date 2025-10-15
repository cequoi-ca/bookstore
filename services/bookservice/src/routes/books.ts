import Router from '@koa/router';
import { getDatabase } from '../config/database';
import { IBook } from '../types/book.interface';
import { ObjectId } from 'mongodb';

const router = new Router();

interface Filter {
  from?: number;
  to?: number;
  name?: string;
  author?: string;
}

// POST /books/list - Get books with optional filters
router.post('/books/list', async (ctx) => {
  try {
    const db = getDatabase();
    const filters = ctx.request.body as Filter[] || [];

    let query: any = {};

    // If filters are provided, build MongoDB query
    if (filters.length > 0) {
      const orConditions = filters.map(filter => {
        const conditions: any = {};

        // Price range filter
        if (filter.from !== undefined || filter.to !== undefined) {
          conditions.price = {};
          if (filter.from !== undefined) {
            conditions.price.$gte = filter.from;
          }
          if (filter.to !== undefined) {
            conditions.price.$lte = filter.to;
          }
        }

        // Name filter (case-insensitive partial match)
        if (filter.name) {
          conditions.name = { $regex: filter.name, $options: 'i' };
        }

        // Author filter (case-insensitive partial match)
        if (filter.author) {
          conditions.author = { $regex: filter.author, $options: 'i' };
        }

        return conditions;
      });

      if (orConditions.length > 0) {
        query = { $or: orConditions };
      }
    }

    const books = await db.collection<IBook>('books').find(query).toArray();

    // Transform _id to id for frontend compatibility
    const transformedBooks = books.map(book => ({
      id: book._id?.toString(),
      name: book.name,
      author: book.author,
      description: book.description,
      price: book.price,
      image: book.image
    }));

    ctx.body = transformedBooks;
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

// GET /books/:id - Get a single book by ID
router.get('/books/:id', async (ctx) => {
  try {
    const db = getDatabase();
    const bookId = ctx.params.id;

    // Validate ObjectId format
    if (!ObjectId.isValid(bookId)) {
      ctx.status = 400;
      ctx.body = { error: 'Invalid book ID format' };
      return;
    }

    const book = await db.collection<IBook>('books').findOne({
      _id: new ObjectId(bookId)
    });

    if (!book) {
      ctx.status = 404;
      ctx.body = { error: 'Book not found' };
      return;
    }

    // Transform _id to id for frontend compatibility
    const transformedBook = {
      id: book._id?.toString(),
      name: book.name,
      author: book.author,
      description: book.description,
      price: book.price,
      image: book.image
    };

    ctx.body = transformedBook;
    ctx.status = 200;
  } catch (error: any) {
    console.error('Error fetching book:', error);
    ctx.status = 500;
    ctx.body = {
      error: {
        message: 'Failed to fetch book',
        details: error.message
      }
    };
  }
});

// GET /books - Get all books (keeping for backward compatibility)
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