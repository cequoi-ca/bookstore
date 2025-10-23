import Router from '@koa/router';
import { getDatabase } from '../config/database';
import { IOrder, IOrderFulfillment } from '../types/order.interface';
import { IInventory } from '../types/inventory.interface';
import { ObjectId } from 'mongodb';

const router = new Router();

// POST /order - Create a new order
router.post('/order', async (ctx) => {
  try {
    const db = getDatabase();
    const { order } = ctx.request.body as { order: string[] };

    if (!order || !Array.isArray(order) || order.length === 0) {
      ctx.status = 400;
      ctx.body = { error: 'Invalid order: must be a non-empty array of book IDs' };
      return;
    }

    // Count occurrences of each book ID
    const bookCounts: Record<string, number> = {};
    for (const bookId of order) {
      bookCounts[bookId] = (bookCounts[bookId] || 0) + 1;
    }

    const newOrder: Omit<IOrder, '_id'> = {
      books: bookCounts,
      status: 'pending',
      createdAt: new Date()
    };

    const result = await db.collection<IOrder>('orders').insertOne(newOrder as IOrder);

    ctx.body = result.insertedId.toString();
    ctx.status = 201;
  } catch (error: any) {
    console.error('Error creating order:', error);
    ctx.status = 500;
    ctx.body = {
      error: {
        message: 'Failed to create order',
        details: error.message
      }
    };
  }
});

// GET /order - List all orders
router.get('/order', async (ctx) => {
  try {
    const db = getDatabase();
    const orders = await db.collection<IOrder>('orders').find({}).toArray();

    // Transform to match frontend expectations
    const transformedOrders = orders.map(order => ({
      orderId: order._id?.toString(),
      books: order.books
    }));

    ctx.body = transformedOrders;
    ctx.status = 200;
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    ctx.status = 500;
    ctx.body = {
      error: {
        message: 'Failed to fetch orders',
        details: error.message
      }
    };
  }
});

// PUT /order/:orderId - Fulfill an order
router.put('/order/:orderId', async (ctx) => {
  try {
    const db = getDatabase();
    const orderId = ctx.params.orderId;
    const { booksFulfilled } = ctx.request.body as { booksFulfilled: IOrderFulfillment[] };

    // Validate ObjectId format
    if (!ObjectId.isValid(orderId)) {
      ctx.status = 400;
      ctx.body = { error: 'Invalid order ID format' };
      return;
    }

    if (!booksFulfilled || !Array.isArray(booksFulfilled)) {
      ctx.status = 400;
      ctx.body = { error: 'Invalid fulfillment data: booksFulfilled must be an array' };
      return;
    }

    // Perform fulfillment without transactions (for single MongoDB instance)
    // Get the order
    const order = await db.collection<IOrder>('orders').findOne(
      { _id: new ObjectId(orderId) }
    );

    if (!order) {
      ctx.status = 404;
      ctx.body = { error: 'Order not found' };
      return;
    }

    if (order.status === 'fulfilled') {
      ctx.status = 400;
      ctx.body = { error: 'Order already fulfilled' };
      return;
    }

    // Validate all inventory first
    for (const fulfillment of booksFulfilled) {
      const { book, shelf, numberOfBooks } = fulfillment;

      const inventoryItem = await db.collection<IInventory>('inventory').findOne(
        { bookId: book, shelf }
      );

      if (!inventoryItem || inventoryItem.count < numberOfBooks) {
        ctx.status = 400;
        ctx.body = { error: `Insufficient inventory for book ${book} on shelf ${shelf}` };
        return;
      }
    }

    // Deduct inventory for each fulfillment
    for (const fulfillment of booksFulfilled) {
      const { book, shelf, numberOfBooks } = fulfillment;

      // Deduct from inventory
      await db.collection<IInventory>('inventory').updateOne(
        { bookId: book, shelf },
        { $inc: { count: -numberOfBooks } }
      );

      // Remove inventory entry if count reaches 0
      await db.collection<IInventory>('inventory').deleteMany(
        { count: { $lte: 0 } }
      );
    }

    // Mark order as fulfilled
    await db.collection<IOrder>('orders').updateOne(
      { _id: new ObjectId(orderId) },
      {
        $set: {
          status: 'fulfilled',
          fulfilledAt: new Date()
        }
      }
    );

    ctx.status = 200;
    ctx.body = { message: 'Order fulfilled successfully' };
  } catch (error: any) {
    console.error('Error fulfilling order:', error);
    ctx.status = 500;
    ctx.body = {
      error: {
        message: 'Failed to fulfill order',
        details: error.message
      }
    };
  }
});

export default router;
