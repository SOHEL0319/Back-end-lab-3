const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "users.db");
const JWT_SECRET = "MY_SECRET_TOKEN";
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server Running at port ${PORT}`);
    });
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

app.post("/register/", async (req, res) => {
  try {
    const { username, name, password } = req.body;

    if (!username || !name || !password || typeof username !== "string" || typeof name !== "string" || typeof password !== "string" || username.trim() === "" || name.trim() === "") {
      return res.status(400).json({ message: "Invalid request body: username, name, and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password is too short" });
    }

    const trimmedUsername = username.trim();
    const trimmedName = name.trim();

    const selectUserQuery = `SELECT * FROM user WHERE username = ?;`;
    const existingUser = await db.get(selectUserQuery, [trimmedUsername]);

    if (existingUser !== undefined) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const createUserQuery = `
      INSERT INTO user (username, name, password)
      VALUES (?, ?, ?);
    `;

    await db.run(createUserQuery, [trimmedUsername, trimmedName, hashedPassword]);
    res.status(200).json({ message: "User created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post("/login/", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password || typeof username !== "string" || typeof password !== "string" || username.trim() === "") {
      return res.status(400).json({ message: "Username and password are required" });
    }

    const trimmedUsername = username.trim();
    const selectUserQuery = `SELECT * FROM user WHERE username = ?;`;
    const dbUser = await db.get(selectUserQuery, [trimmedUsername]);

    if (dbUser === undefined) {
      return res.status(400).json({ message: "Invalid user" });
    }

    const isPasswordMatched = await bcrypt.compare(password, dbUser.password);

    if (isPasswordMatched === true) {
      const payload = { username: dbUser.username };
      const jwt_token = jwt.sign(payload, JWT_SECRET);
      res.status(200).json({ jwt_token });
    } else {
      res.status(400).json({ message: "Invalid password" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = app;
