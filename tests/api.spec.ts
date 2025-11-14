import { test, expect } from '@playwright/test';

test.describe('Books API', () => {
  test('GET /books should return list of books', async ({ request }) => {
    const response = await request.get('http://localhost:3000/books');

    // Verify response is successful
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    // Parse response
    const books = await response.json();

    // Verify we have 7 books
    expect(books).toBeInstanceOf(Array);
    expect(books).toHaveLength(7);

    console.log(`API returned ${books.length} books`);

    // Verify first book has required properties
    const firstBook = books[0];
    expect(firstBook).toHaveProperty('name');
    expect(firstBook).toHaveProperty('author');
    expect(firstBook).toHaveProperty('price');
    expect(firstBook).toHaveProperty('description');
    expect(firstBook).toHaveProperty('image');

    console.log(`First book: ${firstBook.name} by ${firstBook.author}`);

    // Verify all books have required properties
    books.forEach((book: any, index: number) => {
      expect(book.name, `Book ${index} should have a name`).toBeTruthy();
      expect(book.author, `Book ${index} should have an author`).toBeTruthy();
      expect(typeof book.price, `Book ${index} price should be a number`).toBe('number');
    });
  });

  test('GET /health should return healthy status', async ({ request }) => {
    const response = await request.get('http://localhost:3000/health');

    // Verify response is successful
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    // Parse response
    const health = await response.json();

    // Verify health status
    expect(health.status).toBe('healthy');
    expect(health.database).toBe('connected');
    expect(health.service).toBe('bookservice');

    console.log(`Service health: ${health.status}, Database: ${health.database}`);
  });

  test('GET /api/books via nginx should return books', async ({ request }) => {
    const response = await request.get('http://localhost/api/books');

    // Verify response is successful
    expect(response.ok()).toBeTruthy();

    // Parse response
    const books = await response.json();

    // Verify we got books
    expect(books).toBeInstanceOf(Array);
    expect(books.length).toBeGreaterThan(0);

    console.log(`Nginx route returned ${books.length} books`);
  });

  test.skip('POST /books should create a new book', async ({ request }) => {
    // TODO: Implement when POST /books endpoint is available
    // Expected behavior:
    // 1. Send POST request with new book data
    // 2. Verify response status is 201 (Created)
    // 3. Verify response contains created book with ID
    // 4. Verify GET /books includes the new book
    // 5. Verify book count increased by 1

    const newBook = {
      name: 'Test Book',
      author: 'Test Author',
      description: 'Test Description',
      price: 29.99,
      image: 'https://example.com/test.jpg'
    };

    // This test will be implemented when the API endpoint is ready
    expect(true).toBe(false); // Placeholder to ensure test would fail if run
  });

  test.skip('PUT /books/:id should update a book', async ({ request }) => {
    // TODO: Implement when PUT /books/:id endpoint is available
    // Expected behavior:
    // 1. Get an existing book ID from GET /books
    // 2. Send PUT request with updated data
    // 3. Verify response status is 200 (OK)
    // 4. Verify response contains updated book
    // 5. GET the book by ID and verify changes persisted

    const updates = {
      name: 'Updated Book Name',
      price: 39.99
    };

    // This test will be implemented when the API endpoint is ready
    expect(true).toBe(false); // Placeholder to ensure test would fail if run
  });

  test.skip('DELETE /books/:id should remove a book', async ({ request }) => {
    // TODO: Implement when DELETE /books/:id endpoint is available
    // Expected behavior:
    // 1. Get an existing book ID from GET /books
    // 2. Note the current book count
    // 3. Send DELETE request
    // 4. Verify response status is 204 (No Content) or 200 (OK)
    // 5. Verify GET /books no longer includes the deleted book
    // 6. Verify book count decreased by 1

    // This test will be implemented when the API endpoint is ready
    expect(true).toBe(false); // Placeholder to ensure test would fail if run
  });

  test.skip('POST /books should validate required fields', async ({ request }) => {
    // TODO: Implement when POST /books endpoint is available
    // Expected behavior:
    // 1. Send POST request with missing required fields
    // 2. Verify response status is 400 (Bad Request)
    // 3. Verify error message indicates which fields are required

    const invalidBook = {
      name: 'Test Book'
      // Missing author, price, etc.
    };

    // This test will be implemented when the API endpoint is ready
    expect(true).toBe(false); // Placeholder to ensure test would fail if run
  });

  test.skip('PUT /books/:id should return 404 for non-existent book', async ({ request }) => {
    // TODO: Implement when PUT /books/:id endpoint is available
    // Expected behavior:
    // 1. Send PUT request with non-existent book ID
    // 2. Verify response status is 404 (Not Found)
    // 3. Verify error message is appropriate

    // This test will be implemented when the API endpoint is ready
    expect(true).toBe(false); // Placeholder to ensure test would fail if run
  });
});
