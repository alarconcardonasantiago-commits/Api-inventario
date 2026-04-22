import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

// Carga las variables de entorno
dotenv.config()

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  // Aiven suele usar puertos como 12105 o 24802, asegúrate de que coincida
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 12105, 
  user: process.env.DB_USER || 'avnadmin',
  password: process.env.DB_PASSWORD,// Verifica si en tu código usas DB_PASS o DB_PASSWORD
  database: process.env.DB_NAME || 'melodiainstrumental',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // CRÍTICO PARA AIVEN: El plan gratuito exige SSL siempre
  ssl: {
    ca: fs.readFileSync('"C:\Users\User\Downloads\ca.pem"') // Ruta al certificado ca.pem
  }
})