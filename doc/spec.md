# BookStore 

## Context

We are building a sample bookstore in 4 modules for learning in backend development.
The frontend is using a webUI from the repository  git@github.com:cequoi-ca/books-ui.git
The books-ui.git repo shall be added as a git submodule under the bookstore repo in the folder services. 


## Module 1.: Project Setup

### File Structure

docker-compose.yaml
adapter/
  index.ts
- conf/
       nginx.conf
- services/
       books-ui (submodule)
       bookservice/
         project.json
         src/
           index.ts
       warehouse/
         project.json
         src/
           index.ts
       order/
         project.json
         src/
           index.ts

### Git, Branching Strategy
Each module should have two associated branches Module-<n> and Module-<n>-ai-solution
Claude code should generate an ai solution in the solution branch 

### Technology Stack
- Docker Compose
- Nginx as Loadbalancer and Reverse Proxy
- node, npm, typescript
- KOA http framework
- Mongodb Database

### Runtime - Docker Compose
Services:
- **Nginx Load Balancer**
  - Image: nginx:alpine
  - Container: nginx
  - Ports: 80:80
  - Routes requests to frontend and backend services
  - Volume mount for custom nginx.conf

- **Frontend - McMasterful Books**
  - Build from ./services/books-ui
  - Container: front-end
  - Serves the web UI
  - Volume mount for adapter directory

- **Backend - Bookservice**
  - Build from ./services/bookservice
  - Container: bookservice
  - Ports: 3000:3000
  - Environment: MONGO_URI=mongodb://mongo:27017/bookstore
  - Depends on MongoDB health check

- **MongoDB Database**
  - Image: mongo:7
  - Container: mongo
  - Ports: 27017:27017
  - Health check using mongosh
  - Persistent volume for data
  - Auto-seed with sample books data

### Test
- VScode Rest client

### Sample bookstoore in json format
```
[
    {
        "name": "Giant's Bread",
        "author": "Agatha Christie",
        "description": "'A satisfying novel.' New York Times 'When Miss Westmacott reaches the world of music, her book suddenly comes alive. The chapters in which Jane appears are worth the rest of the book put together.' New Statesman --This text refers to an out of print or unavailable edition of this title.",
        "price": 21.86,
        "image": "https://upload.wikimedia.org/wikipedia/en/4/45/Giant%27s_Bread_First_Edition_Cover.jpg"
    },
    {
        "name": "Appointment with Death",
        "author": "Agatha Christie",
        "description": "In this exclusive authorized edition from the Queen of Mystery, the unstoppable Hercule Poirot finds himself in the Middle East with only one day to solve a murder..",
        "price": 19.63,
        "image": "https://upload.wikimedia.org/wikipedia/en/thumb/c/cc/Appointment_with_Death_First_Edition_Cover_1938.jpg/220px-Appointment_with_Death_First_Edition_Cover_1938.jpg"
    },
    {
        "name": "Beowulf: The Monsters and the Critics",
        "author": "J.R.R Tolkein",
        "description": "J. R. R. Tolkien's essay 'Beowulf: The Monsters and the Critics', initially delivered as the Sir Israel Gollancz Memorial Lecture at the British Academy in 1936, and first published as a paper in the Proceedings of the British Academy that same year, is regarded as a formative work in modern Beowulf studies. In it, Tolkien speaks against critics who play down the monsters in the poem, namely Grendel, Grendel's mother, and the dragon, in favour of using Beowulf solely as a source for Anglo-Saxon history.",
        "price": 19.95,
        "image": "https://upload.wikimedia.org/wikipedia/en/thumb/5/51/Beowulf_The_Monsters_and_the_Critics_1936_title_page.jpg/220px-Beowulf_The_Monsters_and_the_Critics_1936_title_page.jpg"
    },
    {
        "name": "The Complete Works of William Shakespeare",
        "author": "William Shakespeare",
        "description": "No library is complete without the classics! This leather-bound edition includes the complete works of the playwright and poet William Shakespeare, considered by many to be the English language’s greatest writer.",
        "price": 39.99,
        "image": "https://m.media-amazon.com/images/I/71Bd39ofMAL._SL1500_.jpg"
    },
    {
        "name": "Iliad & Odyssey ",
        "author": "Homer",
        "description": "No home library is complete without the classics! Iliad & Odyssey brings together the two essential Greek epics from the poet Homer in an elegant, leather-bound, omnibus edition-a keepsake to be read and treasured.",
        "price": 33.99,
        "image": "https://m.media-amazon.com/images/I/71ZWKmOIpVL._SL1500_.jpg"
    },
    {
        "name": "Modern Software Engineering: Doing What Works to Build Better Software Faster",
        "author": "David Farley",
        "description": "In Modern Software Engineering, continuous delivery pioneer David Farley helps software professionals think about their work more effectively, manage it more successfully, and genuinely improve the quality of their applications, their lives, and the lives of their colleagues.",
        "price": 51.56,
        "image": "https://m.media-amazon.com/images/I/81sji+WquSL._SL1500_.jpg"
    },
    {
        "name": "Domain-Driven Design: Tackling Complexity in the Heart of Software ",
        "author": "Eric Evans",
        "description": "Leading software designers have recognized domain modeling and design as critical topics for at least twenty years, yet surprisingly little has been written about what needs to be done or how to do it.",
        "price": 91.99,
        "image": "https://m.media-amazon.com/images/I/71Qde+ZerdL._SL1500_.jpg"
    }
]
```

### Development Environment
- Node.js 18+ and npm
- Docker and Docker Compose
- MongoDB Compass (optional, for database inspection)
- VS Code with REST Client extension

### Task Module 1
1. Create a git repository and branches for module-1 and module-1-ai-solution
2. Create a docker-compose file with services
3. Create an nginx configuration file with routes
   / -> front-end
   /api/books -> bookservice
4. Add books-ui repository as a git submodule in services/books-ui
5. Provision and import the sample json bookstore to MongoDB as "books" collection (remove duplicate entries)
6. Implement a bookservice using the Koa TypeScript library that:
   - Listens on port 3000
   - Connects to MongoDB with proper error handling
   - Implements GET /books endpoint returning the list of books
   - Includes health check endpoint at GET /health
   - Implements proper CORS and error middleware
7. Create a test file with VS Code REST Client to test:
   - GET request to nginx at http://localhost/api/books
   - Direct service test at http://localhost:3000/books
   - Health check verification 

