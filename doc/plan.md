# BookStore Application - Implementation Plan

## Project Overview
A microservices-based bookstore application built with Docker, Node.js, TypeScript, and MongoDB. The application consists of a React frontend, Nginx reverse proxy, and backend services for book management.

## Module 1 Implementation Plan

### Phase 1: Project Setup and Git Configuration

#### Tasks:
1. **Initialize Git Repository**
   - Create new repository
   - Set up main branch as default
   - Configure .gitignore for Node.js, TypeScript, Docker

2. **Create Branch Structure**
   - Create `module-1` branch for development
   - Create `module-1-ai-solution` branch for implementation
   - Set up branch protection rules

3. **Add Frontend Submodule**
   ```bash
   git submodule add git@github.com:cequoi-ca/books-ui.git services/books-ui
   git submodule update --init --recursive
   ```

### Phase 2: Project Structure Creation

```
bookstore/
├── docker-compose.yaml
├── .gitignore
├── .env.example
├── README.md
├── adapter/
│   └── index.ts
├── conf/
│   └── nginx.conf
├── doc/
│   ├── spec.md
│   └── plan.md
├── services/
│   ├── books-ui/ (submodule)
│   ├── bookservice/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── Dockerfile
│   │   ├── .dockerignore
│   │   ├── .env.example
│   │   └── src/
│   │       ├── index.ts
│   │       ├── config/
│   │       │   └── database.ts
│   │       ├── routes/
│   │       │   └── books.ts
│   │       ├── models/
│   │       │   └── book.ts
│   │       ├── middleware/
│   │       │   ├── error.ts
│   │       │   └── cors.ts
│   │       └── types/
│   │           └── book.interface.ts
│   ├── warehouse/ (placeholder)
│   │   └── package.json
│   └── order/ (placeholder)
│       └── package.json
├── scripts/
│   ├── seed-db.js
│   └── books.json
└── tests/
    └── api/
        └── books.http
```

### Phase 3: Docker Compose Configuration

#### Docker Compose Services:

```yaml
version: '3.8'

services:
  nginx:
    image: nginx:alpine
    container_name: nginx
    ports:
      - "80:80"
    volumes:
      - ./conf/nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - front-end
      - bookservice
    networks:
      - bookstore-network
    restart: unless-stopped

  front-end:
    build:
      context: ./services/books-ui
      dockerfile: Dockerfile
    image: books-ui:latest
    container_name: front-end
    volumes:
      - ./adapter:/source/adapter
    networks:
      - bookstore-network
    restart: unless-stopped

  bookservice:
    build:
      context: ./services/bookservice
      dockerfile: Dockerfile
    image: bookservice:latest
    container_name: bookservice
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - MONGO_URI=mongodb://mongo:27017/bookstore
      - PORT=3000
    depends_on:
      mongo:
        condition: service_healthy
    networks:
      - bookstore-network
    restart: unless-stopped

  mongo:
    image: mongo:7
    container_name: mongo
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_DATABASE=bookstore
    volumes:
      - mongo-data:/data/db
      - ./scripts:/docker-entrypoint-initdb.d:ro
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 30s
      retries: 3
      start_period: 30s
      timeout: 10s
    networks:
      - bookstore-network
    restart: unless-stopped

networks:
  bookstore-network:
    driver: bridge

volumes:
  mongo-data:
    driver: local
```

### Phase 4: Bookservice Implementation

#### 4.1 Package Configuration

**package.json:**
```json
{
  "name": "bookservice",
  "version": "1.0.0",
  "description": "Book management service for bookstore application",
  "main": "dist/index.js",
  "scripts": {
    "start": "node dist/index.js",
    "dev": "nodemon --exec ts-node src/index.ts",
    "build": "tsc",
    "test": "jest",
    "lint": "eslint src/**/*.ts"
  },
  "dependencies": {
    "koa": "^2.14.2",
    "@koa/router": "^12.0.1",
    "@koa/cors": "^4.0.0",
    "koa-bodyparser": "^4.4.1",
    "koa-logger": "^3.2.1",
    "mongodb": "^6.3.0",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "@types/koa": "^2.13.12",
    "@types/koa__router": "^12.0.4",
    "@types/koa__cors": "^4.0.3",
    "@types/koa-bodyparser": "^4.3.12",
    "@types/koa-logger": "^3.1.5",
    "@types/node": "^20.10.5",
    "typescript": "^5.3.3",
    "nodemon": "^3.0.2",
    "ts-node": "^10.9.2"
  }
}
```

**tsconfig.json:**
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

#### 4.2 Core Implementation Components

**src/types/book.interface.ts:**
```typescript
export interface IBook {
  _id?: string;
  name: string;
  author: string;
  description: string;
  price: number;
  image: string;
}
```

**src/config/database.ts:**
```typescript
import { MongoClient, Db } from 'mongodb';

let db: Db | null = null;

export const connectToDatabase = async (): Promise<Db> => {
  if (db) return db;

  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/bookstore';
  const client = new MongoClient(uri);

  await client.connect();
  db = client.db('bookstore');

  return db;
};
```

**src/routes/books.ts:**
```typescript
import Router from '@koa/router';
import { connectToDatabase } from '../config/database';
import { IBook } from '../types/book.interface';

const router = new Router();

router.get('/books', async (ctx) => {
  const db = await connectToDatabase();
  const books = await db.collection<IBook>('books').find({}).toArray();

  ctx.body = books;
  ctx.status = 200;
});

router.get('/health', async (ctx) => {
  ctx.body = { status: 'healthy', service: 'bookservice' };
  ctx.status = 200;
});

export default router;
```

**src/index.ts:**
```typescript
import Koa from 'koa';
import cors from '@koa/cors';
import bodyParser from 'koa-bodyparser';
import logger from 'koa-logger';
import router from './routes/books';
import { errorMiddleware } from './middleware/error';
import { connectToDatabase } from './config/database';
import * as dotenv from 'dotenv';

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
    await connectToDatabase();
    console.log('Connected to MongoDB');

    app.listen(PORT, () => {
      console.log(`Bookservice running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
```

#### 4.3 Dockerfile

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src

RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/index.js"]
```

### Phase 5: Nginx Configuration

**conf/nginx.conf:**
```nginx
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log warn;

    sendfile on;
    tcp_nopush on;
    keepalive_timeout 65;
    gzip on;

    upstream frontend {
        server front-end:80;
    }

    upstream bookservice_backend {
        server bookservice:3000;
    }

    server {
        listen 80;
        server_name localhost;

        # Frontend routes
        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # API routes
        location /api/books {
            rewrite ^/api/books(.*)$ /books$1 break;
            proxy_pass http://bookservice_backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;

            # CORS headers
            add_header 'Access-Control-Allow-Origin' '*';
            add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';
            add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range';
        }

        # Health check endpoint
        location /health {
            access_log off;
            add_header 'Content-Type' 'application/json';
            return 200 '{"status":"healthy"}';
        }
    }
}
```

### Phase 6: Database Seeding

**scripts/books.json:**
```json
[
    {
        "name": "Giant's Bread",
        "author": "Agatha Christie",
        "description": "'A satisfying novel.' New York Times...",
        "price": 21.86,
        "image": "https://upload.wikimedia.org/wikipedia/en/4/45/Giant%27s_Bread_First_Edition_Cover.jpg"
    },
    {
        "name": "Appointment with Death",
        "author": "Agatha Christie",
        "description": "In this exclusive authorized edition...",
        "price": 19.63,
        "image": "https://upload.wikimedia.org/wikipedia/en/thumb/c/cc/Appointment_with_Death_First_Edition_Cover_1938.jpg/220px-Appointment_with_Death_First_Edition_Cover_1938.jpg"
    },
    {
        "name": "Beowulf: The Monsters and the Critics",
        "author": "J.R.R Tolkein",
        "description": "J. R. R. Tolkien's essay...",
        "price": 19.95,
        "image": "https://upload.wikimedia.org/wikipedia/en/thumb/5/51/Beowulf_The_Monsters_and_the_Critics_1936_title_page.jpg/220px-Beowulf_The_Monsters_and_the_Critics_1936_title_page.jpg"
    },
    {
        "name": "The Complete Works of William Shakespeare",
        "author": "William Shakespeare",
        "description": "No library is complete without...",
        "price": 39.99,
        "image": "https://m.media-amazon.com/images/I/71Bd39ofMAL._SL1500_.jpg"
    },
    {
        "name": "Iliad & Odyssey",
        "author": "Homer",
        "description": "No home library is complete...",
        "price": 33.99,
        "image": "https://m.media-amazon.com/images/I/71ZWKmOIpVL._SL1500_.jpg"
    },
    {
        "name": "Modern Software Engineering",
        "author": "David Farley",
        "description": "In Modern Software Engineering...",
        "price": 51.56,
        "image": "https://m.media-amazon.com/images/I/81sji+WquSL._SL1500_.jpg"
    },
    {
        "name": "Domain-Driven Design",
        "author": "Eric Evans",
        "description": "Leading software designers...",
        "price": 91.99,
        "image": "https://m.media-amazon.com/images/I/71Qde+ZerdL._SL1500_.jpg"
    }
]
```

**scripts/seed-db.js:**
```javascript
// This script runs automatically when MongoDB container starts
db = db.getSiblingDB('bookstore');

// Clear existing books
db.books.drop();

// Load books data
const books = JSON.parse(cat('/docker-entrypoint-initdb.d/books.json'));

// Insert books
db.books.insertMany(books);

// Create indexes
db.books.createIndex({ name: 'text', author: 'text' });
db.books.createIndex({ price: 1 });

print('Database seeded with ' + db.books.countDocuments() + ' books');
```

### Phase 7: Testing Setup

**tests/api/books.http:**
```http
### Test 1: Get all books through Nginx
GET http://localhost/api/books
Accept: application/json

### Test 2: Direct service test - Get all books
GET http://localhost:3000/books
Accept: application/json

### Test 3: Health check through Nginx
GET http://localhost/health

### Test 4: Service health check
GET http://localhost:3000/health
Accept: application/json

### Test 5: Test CORS headers
OPTIONS http://localhost/api/books
Origin: http://localhost:3000
Access-Control-Request-Method: GET
```

## Implementation Steps Summary

1. **Initialize Git repository**
   ```bash
   git init
   git checkout -b module-1
   git checkout -b module-1-ai-solution
   ```

2. **Create project structure**
   ```bash
   mkdir -p services/bookservice/src/{config,routes,middleware,models,types}
   mkdir -p conf scripts tests/api doc
   ```

3. **Add frontend submodule**
   ```bash
   git submodule add git@github.com:cequoi-ca/books-ui.git services/books-ui
   ```

4. **Implement bookservice**
   - Set up TypeScript configuration
   - Install dependencies
   - Create API endpoints
   - Configure MongoDB connection

5. **Configure Docker**
   - Create docker-compose.yaml
   - Write Dockerfiles for services
   - Set up networking

6. **Configure Nginx**
   - Create routing rules
   - Set up load balancing
   - Configure CORS

7. **Seed database**
   - Create seed scripts
   - Import sample data

8. **Test implementation**
   ```bash
   docker-compose up -d
   # Run VS Code REST Client tests
   ```

## Success Criteria

- [ ] Git repository with proper branching structure
- [ ] All services running in Docker containers
- [ ] Frontend accessible at http://localhost/
- [ ] API accessible at http://localhost/api/books
- [ ] MongoDB seeded with sample books data
- [ ] All tests passing in VS Code REST Client
- [ ] Health checks operational
- [ ] Proper error handling and logging
- [ ] Clean code with TypeScript types

## Potential Enhancements (Future Modules)

1. **Module 2**: Authentication and user management
2. **Module 3**: Shopping cart and order processing
3. **Module 4**: Warehouse inventory management
4. **Module 5**: Payment integration
5. **Module 6**: Admin panel
6. **Module 7**: Search and filtering
7. **Module 8**: Reviews and ratings

## Notes

- The warehouse and order services directories are created as placeholders for future modules
- The adapter directory is mounted to the frontend container as specified
- MongoDB uses persistent volumes to maintain data between container restarts
- All services include health checks for production readiness
- The implementation follows microservices best practices with proper separation of concerns