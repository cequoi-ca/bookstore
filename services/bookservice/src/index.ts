import Koa from 'koa';
import cors from '@koa/cors';
import bodyParser from 'koa-bodyparser';
import logger from 'koa-logger';
import router from './routes/books';
import { errorMiddleware } from './middleware/error';
import { connectToDatabase } from './config/database';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = new Koa();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(logger());
app.use(cors());
app.use(bodyParser());
app.use(errorMiddleware);

// Routes
app.use(router.routes());
app.use(router.allowedMethods());

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectToDatabase();
    console.log('Connected to MongoDB');

    // Start listening
    app.listen(PORT, () => {
      console.log(`Bookservice running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
startServer();