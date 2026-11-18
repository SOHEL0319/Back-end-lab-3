const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const bcrypt = require("bcrypt");

const dbPath = path.join(__dirname, "users.db");

const initializeDatabase = async () => {
  try {
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    await db.exec(`DROP TABLE IF EXISTS user;`);

    await db.exec(`
      CREATE TABLE user (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        password TEXT NOT NULL
      );
    `);

    const insertUserQuery = `
      INSERT INTO user (username, name, password)
      VALUES (?, ?, ?);
    `;

    const sampleUsers = [
      ["rahul_sharma", "Rahul Sharma", "rahul@pass123"],
      ["priya_patel", "Priya Patel", "priya@pass123"],
      ["amit_verma", "Amit Verma", "amit@pass123"],
      ["sneha_reddy", "Sneha Reddy", "sneha@pass123"],
      ["vikram_singh", "Vikram Singh", "vikram@pass123"],
      ["ananya_iyer", "Ananya Iyer", "ananya@pass123"],
      ["karthik_nair", "Karthik Nair", "karthik@pass123"],
      ["pooja_joshi", "Pooja Joshi", "pooja@pass123"],
      ["rohit_kumar", "Rohit Kumar", "rohit@pass123"],
      ["deepika_sen", "Deepika Sen", "deepika@pass123"]
    ];

    for (const [username, name, rawPassword] of sampleUsers) {
      const hashedPassword = await bcrypt.hash(rawPassword, 10);
      await db.run(insertUserQuery, [username, name, hashedPassword]);
    }

    console.log("Database initialized and 10 users seeded successfully.");
    await db.close();
  } catch (error) {
    console.error(`Database initialization error: ${error.message}`);
    process.exit(1);
  }
};

initializeDatabase();
