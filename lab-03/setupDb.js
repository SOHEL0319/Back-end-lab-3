const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const dbPath = path.join(__dirname, "books.db");

const initializeDatabase = async () => {
  try {
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    await db.exec(`DROP TABLE IF EXISTS book;`);

    await db.exec(`
      CREATE TABLE book (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        price INTEGER NOT NULL,
        pages INTEGER NOT NULL
      );
    `);

    const insertBookQuery = `
      INSERT INTO book (title, author, price, pages)
      VALUES (?, ?, ?, ?);
    `;

    const books = [
      ["The Great Gatsby", "F. Scott Fitzgerald", 350, 180],
      ["To Kill a Mockingbird", "Harper Lee", 420, 281],
      ["1984", "George Orwell", 299, 328],
      ["The Hobbit", "J.R.R. Tolkien", 499, 310],
      ["Pride and Prejudice", "Jane Austen", 250, 279],
      ["The Catcher in the Rye", "J.D. Salinger", 380, 234],
      ["The Alchemist", "Paulo Coelho", 320, 208],
      ["Brave New World", "Aldous Huxley", 450, 268],
      ["Crime and Punishment", "Fyodor Dostoevsky", 550, 671],
      ["The Lord of the Rings", "J.R.R. Tolkien", 899, 1178]
    ];

    for (const book of books) {
      await db.run(insertBookQuery, book);
    }

    console.log("Database initialized and 10 books seeded successfully.");
    await db.close();
  } catch (error) {
    console.error(`Database initialization error: ${error.message}`);
    process.exit(1);
  }
};

initializeDatabase();
