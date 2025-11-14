import { test, expect } from '@playwright/test';

test.describe('Book Listing', () => {
  test('should display all books on home page', async ({ page }) => {
    await page.goto('/');

    // Verify page title
    await expect(page.getByRole('heading', { name: 'BOOKS' })).toBeVisible();

    // Wait for books to load
    await page.waitForLoadState('networkidle');

    // Take screenshot of book listing
    await page.screenshot({ path: 'screenshots/book-listing.png', fullPage: true });

    // Verify books are displayed (should be 7 books)
    const bookElements = page.locator('[x-book]');
    const bookCount = await bookElements.count();

    console.log(`Found ${bookCount} books on the page`);
    expect(bookCount).toBeGreaterThan(0);
  });

  test('should show book details correctly', async ({ page }) => {
    await page.goto('/');

    // Wait for first book to be visible
    await page.waitForSelector('[x-book]');

    // Verify first book has required elements
    const firstBook = page.locator('[x-book]').first();

    // Check for book name attribute
    const bookName = await firstBook.getAttribute('x-book-name');
    expect(bookName).toBeTruthy();
    console.log(`First book: ${bookName}`);

    // Take screenshot of book details
    await page.screenshot({ path: 'screenshots/book-details.png', fullPage: true });
  });

  test('should navigate to home page successfully', async ({ page }) => {
    await page.goto('/');

    // Verify we're on the home page
    await expect(page).toHaveURL('/');

    // Verify main heading is visible
    await expect(page.getByRole('heading', { name: 'BOOKS' })).toBeVisible();
  });

  test('should display books with images', async ({ page }) => {
    await page.goto('/');

    // Wait for books to load
    await page.waitForSelector('[x-book]');

    // Check if at least one book has an image
    const bookImages = page.locator('[x-book] img');
    const imageCount = await bookImages.count();

    expect(imageCount).toBeGreaterThan(0);
    console.log(`Found ${imageCount} book images`);
  });
});
