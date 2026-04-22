import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

// ✅ Cargar variables de entorno UNA sola vez, al inicio de todo
dotenv.config()

import productosRoutes from './routes/productos.js'
import proveedoresRoutes from './routes/proveedores.js'
import clientesRoutes from './routes/clientes.js'
import pedidosRoutes from './routes/pedidos.js'
import ventasRoutes from './routes/ventas.js'
import detalleVentaRoutes from './routes/detalleventa.js'
import authRoutes from './routes/auth.js'
import usuariosRoutes from './routes/usuarios.js'

const app = express()

// ✅ CORS configurado para producción y desarrollo
const allowedOrigins = [
  process.env.FRONTEND_URL,    // URL de Vercel en producción
  'https://react-proyect-sena-adso.vercel.app',  // Creado directamente como respaldo seguro
  'http://localhost:5173',     // Vite dev server
  'http://localhost:3000',     // Fallback local
].filter(Boolean)

app.use(cors({
  origin: (origin, callback) => {
    // Permitir requests sin origin (Postman, Railway health checks)
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes(origin)) return callback(null, true)
    callback(new Error(`CORS bloqueado para origin: ${origin}`))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(express.json())

// ✅ Rutas de la API
app.use('/api/proveedores', proveedoresRoutes)
app.use('/api/clientes', clientesRoutes)
app.use('/api/pedidos', pedidosRoutes)
app.use('/api/productos', productosRoutes)
app.use('/api/ventas', ventasRoutes)
app.use('/api/detalleventa', detalleVentaRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/usuarios', usuariosRoutes)

// ✅ Health check para Railway
app.get('/', (req, res) => res.json({ status: 'API funcionando correctamente' }))

// ✅ Puerto dinámico: Railway inyecta process.env.PORT automáticamente
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en puerto ${PORT}`)
})