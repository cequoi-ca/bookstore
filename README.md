# BookStore Application

A microservices-based bookstore application built with Docker, Node.js, TypeScript, and MongoDB.

## Architecture

- **Frontend**: React-based UI (books-ui submodule)
- **API Gateway**: Nginx reverse proxy and load balancer
- **Backend Service**: Node.js/TypeScript bookservice using Koa framework
- **Database**: MongoDB with automatic seeding

## Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- VS Code with REST Client extension (for testing)

## Quick Start

1. Clone the repository with submodules:
   ```bash
   git clone --recursive [repository-url]
   # Or if already cloned:
   git submodule update --init --recursive
   ```

2. Start the application:
   ```bash
   docker-compose up -d
   ```

3. Access the application:
   - Frontend: http://localhost/
   - API (through Nginx): http://localhost/api/books
   - API (direct): http://localhost:3000/books
   - Health check: http://localhost/health

## Database Setup

### Provisioning Books on First Start

The database comes with a seed script (`scripts/seed-db.js`) that should run automatically when the MongoDB container starts for the first time. However, if the database is empty, you can manually provision it with sample books:

```bash
# Check if the database has books
docker exec mongo mongosh bookstore --eval "db.books.countDocuments()"

# If the count is 0, seed the database manually
docker exec mongo mongosh bookstore --eval "
db.books.drop();
db.books.insertMany([
  {
    name: \"Giant's Bread\",
    author: \"Agatha Christie\",
    description: \"'A satisfying novel.' New York Times 'When Miss Westmacott reaches the world of music, her book suddenly comes alive. The chapters in which Jane appears are worth the rest of the book put together.' New Statesman --This text refers to an out of print or unavailable edition of this title.\",
    price: 21.86,
    image: \"https://upload.wikimedia.org/wikipedia/en/4/45/Giant%27s_Bread_First_Edition_Cover.jpg\"
  },
  {
    name: \"Appointment with Death\",
    author: \"Agatha Christie\",
    description: \"In this exclusive authorized edition from the Queen of Mystery, the unstoppable Hercule Poirot finds himself in the Middle East with only one day to solve a murder..\",
    price: 19.63,
    image: \"https://upload.wikimedia.org/wikipedia/en/thumb/c/cc/Appointment_with_Death_First_Edition_Cover_1938.jpg/220px-Appointment_with_Death_First_Edition_Cover_1938.jpg\"
  },
  {
    name: \"Beowulf: The Monsters and the Critics\",
    author: \"J.R.R Tolkein\",
    description: \"J. R. R. Tolkien's essay 'Beowulf: The Monsters and the Critics', initially delivered as the Sir Israel Gollancz Memorial Lecture at the British Academy in 1936, and first published as a paper in the Proceedings of the British Academy that same year, is regarded as a formative work in modern Beowulf studies. In it, Tolkien speaks against critics who play down the monsters in the poem, namely Grendel, Grendel's mother, and the dragon, in favour of using Beowulf solely as a source for Anglo-Saxon history.\",
    price: 19.95,
    image: \"https://upload.wikimedia.org/wikipedia/en/thumb/5/51/Beowulf_The_Monsters_and_the_Critics_1936_title_page.jpg/220px-Beowulf_The_Monsters_and_the_Critics_1936_title_page.jpg\"
  },
  {
    name: \"The Complete Works of William Shakespeare\",
    author: \"William Shakespeare\",
    description: \"No library is complete without the classics! This leather-bound edition includes the complete works of the playwright and poet William Shakespeare, considered by many to be the English language's greatest writer.\",
    price: 39.99,
    image: \"https://m.media-amazon.com/images/I/71Bd39ofMAL._SL1500_.jpg\"
  },
  {
    name: \"Iliad & Odyssey\",
    author: \"Homer\",
    description: \"No home library is complete without the classics! Iliad & Odyssey brings together the two essential Greek epics from the poet Homer in an elegant, leather-bound, omnibus edition-a keepsake to be read and treasured.\",
    price: 33.99,
    image: \"https://m.media-amazon.com/images/I/71ZWKmOIpVL._SL1500_.jpg\"
  },
  {
    name: \"Modern Software Engineering: Doing What Works to Build Better Software Faster\",
    author: \"David Farley\",
    description: \"In Modern Software Engineering, continuous delivery pioneer David Farley helps software professionals think about their work more effectively, manage it more successfully, and genuinely improve the quality of their applications, their lives, and the lives of their colleagues.\",
    price: 51.56,
    image: \"https://m.media-amazon.com/images/I/81sji+WquSL._SL1500_.jpg\"
  },
  {
    name: \"Domain-Driven Design: Tackling Complexity in the Heart of Software\",
    author: \"Eric Evans\",
    description: \"Leading software designers have recognized domain modeling and design as critical topics for at least twenty years, yet surprisingly little has been written about what needs to be done or how to do it.\",
    price: 91.99,
    image: \"https://m.media-amazon.com/images/I/71Qde+ZerdL._SL1500_.jpg\"
  }
]);
db.books.createIndex({ name: 'text', author: 'text' });
db.books.createIndex({ price: 1 });
db.books.createIndex({ author: 1 });
print('Database seeded successfully!');
print('Total books inserted: ' + db.books.countDocuments());
"

# Verify the data
docker exec mongo mongosh bookstore --eval "db.books.find().limit(3)"
```

The seed data includes 7 books with details like name, author, description, price, and cover images. The script also creates indexes for text search and filtering.

## Development

### Project Structure
```
bookstore/
├── .github/
│   └── workflows/   # CI/CD workflows
├── adapter/         # Frontend adapter configuration
├── conf/            # Nginx configuration
├── doc/             # Documentation
├── scripts/         # Utility scripts and database seed scripts
├── services/
│   ├── books-ui/    # Frontend (git submodule)
│   ├── bookservice/ # Book management service
│   ├── warehouse/   # Future: Inventory service
│   └── order/       # Future: Order service
└── tests/           # Playwright E2E tests
```

### Running Tests

#### Manual API Testing
Open `tests/api/books.http` in VS Code with REST Client extension and click "Send Request" on any test.

#### Automated E2E Testing with Playwright

**Prerequisites:**
- Ensure Docker Compose services are running
- Node.js 20+ installed

**Run tests:**
```bash
cd tests
npm install
npm test                 # Run all tests
npm run test:ui          # Run tests in UI mode
npm run test:debug       # Run tests in debug mode
npm run test:report      # View last test report
```

**Test Results:**
- 12 active tests (book listing, navigation, API GET endpoints)
- 12 skipped tests (CRUD operations awaiting API implementation)
- Screenshots saved to `tests/screenshots/`
- HTML report in `tests/test-results/html-report/`

**Note:** Some tests are intentionally skipped using `test.skip()` until the corresponding API endpoints (POST, PUT, DELETE) are implemented in future modules.

### Stopping the Application

```bash
docker-compose down
# To also remove volumes:
docker-compose down -v
```

## CI/CD

### GitHub Actions Workflows

Two workflows are configured for automated testing:

**1. Basic API Tests** (`.github/workflows/test-bookstore.yml`)
- Runs on push to main, module-2, module-2-ai-solution branches
- Uses curl to test API endpoints
- Validates book count and response structure
- Generates test summary in workflow output

**2. Playwright E2E Tests** (`.github/workflows/playwright-tests.yml`)
- Comprehensive end-to-end testing with Playwright
- Tests frontend UI and API integration
- Captures screenshots and videos
- Uploads test artifacts (reports, screenshots, videos)
- Generates detailed test summary

### Local GitHub Actions Testing

You can run GitHub Actions workflows locally using [act](https://github.com/nektos/act):

```bash
# Install act (macOS)
brew install act

# Run workflows locally
./scripts/run-github-actions-locally.sh

# Run specific workflow
./scripts/run-github-actions-locally.sh -w test-bookstore.yml

# Show help
./scripts/run-github-actions-locally.sh -h
```

See `scripts/README.md` for more information about local testing.

## Services

| Service | Port | Description |
|---------|------|-------------|
| nginx | 80 | Reverse proxy and load balancer |
| front-end | Internal | React UI |
| bookservice | 3000 | Book management API |
| mongo | 27017 | MongoDB database |

## API Endpoints

- `GET /api/books` - Get all books
- `GET /health` - Health check

## Environment Variables

See `.env.example` in each service directory for configuration options.

## Troubleshooting

### View logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f bookservice
```

### Rebuild services
```bash
docker-compose build --no-cache
docker-compose up -d
```

### Check service status
```bash
docker-compose ps
```

## License

MIT