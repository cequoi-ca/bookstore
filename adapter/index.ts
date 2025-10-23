/**
 * Unified Ecommerce Adapter
 * Provides complete API for bookstore ecommerce operations
 */

// Re-export types for convenience
export type BookID = string;
export type ShelfId = string;
export type OrderId = string;

export interface Book {
  id?: BookID;
  name: string;
  author: string;
  description: string;
  price: number;
  image: string;
}

export interface Filter {
  from?: number;
  to?: number;
  name?: string;
  author?: string;
}

export interface ShelfLocation {
  shelf: ShelfId;
  count: number;
}

export interface Order {
  orderId: OrderId;
  books: Record<BookID, number>;
}

export interface OrderFulfillment {
  book: BookID;
  shelf: ShelfId;
  numberOfBooks: number;
}

// ============================================
// Catalog Management (Public)
// ============================================

/**
 * List all books with optional filtering
 * If multiple filters are provided, any book that matches at least one of them should be returned
 * Within a single filter, a book would need to match all the given conditions
 */
async function listBooks(filters?: Filter[]): Promise<Book[]> {
  const result = await fetch('/api/books/list', {
    body: JSON.stringify(filters ?? []),
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });

  if (result.ok) {
    return await result.json() as Book[];
  } else {
    throw new Error('Failed to fetch books');
  }
}

/**
 * Get a single book by its ID
 */
async function lookupBookById(bookId: BookID): Promise<Book> {
  const result = await fetch(`/api/books/${bookId}`);

  if (result.ok) {
    return await result.json() as Book;
  } else {
    throw new Error(`Could not find book with ID: ${bookId}`);
  }
}

// ============================================
// Book CRUD (Admin)
// ============================================

/**
 * Create a new book or update an existing one
 * @throws Error - Currently not implemented in backend
 */
async function createOrUpdateBook(book: Book): Promise<BookID> {
  throw new Error('Book create/update not yet implemented in backend');
}

/**
 * Remove a book from the catalog
 * @throws Error - Currently not implemented in backend
 */
async function removeBook(bookId: BookID): Promise<void> {
  throw new Error('Book removal not yet implemented in backend');
}

// ============================================
// Inventory Management (Warehouse)
// ============================================

/**
 * Add books to a warehouse shelf
 */
async function placeBooksOnShelf(bookId: BookID, numberOfBooks: number, shelf: ShelfId): Promise<void> {
  const result = await fetch(`/api/warehouse/${bookId}/${shelf}/${numberOfBooks}`, {
    method: 'PUT'
  });

  if (!result.ok) {
    throw new Error(`Could not place books on shelf: ${await result.text()}`);
  }
}

/**
 * Find all shelf locations where a book is stocked
 */
async function findBookOnShelf(bookId: BookID): Promise<ShelfLocation[]> {
  const result = await fetch(`/api/warehouse/${bookId}`);

  if (result.ok) {
    const results = (await result.json()) as Record<ShelfId, number>;
    const shelfArray: ShelfLocation[] = [];

    for (const shelf of Object.keys(results)) {
      shelfArray.push({
        shelf,
        count: results[shelf]
      });
    }

    return shelfArray;
  } else {
    throw new Error(`Could not find book on shelves: ${bookId}`);
  }
}

// ============================================
// Customer Orders
// ============================================

/**
 * Create a new customer order
 */
async function orderBooks(order: BookID[]): Promise<{ orderId: OrderId }> {
  const result = await fetch('/api/order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ order })
  });

  if (!result.ok) {
    throw new Error(`Could not place order: ${await result.text()}`);
  }

  return { orderId: await result.text() };
}

/**
 * List all pending orders
 */
async function listOrders(): Promise<Order[]> {
  const result = await fetch('/api/order');

  if (result.ok) {
    return await result.json() as Order[];
  } else {
    throw new Error('Could not fetch orders');
  }
}

// ============================================
// Order Fulfillment (Warehouse)
// ============================================

/**
 * Fulfill an order by picking books from shelves
 */
async function fulfilOrder(orderId: OrderId, booksFulfilled: OrderFulfillment[]): Promise<void> {
  const result = await fetch(`/api/order/${orderId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ booksFulfilled })
  });

  if (!result.ok) {
    throw new Error(`Could not fulfill order: ${await result.text()}`);
  }
}

// ============================================
// Adapter Export
// ============================================

/**
 * Unified Ecommerce Adapter
 * Provides all functionality for a complete bookstore ecommerce system
 */
const ecommerceAdapter = {
  // Catalog Management
  listBooks,
  lookupBookById,

  // Book CRUD (Admin)
  createOrUpdateBook,
  removeBook,

  // Inventory Management
  placeBooksOnShelf,
  findBookOnShelf,

  // Customer Orders
  orderBooks,
  listOrders,

  // Order Fulfillment
  fulfilOrder,

  // Backward compatibility
  assignment: 'assignment-4' as const
};

export default ecommerceAdapter;