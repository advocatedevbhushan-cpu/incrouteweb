const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

async function run() {
  const dbUrl = process.env.DATABASE_URL || "";
  if (!dbUrl) {
    console.error("DATABASE_URL is not configured in your .env file.");
    process.exit(1);
  }

  console.log("Connecting to database...");
  const match = dbUrl.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
  if (!match) {
    console.error("DATABASE_URL format is invalid in .env");
    process.exit(1);
  }
  const [, user, pass, host, port, database] = match;

  let connection;
  try {
    connection = await mysql.createConnection({
      host,
      port: Number(port),
      user,
      password: decodeURIComponent(pass),
      database,
      multipleStatements: true // Allows running multiple queries separated by semicolons
    });
    console.log("🟢 Connected to database successfully.");
  } catch (err) {
    console.error("🔴 Failed to connect to MySQL database:", err.message);
    console.log("\nPlease ensure your local MySQL server is running (e.g. via XAMPP, Laragon, or command line) and credentials are correct.");
    process.exit(1);
  }

  try {
    const migrationPath = path.join(__dirname, '../migrations/20260713_incroute_books_mvp.sql');
    console.log(`Reading migration script from: ${migrationPath}`);
    const migrationSql = fs.readFileSync(migrationPath, 'utf8');

    console.log("Applying Books tables migration...");
    await connection.query(migrationSql);
    console.log("🟢 Books tables migration applied successfully.");

    const seedPath = path.join(__dirname, '../seeds/20260713_incroute_books_reference_seed.sql');
    console.log(`Reading reference seeds from: ${seedPath}`);
    const seedSql = fs.readFileSync(seedPath, 'utf8');

    console.log("Applying Books reference seeds...");
    await connection.query(seedSql);
    console.log("🟢 Books reference seeds applied successfully.");

  } catch (err) {
    console.error("🔴 Migration error:", err.message);
  } finally {
    await connection.end();
    console.log("Disconnected from database.");
  }
}

run().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
