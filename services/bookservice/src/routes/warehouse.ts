import Router from '@koa/router';
import { getDatabase } from '../config/database';
import { IInventory } from '../types/inventory.interface';

const router = new Router();

// PUT /warehouse/:bookId/:shelf/:count - Add books to a shelf
router.put('/warehouse/:bookId/:shelf/:count', async (ctx) => {
  try {
    const db = getDatabase();
    const { bookId, shelf, count } = ctx.params;
    const numberOfBooks = parseInt(count, 10);

    if (isNaN(numberOfBooks) || numberOfBooks <= 0) {
      ctx.status = 400;
      ctx.body = { error: 'Invalid count: must be a positive number' };
      return;
    }

    // Check if inventory entry exists
    const existingInventory = await db.collection<IInventory>('inventory').findOne({
      bookId,
      shelf
    });

    if (existingInventory) {
      // Update existing inventory
      await db.collection<IInventory>('inventory').updateOne(
        { bookId, shelf },
        { $inc: { count: numberOfBooks } }
      );
    } else {
      // Create new inventory entry
      const newInventory: Omit<IInventory, '_id'> = {
        bookId,
        shelf,
        count: numberOfBooks
      };

      await db.collection<IInventory>('inventory').insertOne(newInventory as IInventory);
    }

    ctx.status = 200;
    ctx.body = { message: 'Books added to shelf successfully' };
  } catch (error: any) {
    console.error('Error adding books to shelf:', error);
    ctx.status = 500;
    ctx.body = {
      error: {
        message: 'Failed to add books to shelf',
        details: error.message
      }
    };
  }
});

// GET /warehouse/:bookId - Find all shelf locations for a book
router.get('/warehouse/:bookId', async (ctx) => {
  try {
    const db = getDatabase();
    const { bookId } = ctx.params;

    const inventoryItems = await db.collection<IInventory>('inventory')
      .find({ bookId })
      .toArray();

    // Transform to Record<ShelfId, number> format
    const shelfLocations: Record<string, number> = {};
    for (const item of inventoryItems) {
      shelfLocations[item.shelf] = item.count;
    }

    ctx.body = shelfLocations;
    ctx.status = 200;
  } catch (error: any) {
    console.error('Error finding book on shelves:', error);
    ctx.status = 500;
    ctx.body = {
      error: {
        message: 'Failed to find book on shelves',
        details: error.message
      }
    };
  }
});

export default router;
