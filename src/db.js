import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 12105,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // CONFIGURACIÓN PARA AIVEN SIN ARCHIVO .PEM
  ssl: {
    rejectUnauthorized: false
  }
});

// export const pool = mysql.createPool({
//   host: process.env.DB_HOST,
//   port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 12105,
//   user: process.env.DB_USER || 'avnadmin',
//   password: process.env.DB_PASSWORD, // <--- ASEGÚRATE QUE AQUÍ DIGA PASSWORD
//   database: process.env.DB_NAME || 'melodiainstrumental',
//   ssl: {
//     rejectUnauthorized: false 
//   }
// });