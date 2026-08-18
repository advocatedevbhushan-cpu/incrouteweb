import mysql, { Pool, PoolConnection } from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

let platformPool: Pool | null = null;
let booksPool: Pool | null = null;

export function getPlatformPool(): Pool {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) throw new Error("DATABASE_URL not configured");

  if (!platformPool) {
    platformPool = mysql.createPool({
      uri: dbUrl,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      idleTimeout: 60000,
      enableKeepAlive: true,
      multipleStatements: true,
    });
  }
  return platformPool;
}

export function getBooksPool(): Pool {
  const dbUrl = process.env.BOOKS_DATABASE_URL || process.env.DATABASE_URL;
  if (!dbUrl) throw new Error("BOOKS_DATABASE_URL or DATABASE_URL not configured");

  if (!booksPool) {
    booksPool = mysql.createPool({
      uri: dbUrl,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      idleTimeout: 60000,
      enableKeepAlive: true,
      multipleStatements: true,
    });
  }
  return booksPool;
}

export async function getPlatformConnection(): Promise<PoolConnection> {
  return getPlatformPool().getConnection();
}

export async function getBooksConnection(): Promise<PoolConnection> {
  return getBooksPool().getConnection();
}

/**
 * Execute a query against the Platform DB pool directly.
 * Automatically handles connection checkout and release without leaks.
 */
export async function queryPlatform<T = any>(sql: string, params: any[] = []): Promise<[T, any]> {
  const pool = getPlatformPool();
  return pool.query(sql, params) as Promise<[T, any]>;
}

/**
 * Safely acquire a connection, run callback, and guarantee release in finally block.
 */
export async function withPlatformConnection<T>(
  callback: (conn: PoolConnection) => Promise<T>
): Promise<T> {
  const conn = await getPlatformConnection();
  try {
    return await callback(conn);
  } finally {
    conn.release();
  }
}

/**
 * Safely execute a transaction against the Platform DB.
 */
export async function withPlatformTransaction<T>(
  callback: (conn: PoolConnection) => Promise<T>
): Promise<T> {
  const conn = await getPlatformConnection();
  try {
    await conn.beginTransaction();
    const result = await callback(conn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

/**
 * Execute a query against Books DB pool directly.
 */
export async function queryBooks<T = any>(sql: string, params: any[] = []): Promise<[T, any]> {
  const pool = getBooksPool();
  return pool.query(sql, params) as Promise<[T, any]>;
}

/**
 * Safely acquire a Books connection, run callback, and guarantee release in finally block.
 */
export async function withBooksConnection<T>(
  callback: (conn: PoolConnection) => Promise<T>
): Promise<T> {
  const conn = await getBooksConnection();
  try {
    return await callback(conn);
  } finally {
    conn.release();
  }
}
