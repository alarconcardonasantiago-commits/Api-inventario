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
  'https://api-inventario-bpli.onrender.com',  // Creado directamente como respaldo seguro
  'http://localhost:5173',     // Vite dev server
  'http://localhost:3000',     // Fallback local
].filter(Boolean)

// ✅ CORS configurado de forma segura pero flexible
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'http://localhost:5173',
      'http://localhost:3000'
    ];

    // Si el origen está en la lista o si es una petición local/Postman (origin es undefined)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // En lugar de lanzar un Error que rompa la API (500), 
      // simplemente negamos el acceso CORS (esto es más limpio)
      console.warn(`⚠️ Intento de acceso bloqueado por CORS desde: ${origin}`);
      callback(null, false); 
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

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