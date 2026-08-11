import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

async function runSetup() {
  console.log("🚀 Starting Database Setup CLI...");

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("❌ Error: DATABASE_URL environment variable is not defined.");
    process.exit(1);
  }

  let connection;
  try {
    connection = await mysql.createConnection({
      uri: dbUrl,
      multipleStatements: true,
    });

    console.log("📦 Connected to database. Executing schema initialization...");

    const sqlPath = path.join(process.cwd(), "setup-database.sql");
    if (fs.existsSync(sqlPath)) {
      const sql = fs.readFileSync(sqlPath, "utf-8");
      await connection.query(sql);
      console.log("✅ Core database tables created successfully.");
    }

    const booksMigrationPath = path.join(process.cwd(), "migrations", "20260713_incroute_books_mvp.sql");
    if (fs.existsSync(booksMigrationPath)) {
      const booksSql = fs.readFileSync(booksMigrationPath, "utf-8");
      await connection.query(booksSql);
      console.log("✅ Books module migrations applied successfully.");
    }

    const adminEmail = process.env.ADMIN_EMAIL || "d.bhushan@incroute.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "Admin@2026";
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    const now = new Date().toISOString().slice(0, 23).replace("T", " ");

    const [existing]: any = await connection.query("SELECT id FROM `User` WHERE role = 'SUPER_ADMIN' LIMIT 1");
    if (existing.length > 0) {
      await connection.query(
        "UPDATE `User` SET email = ?, passwordHash = ?, updatedAt = ? WHERE id = ?",
        [adminEmail, passwordHash, now, existing[0].id]
      );
      console.log(`✅ Updated SUPER_ADMIN user: ${adminEmail}`);
    } else {
      const id = "admin_" + Date.now().toString(36);
      await connection.query(
        `INSERT INTO \`User\` (id, email, passwordHash, firstName, lastName, phone, role, isActive, emailVerified, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, adminEmail, passwordHash, "Dev", "Bhushan", "+918707552183", "SUPER_ADMIN", 1, 1, now, now]
      );
      console.log(`✅ Created SUPER_ADMIN user: ${adminEmail}`);
    }

    console.log("🎉 Database setup completed successfully!");
  } catch (err: any) {
    console.error("❌ Database setup failed:", err.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

runSetup();
