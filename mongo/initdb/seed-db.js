// This script runs automatically when MongoDB container starts
db = db.getSiblingDB('bookstore');

// Clear existing books collection
db.books.drop();

// Load books data from JSON file
const books = JSON.parse(cat('/docker-entrypoint-initdb.d/books.json'));

// Insert books into the collection
db.books.insertMany(books);

// Create indexes for better performance
db.books.createIndex({ name: 'text', author: 'text' });
db.books.createIndex({ price: 1 });
db.books.createIndex({ author: 1 });

// Log the result
print('Database seeded successfully!');
print('Total books inserted: ' + db.books.countDocuments());

// Display sample data
print('\nSample book:');
printjson(db.books.findOne());