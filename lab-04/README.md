# Lab 4: Registration, Login and JWT

| Information | Details | Additional Information |
| :--- | :--- | :--- |
| **Student Name** | NAYAB SYED SOHEL MAHINIYAZ | |
| **Student Registration Number** | 252U1R5112 | Class & Section: 313 AI DE 2B |
| **Study Level : UG/PG/Doctorate** | UG | Year & Term: 2 & 2 |
| **Subject Name** | Backend Development Fundamentals | |
| **Teacher / Faculty Name** | Mr Yugandhar Gurjalwar | |
| **Name of the Assessment** | LAB REPORT - 4 | |
| **Date of Submission** | 14/11/2026 | |

---

## Objective

The objective of Lab 4 is to design and implement secure user authentication and authorization mechanisms for a backend web service using Express.js, SQLite, bcrypt, and JSON Web Tokens (JWT):
1. **Password Hashing & Salting**: Secure user credentials before persistence using `bcrypt.hash()` with an industry-standard cost factor (salt rounds of 10), ensuring raw passwords are never stored or logged in plain text.
2. **User Registration Workflow (`POST /register/`)**: Implement robust request body validation, enforce password length policies (minimum 6 characters), inspect existing records to reject duplicate usernames with `400 Bad Request`, and persist hashed credentials via parameterized SQL queries.
3. **User Authentication Workflow (`POST /login/`)**: Authenticate registered users by querying the database, verifying existence (`400 Bad Request` for unknown users), verifying password validity using `bcrypt.compare()`, and issuing a signed JWT token upon success.
4. **Token Generation & Principle of Least Privilege**: Construct signed JWT tokens containing **only the username** in the payload, signed with a symmetric secret key using HMAC-SHA256 (`HS256`).
5. **Token Inspection & Decoding**: Deconstruct the issued JWT on `jwt.io` to inspect its tripartite structure (Header, Payload, Signature) and verify cryptographic integrity.
6. **SQL Injection Prevention**: Ensure absolute SQL safety by strictly utilizing parameterized queries (`?` placeholders) for all user-supplied data inputs.

---

## Technologies Used

- **Node.js** (v24.19.0): Server-side JavaScript runtime environment executing asynchronous non-blocking event-driven operations.
- **Express.js** (v4.21.2): Minimalist web application framework providing routing, request handling, and middleware integration (`express.json()`).
- **SQLite3** (v5.1.7) & **sqlite** (v5.1.1): Lightweight, file-based relational database engine and promise-based abstraction layer for asynchronous query execution.
- **bcrypt** (v5.1.1): Cryptographic password hashing library implementing the Blowfish-based adaptive hashing algorithm with configurable salt rounds.
- **jsonwebtoken** (v9.0.2): Compact, URL-safe standard implementation (RFC 7519) for signing and verifying JSON Web Tokens.
- **Postman**: API client tool for testing successful and erroneous registration and authentication HTTP requests.

---

## Folder Structure

```text
lab-04/
├── .gitignore
├── README.md
├── app.js
├── package-lock.json
├── package.json
├── screenshots/
│   ├── 01_post_register_success.png
│   ├── 02_post_register_duplicate_user.png
│   ├── 03_post_register_missing_fields.png
│   ├── 04_post_register_short_password.png
│   ├── 05_post_login_success.png
│   ├── 06_post_login_invalid_user.png
│   ├── 07_post_login_invalid_password.png
│   ├── 08_post_login_missing_password.png
│   ├── 09_jwt_io_decoded_token.png
│   └── 10_sqlite_cli_verification.png
├── setupDb.js
└── users.db
```

---

## Database Design

The database schema consists of a dedicated `user` table stored in `users.db`:

```sql
CREATE TABLE user (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password TEXT NOT NULL
);
```

### Table Schema Attributes

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | `PRIMARY KEY AUTOINCREMENT` | Unique auto-incrementing numerical identifier for each user record. |
| `username` | `TEXT` | `UNIQUE NOT NULL` | Unique login handle for the user (case-sensitive index, cannot be duplicated). |
| `name` | `TEXT` | `NOT NULL` | Full display name of the registered user. |
| `password` | `TEXT` | `NOT NULL` | Cryptographically hashed password generated via `bcrypt.hash()` with 10 salt rounds ($2b$10$...). Plaintext passwords are never stored. |

---

## Installation & Running Instructions

### Prerequisites
- Node.js (v18 or higher recommended)
- npm (Node Package Manager)

### 1. Clone & Navigate
Navigate to the `lab-04/` directory within the repository:
```bash
cd lab-04
```

### 2. Install Dependencies
Install all required production dependencies:
```bash
npm install
```

### 3. Initialize & Seed Database
Run the database setup script to drop existing tables, construct the `user` table, and seed 10 sample users with bcrypt-hashed passwords:
```bash
npm run setup-db
```
Output:
```text
Database initialized and 10 users seeded successfully.
```

### 4. Start the Application Server
Launch the Express.js server on port 3000:
```bash
npm start
```
Output:
```text
Server Running at port 3000
```

---

## Endpoints Table

| HTTP Method | Endpoint Path | Request Body | Status Code | Response Body | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **POST** | `/register/` | `{"username", "name", "password"}` | `200 OK` | `{"message": "User created successfully"}` | Registers a new user after verifying fields, validating password length (>= 6), checking username uniqueness, and hashing the password with bcrypt. |
| **POST** | `/register/` | `{"username", "name", "password"}` | `400 Bad Request` | `{"message": "User already exists"}` | Returned when the requested `username` already exists in the database. |
| **POST** | `/register/` | `{"username", "name", "password"}` | `400 Bad Request` | `{"message": "Password is too short"}` | Returned when the supplied password has fewer than 6 characters. |
| **POST** | `/register/` | `{"username", "name", "password"}` | `400 Bad Request` | `{"message": "Invalid request body: username, name, and password are required"}` | Returned when one or more required fields are missing or empty. |
| **POST** | `/login/` | `{"username", "password"}` | `200 OK` | `{"jwt_token": "<token>"}` | Authenticates user credentials via `bcrypt.compare()` and returns a signed JWT token containing the username in its payload. |
| **POST** | `/login/` | `{"username", "password"}` | `400 Bad Request` | `{"message": "Invalid user"}` | Returned when the username does not match any registered record in the database. |
| **POST** | `/login/` | `{"username", "password"}` | `400 Bad Request` | `{"message": "Invalid password"}` | Returned when the password does not match the hashed password stored in the database. |
| **POST** | `/login/` | `{"username"}` | `400 Bad Request` | `{"message": "Username and password are required"}` | Returned when either username or password is missing from the request payload. |

---

## Complete Clean Source Code

### package.json
```json
{
  "name": "lab-04",
  "version": "1.0.0",
  "description": "Lab 4: Registration, Login and JWT",
  "main": "app.js",
  "scripts": {
    "start": "node app.js",
    "setup-db": "node setupDb.js"
  },
  "dependencies": {
    "bcrypt": "^5.1.1",
    "express": "^4.21.2",
    "jsonwebtoken": "^9.0.2",
    "sqlite": "^5.1.1",
    "sqlite3": "^5.1.7"
  }
}
```

### setupDb.js
```javascript
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
```

### app.js
```javascript
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
```

---

## Output & Screenshots

### 1. Successful User Registration (`POST /register/`)
Validates payload, verifies username uniqueness, hashes the password via bcrypt (10 rounds), stores the record, and returns `200 OK` with `{"message": "User created successfully"}`.
![POST Register Success](screenshots/01_post_register_success.png)

### 2. Duplicate Username Rejection (`POST /register/`)
Detects existing username (`rahul_sharma`) in SQLite database using parameterized query and rejects request with `400 Bad Request` and `{"message": "User already exists"}`.
![POST Register Duplicate User](screenshots/02_post_register_duplicate_user.png)

### 3. Registration Missing Required Fields (`POST /register/`)
Rejects requests containing missing or empty required body attributes with `400 Bad Request` and `{"message": "Invalid request body: username, name, and password are required"}`.
![POST Register Missing Fields](screenshots/03_post_register_missing_fields.png)

### 4. Registration Password Length Policy Error (`POST /register/`)
Enforces security constraints by rejecting passwords containing fewer than 6 characters with `400 Bad Request` and `{"message": "Password is too short"}`.
![POST Register Short Password](screenshots/04_post_register_short_password.png)

### 5. Successful User Authentication & JWT Generation (`POST /login/`)
Verifies user existence in SQLite, compares plain text password against stored bcrypt hash using `bcrypt.compare()`, and returns `200 OK` with a signed `jwt_token`.
![POST Login Success](screenshots/05_post_login_success.png)

### 6. Login Non-Existent User Error (`POST /login/`)
Identifies unknown username (`ghost_user`) during database lookup and halts authentication with `400 Bad Request` and `{"message": "Invalid user"}`.
![POST Login Invalid User](screenshots/06_post_login_invalid_user.png)

### 7. Login Incorrect Password Error (`POST /login/`)
Bcrypt comparison detects credential mismatch and safely rejects request with `400 Bad Request` and `{"message": "Invalid password"}` without exposing internal hash data.
![POST Login Invalid Password](screenshots/07_post_login_invalid_password.png)

### 8. Login Missing Password Error (`POST /login/`)
Input validation rejects requests omitting either credential parameter with `400 Bad Request` and `{"message": "Username and password are required"}`.
![POST Login Missing Password](screenshots/08_post_login_missing_password.png)

### 9. JWT Structure Inspection at jwt.io Debugger
Token decoded at `jwt.io` demonstrating tripartite encoding:
- **Header**: `{"alg": "HS256", "typ": "JWT"}`
- **Payload**: `{"username": "rahul_sharma", "iat": 1795010237}` (containing strictly only the username claim)
- **Signature**: Verified against the constant secret key `MY_SECRET_TOKEN`
![JWT.IO Decoded Token](screenshots/09_jwt_io_decoded_token.png)

### 10. SQLite CLI Database Verification (users.db)
Windows PowerShell terminal inspection executing `sqlite3 users.db` verifying:
1. State 1: 10 initial seeded users with bcrypt salted hashes ($2b$10$...).
2. State 2: Successful persistence of newly registered user (`neha_gupta`, id: 11) with non-reversible bcrypt password hash.
![SQLite CLI Verification](screenshots/10_sqlite_cli_verification.png)

---

## JSON Web Token (JWT) Deep Dive & Architecture

### Structure of a JSON Web Token
A JSON Web Token consists of three base64url-encoded components separated by periods (`.`):
$$\text{JWT} = \text{base64Url}(\text{Header}) \,.\, \text{base64Url}(\text{Payload}) \,.\, \text{Signature}$$

```text
 eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InJhaHVsX3NoYXJtYSIsImlhdCI6MTc5NTAxMDIzN30.gxhIMMxUhPZieo8KP0WjfilWnqj9q6Z8bNfWsaTsrM0
 └─────────────────┬─────────────────┘ └──────────────────────┬──────────────────────┘ └──────────────────────┬──────────────────────┘
                 Header                                     Payload                                       Signature
```

#### 1. Header
The header identifies the cryptographic algorithm and the token type:
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```
- `alg`: The hashing algorithm used to sign the token (`HS256` represents HMAC using SHA-256).
- `typ`: The type of token, designated as `JWT`.

#### 2. Payload (Claims)
The payload contains the claims. As explicitly mandated by the principle of least privilege:
```json
{
  "username": "rahul_sharma",
  "iat": 1795010237
}
```
- `username`: Subject identifier representing the authenticated user.
- `iat`: Issued At timestamp (Unix epoch time in seconds) denoting when the token was created.
- **Security Rule**: The payload is base64url encoded, **not encrypted**. Anyone possessing the token can inspect its claims. Consequently, sensitive data such as passwords, API keys, or credit card numbers must **never** be placed inside the payload.

#### 3. Signature
The signature prevents tampering and verifies that the sender of the JWT is who it says it is:
$$\text{Signature} = \text{HMACSHA256}\Big(\text{base64Url}(\text{Header}) + \text{"."} + \text{base64Url}(\text{Payload}), \, \text{secret}\Big)$$

If an attacker modifies the username inside the payload from `rahul_sharma` to `admin`, the recalculated signature on the server will not match the signature attached to the token, causing immediate rejection.

---

## Viva Questions & Answers

### 1. Why POST for login?
- **Security & Data Privacy**: HTTP `GET` requests append parameters directly to the query string within the URL (e.g., `/login?username=user&password=123`). URLs are recorded in browser histories, proxy logs, server access logs, and HTTP referer headers. `POST` requests encapsulate credentials inside the HTTP request body, which is encrypted during transit under TLS/HTTPS.
- **RESTful Semantics**: A login operation initiates authentication processing, invokes CPU-intensive cryptographic hashing (`bcrypt.compare`), and generates a new session token artifact (`jwt_token`). `GET` requests are specified as safe, idempotent, and cacheable; login operations are state-dependent and must never be cached by intermediate proxies.

### 2. Hash vs encrypt?
- **Hashing**:
  - **One-way function**: A mathematical algorithm that transforms arbitrary data into a fixed-length string that cannot be mathematically inverted or decrypted back to its original value.
  - **Purpose**: Integrity verification and credential storage (e.g., `bcrypt`, `SHA-256`, `Argon2`).
  - **Verification**: Done by hashing incoming input and comparing the resulting hashes.
- **Encryption**:
  - **Two-way function**: A mathematical algorithm that transforms plaintext into ciphertext using a key, with the explicit design that the original plaintext can be recovered using the corresponding decryption key.
  - **Purpose**: Confidentiality of data in transit or rest where retrieval of the original plaintext is necessary (e.g., `AES-256`, `RSA`).

### 3. What does jwt.sign need?
`jwt.sign()` accepts three primary parameters:
1. **Payload** (`Object` or `Buffer`): The claims data to encode into the token (e.g., `{ username: user.username }`).
2. **Secret or Private Key** (`String` or `Buffer`): The secret key for symmetric algorithms (`HS256`) or private key for asymmetric algorithms (`RS256`) used to compute the digital signature.
3. **Options** (`Object`, Optional): Cryptographic and lifecycle configurations such as algorithm (`algorithm: "HS256"`), token expiration (`expiresIn: "1h"`), issuer (`issuer: "aurora"`), and audience (`audience: "students"`).

### 4. What should never go into the payload?
- **Plaintext or Hashed Passwords**: Never include passwords or bcrypt hashes. The payload is merely base64url encoded and can be instantly decoded by anyone intercepting the token.
- **Personally Identifiable Information (PII)**: Sensitive personal data such as Aadhaar/SSN, bank account numbers, physical addresses, or phone numbers.
- **Sensitive Credentials**: Private API keys, database connection strings, or system authorization secrets.
- **Bulky Application State**: Large datasets or large arrays that unnecessarily bloat HTTP headers on every subsequent request.

### 5. Why is bcrypt preferred over standard SHA-256 for passwords?
- Standard cryptographic hash functions like SHA-256 and MD5 were engineered for extreme throughput and performance (hashing gigabytes of data per second). This speed allows attackers using modern GPUs and ASICs to compute billions of guesses per second during brute-force and dictionary attacks.
- `bcrypt` is an **adaptive key-derivation function** that incorporates a configurable work factor (salt rounds). Increasing the salt factor exponentially increases the computational time per hash calculation, rendering mass brute-force attacks computationally and financially prohibitive. Furthermore, bcrypt automatically generates a cryptographically secure unique salt for every hash, neutralizing pre-computed Rainbow Table attacks.

---

## Debugging Notes

During development and automated testing of Lab 4, several backend operational defects were investigated, diagnosed, and resolved:

### 1. Missing `await` on Asynchronous Bcrypt Functions
- **Symptom**: `bcrypt.hash()` returned a pending `Promise { <pending> }` object rather than a string hash, resulting in `[object Promise]` being saved into the SQLite database.
- **Root Cause**: `bcrypt.hash()` and `bcrypt.compare()` are asynchronous methods returning Promises. Omitting `await` causes code execution to proceed prematurely.
- **Solution**: Enforced `await` across all bcrypt invocations:
  ```javascript
  const hashedPassword = await bcrypt.hash(password, 10);
  const isPasswordMatched = await bcrypt.compare(password, dbUser.password);
  ```

### 2. Missing `express.json()` Middleware
- **Symptom**: `req.body` evaluated to `undefined` during `POST /register/` and `POST /login/`, causing fatal `TypeError: Cannot destructure property 'username' of 'req.body' as it is undefined`.
- **Root Cause**: Express does not parse JSON request bodies by default.
- **Solution**: Registered built-in JSON body parsing middleware at application startup:
  ```javascript
  app.use(express.json());
  ```

### 3. SQL Injection Risk on Raw Query Concatenation
- **Symptom**: Potential vulnerability where malicious usernames containing SQL fragments (e.g. `' OR '1'='1`) could alter query logic.
- **Root Cause**: String interpolation (`SELECT * FROM user WHERE username = '${username}'`).
- **Solution**: Replaced all dynamic SQL construction with parameterized query placeholders (`?`):
  ```javascript
  const selectUserQuery = `SELECT * FROM user WHERE username = ?;`;
  const dbUser = await db.get(selectUserQuery, [trimmedUsername]);
  ```

### 4. Port Conflict (`EADDRINUSE: 3000`)
- **Symptom**: `Error: listen EADDRINUSE: address already in use :::3000` when launching server instances during continuous test cycles.
- **Root Cause**: A zombie Node.js process retained an active socket bind on port 3000.
- **Solution**: Added fallback configuration (`process.env.PORT || 3000`) and graceful termination handlers in test scripts.

---

## Conclusion

Lab 4 was completed with full adherence to academic and technical specifications:
- **Registration**: Successfully created `POST /register/` with validation, duplicate rejection, and bcrypt hashing with 10 salt rounds.
- **Authentication**: Successfully created `POST /login/` with username verification, bcrypt comparison, and signed JWT issuance.
- **Security Standards**: JWT payload strictly restricted to `username`, passwords stored strictly as salted hashes, and SQL queries executed with parameterization.
- **Comprehensive Verification**: All 8 API test scenarios verified live, with 10 high-fidelity dark-themed Postman and SQLite CLI screenshots generated and embedded.
