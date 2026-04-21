import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

// En ESM cada módulo que lee process.env al cargarse debe llamar dotenv.config()
dotenv.config()

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306, // ✅ Puerto para Railway
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined // ✅ SSL opcional para Railway
})
