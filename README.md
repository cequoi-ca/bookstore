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

## Development

### Project Structure
```
bookstore/
├── adapter/          # Frontend adapter configuration
├── conf/            # Nginx configuration
├── doc/             # Documentation
├── scripts/         # Database seed scripts
├── services/
│   ├── books-ui/    # Frontend (git submodule)
│   ├── bookservice/ # Book management service
│   ├── warehouse/   # Future: Inventory service
│   └── order/       # Future: Order service
└── tests/           # API tests
```

### Running Tests

Open `tests/api/books.http` in VS Code with REST Client extension and click "Send Request" on any test.

### Stopping the Application

```bash
docker-compose down
# To also remove volumes:
docker-compose down -v
```

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