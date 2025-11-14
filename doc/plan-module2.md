# Module 2 Implementation Plan

## Overview
Module 2 focuses on implementing automated testing and CI/CD with GitHub Actions, including both API testing and end-to-end frontend testing using Playwright.

**Current Implementation Status:**
- Book Service: GET /books (listing) ✅ Implemented
- Book Service: POST /books (create) ⏭️ Not yet implemented
- Book Service: PUT /books/:id (update) ⏭️ Not yet implemented
- Book Service: DELETE /books/:id (delete) ⏭️ Not yet implemented

---

## Task 1: GitHub Actions Workflow for Basic Testing

### 1.1 Create GitHub Actions Directory Structure
**Location:** `.github/workflows/`

**Files to create:**
- `.github/workflows/test-bookstore.yml` - Main CI workflow

### 1.2 Workflow Implementation
**Workflow steps:**
1. **Checkout code** - Use `actions/checkout@v4` with submodules
2. **Start Docker Compose services**
   - Run `docker compose up -d --build`
   - Wait for services to be healthy (MongoDB health check)
   - Add explicit wait/retry logic for service readiness
3. **Test with curl**
   - Verify nginx route: `curl http://localhost/api/books`
   - Verify direct service: `curl http://localhost:3000/books`
   - Verify health check: `curl http://localhost:3000/health`
   - Parse JSON response to validate book count (should be 7 books)
   - Verify response structure (check for name, author, price fields)
4. **Terminate services**
   - Run `docker compose down -v` (remove volumes for clean state)
5. **Generate status report**
   - Create test summary with results
   - Display pass/fail status for each endpoint
   - Upload as workflow artifact

**Triggers:**
- Push to `main`, `module-2`, `module-2-ai-solution`
- Pull requests to `main`
- Manual workflow dispatch

**Environment:**
- Ubuntu latest
- Docker Compose v2

---

## Task 2: Local Testing with `act`

### 2.1 Create Scripts Directory
**Location:** `scripts/`

**Files to create:**
- `scripts/run-github-actions-locally.sh` - Script to run GitHub Actions locally using `act`
- `scripts/README.md` - Documentation for local testing

### 2.2 Script Requirements
- Check if `act` is installed (provide installation instructions if not)
- Run the GitHub Actions workflow locally
- Support optional parameters (e.g., specific workflow, specific job)
- Display results in terminal
- Handle cleanup on exit

**Installation check:**
```bash
#!/bin/bash
if ! command -v act &> /dev/null; then
    echo "Error: 'act' is not installed."
    echo ""
    echo "Installation instructions:"
    echo "  macOS:   brew install act"
    echo "  Linux:   curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash"
    echo "  Windows: choco install act-cli"
    echo ""
    exit 1
fi

echo "Running GitHub Actions workflow locally..."
act -j test
```

### 2.3 Documentation
**scripts/README.md** should include:
- What is `act` and why we use it
- Installation instructions for different platforms
- Usage examples
- Troubleshooting common issues
- Differences between local and GitHub-hosted runners

---

## Task 3: Playwright Testing with Screenshots

### 3.1 Playwright Test Suite Structure

**Test Organization Strategy:**
- Active tests for implemented features (GET /books, frontend listing)
- Skipped tests for future features (CREATE, UPDATE, DELETE)
- Use `test.skip()` for unimplemented features with clear comments

#### Test Files to Create/Modify:

**1. `tests/book-listing.spec.ts` - Book Listing Tests (ACTIVE)**
```typescript
test.describe('Book Listing', () => {
  test('should display all books on home page', async ({ page }) => {
    // Navigate and verify books are visible
    // Take snapshot: screenshots/book-listing.png
  });

  test('should show book details', async ({ page }) => {
    // Verify book cards show name, author, price, image
    // Take snapshot: screenshots/book-details.png
  });

  test('should allow filtering books by price', async ({ page }) => {
    // Test filter functionality if available
    // Take snapshot: screenshots/book-listing-filtered.png
  });
});
```

**2. `tests/book-management.spec.ts` - Book CRUD Tests (MIXED)**
```typescript
test.describe('Book Management', () => {
  test('should navigate to Manage Books page', async ({ page }) => {
    // Navigate to management page
    // Take snapshot: screenshots/book-management-page.png
  });

  test.skip('should add a new book', async ({ page }) => {
    // TODO: Implement when POST /books endpoint is available
    // Expected: Fill form, submit, verify book appears in list
    // Expected snapshot: screenshots/book-management-added.png
  });

  test.skip('should update an existing book', async ({ page }) => {
    // TODO: Implement when PUT /books/:id endpoint is available
    // Expected: Edit book, save, verify changes
    // Expected snapshot: screenshots/book-management-updated.png
  });

  test.skip('should delete a book', async ({ page }) => {
    // TODO: Implement when DELETE /books/:id endpoint is available
    // Expected: Click delete, confirm, verify removal
    // Expected snapshot: screenshots/book-management-deleted.png
  });
});
```

**3. `tests/shopping-cart.spec.ts` - Shopping Cart Tests (ACTIVE if implemented)**
```typescript
test.describe('Shopping Cart', () => {
  test('should add books to cart', async ({ page }) => {
    // Add book to cart
    // Verify cart count updates
    // Take snapshot: screenshots/shopping-cart.png
  });

  test.skip('should place an order', async ({ page }) => {
    // TODO: Implement when order functionality is available
    // Expected: Submit order, verify success
  });
});
```

**4. `tests/api.spec.ts` - API Integration Tests (MIXED)**
```typescript
test.describe('Books API', () => {
  test('GET /books should return list of books', async ({ request }) => {
    const response = await request.get('http://localhost:3000/books');
    expect(response.ok()).toBeTruthy();
    const books = await response.json();
    expect(books).toHaveLength(7);
    expect(books[0]).toHaveProperty('name');
    expect(books[0]).toHaveProperty('author');
    expect(books[0]).toHaveProperty('price');
  });

  test('GET /health should return healthy status', async ({ request }) => {
    const response = await request.get('http://localhost:3000/health');
    expect(response.ok()).toBeTruthy();
    const health = await response.json();
    expect(health.status).toBe('healthy');
    expect(health.database).toBe('connected');
  });

  test.skip('POST /books should create a new book', async ({ request }) => {
    // TODO: Implement when POST endpoint is available
    // Expected: Create book, verify response, check it appears in GET
  });

  test.skip('PUT /books/:id should update a book', async ({ request }) => {
    // TODO: Implement when PUT endpoint is available
    // Expected: Update book, verify changes persist
  });

  test.skip('DELETE /books/:id should remove a book', async ({ request }) => {
    // TODO: Implement when DELETE endpoint is available
    // Expected: Delete book, verify it's gone from list
  });
});
```

**5. Keep existing:** `tests/books.spec.ts` (for reference/basic navigation)

### 3.2 Playwright Configuration
**Update:** `tests/playwright.config.ts`

**Configuration requirements:**
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './',
  timeout: 30000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : 4,

  reporter: [
    ['html', { outputFolder: 'test-results/html' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['list']
  ],

  use: {
    baseURL: 'http://localhost',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'docker compose up -d',
    port: 80,
    timeout: 120000,
    reuseExistingServer: !process.env.CI,
  },
});
```

### 3.3 Update GitHub Actions Workflow
**Replace curl testing with Playwright:**

**New workflow steps:**
1. **Checkout code**
   - Include submodules: `submodules: recursive`

2. **Setup Node.js**
   - Version: 20
   - Cache npm dependencies

3. **Install dependencies**
   - Navigate to tests directory
   - Run `npm ci`
   - Install Playwright browsers: `npx playwright install --with-deps chromium`

4. **Start services**
   - `docker compose up -d --build`
   - Wait for health checks
   - Verify services are responding

5. **Run Playwright tests**
   - Execute: `npm test` (runs all .spec.ts files)
   - Generate HTML report
   - Capture screenshots and videos

6. **Upload artifacts** (always run, even on failure)
   - HTML test report → `playwright-report`
   - Screenshots → `screenshots`
   - Videos → `videos` (failures only)
   - Test results JSON → `test-results`

7. **Generate test summary**
   - Parse JSON results
   - Create markdown summary with:
     - Total tests / Passed / Failed / Skipped
     - Test duration
     - Link to full HTML report
   - Add to GitHub Actions summary page

8. **Cleanup**
   - `docker compose down -v`

---

## Git Branching Strategy

### Branch Creation
```bash
# Create and push module-2 branch
git checkout main
git pull origin main
git checkout -b module-2
git push -u origin module-2

# Create and push module-2-ai-solution branch
git checkout main
git checkout -b module-2-ai-solution
git push -u origin module-2-ai-solution

# Work in module-2-ai-solution
git checkout module-2-ai-solution
```

### Commit Strategy
- Initial commit: Branch setup and plan documentation
- Commit 1: GitHub Actions workflow (Task 1)
- Commit 2: Local testing script (Task 2)
- Commit 3: Playwright configuration and test structure (Task 3)
- Commit 4: Documentation updates
- Final: Merge to module-2, then to main

---

## File Structure (New/Modified Files)

```
bookstore/
├── .github/
│   └── workflows/
│       └── test-bookstore.yml          # NEW: Main CI workflow
├── doc/
│   ├── plan-module2.md                 # NEW: This file
│   └── spec.md                         # MODIFIED: Update Module 2 details
├── scripts/
│   ├── run-github-actions-locally.sh   # NEW: Local testing script
│   └── README.md                       # NEW: Scripts documentation
├── tests/
│   ├── playwright.config.ts            # NEW/MODIFIED: Enhanced config
│   ├── package.json                    # MODIFIED: Ensure correct dependencies
│   ├── book-listing.spec.ts            # NEW: Book listing tests (ACTIVE)
│   ├── book-management.spec.ts         # NEW: Book CRUD tests (MOSTLY SKIPPED)
│   ├── shopping-cart.spec.ts           # NEW: Shopping cart tests (ACTIVE)
│   ├── api.spec.ts                     # NEW: API integration tests (MIXED)
│   └── books.spec.ts                   # EXISTING: Keep for reference
└── README.md                           # MODIFIED: Add Module 2 testing docs
```

---

## Dependencies

### Test Dependencies (tests/package.json)
```json
{
  "name": "bookstore-tests",
  "version": "1.0.0",
  "description": "Playwright tests for bookstore application",
  "scripts": {
    "test": "playwright test",
    "test:ui": "playwright test --ui",
    "test:debug": "playwright test --debug",
    "test:report": "playwright show-report"
  },
  "dependencies": {
    "@playwright/test": "^1.48.0"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "typescript": "^5.3.3"
  }
}
```

---

## Success Criteria

### Task 1: GitHub Actions Workflow
- [ ] Workflow file created and committed
- [ ] Workflow triggers on specified branches
- [ ] Services start successfully in CI environment
- [ ] Curl tests pass for all endpoints
- [ ] Book count validation works (7 books)
- [ ] Services shut down cleanly
- [ ] Status report visible in workflow summary

### Task 2: Local Testing Script
- [ ] Script created with executable permissions
- [ ] Installation check works correctly
- [ ] Script runs GitHub Actions locally with `act`
- [ ] Documentation clear and complete
- [ ] Error handling for common issues

### Task 3: Playwright Testing
- [ ] All test files created with proper structure
- [ ] Active tests pass for implemented features:
  - Book listing displays correctly
  - Navigation works
  - API GET /books returns 7 books
  - Health check returns healthy status
- [ ] Skipped tests documented with TODO comments
- [ ] Screenshots captured for active tests
- [ ] Playwright config optimized for CI/local
- [ ] GitHub Actions updated to use Playwright
- [ ] Test artifacts uploaded successfully
- [ ] Test summary displays in workflow

---

## Testing Strategy

### Active Tests (Must Pass)
1. ✅ Book listing page loads
2. ✅ Books display with correct data
3. ✅ Navigation between pages works
4. ✅ API GET /books returns all books
5. ✅ Health check endpoint responds

### Skipped Tests (Future Implementation)
1. ⏭️ Create new book
2. ⏭️ Update existing book
3. ⏭️ Delete book
4. ⏭️ Place order (if applicable)

### Screenshot Locations
All screenshots saved to: `tests/screenshots/`
- `book-listing.png` - Home page with books
- `book-details.png` - Individual book card details
- `book-management-page.png` - Management interface
- `shopping-cart.png` - Cart with items (if applicable)

---

## Estimated Implementation Timeline

1. **Phase 1: Branch Setup** - 5 minutes
   - Create module-2 and module-2-ai-solution branches
   - Push to origin

2. **Phase 2: Documentation** - 15 minutes
   - Create plan-module2.md
   - Update spec.md

3. **Phase 3: GitHub Actions Workflow (Task 1)** - 30 minutes
   - Create workflow YAML
   - Implement curl-based tests
   - Test in CI environment

4. **Phase 4: Local Testing Script (Task 2)** - 15 minutes
   - Create bash script
   - Write documentation
   - Test locally

5. **Phase 5: Playwright Setup (Task 3.1 & 3.2)** - 45 minutes
   - Create test files
   - Implement active tests
   - Add skipped tests with TODO comments
   - Configure Playwright

6. **Phase 6: GitHub Actions Playwright Integration (Task 3.3)** - 30 minutes
   - Update workflow for Playwright
   - Configure artifact uploads
   - Implement test summary

7. **Phase 7: Testing & Validation** - 30 minutes
   - Run all tests locally
   - Verify CI workflow
   - Check artifacts and reports

8. **Phase 8: Documentation Updates** - 15 minutes
   - Update README.md
   - Final documentation review

**Total Estimated Time:** ~3 hours

---

## Notes and Considerations

### Why Skip Tests?
- Maintains test suite completeness
- Documents expected functionality
- Easy to enable when endpoints are implemented
- Prevents false failures in CI
- Shows test coverage gaps

### Future Module Dependencies
- Module 3 might implement CREATE endpoint
- Module 4 might implement UPDATE/DELETE endpoints
- Tests can be progressively enabled

### CI/CD Best Practices
- Fail fast on critical errors
- Always cleanup resources
- Upload artifacts even on failure
- Clear test summaries
- Reasonable timeouts

---

## Approval Checklist

- [ ] Plan reviewed and approved
- [ ] File structure confirmed
- [ ] Test strategy acceptable
- [ ] Skip approach for unimplemented features approved
- [ ] Timeline reasonable
- [ ] Ready to proceed with implementation

---

**Status:** ⏳ Awaiting approval before implementation
