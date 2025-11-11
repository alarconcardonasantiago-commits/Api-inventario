import express from 'express'
import cors from 'cors'
import instrumentosRoutes from './routes/instrumentos.js'
import proveedoresRoutes from './routes/proveedores.js'
import clientesRoutes from './routes/clientes.js'
import pedidosRoutes from './routes/pedidos.js'
import ventasRoutes from './routes/ventas.js'
import detalleVentaRoutes from './routes/detalleventa.js'

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api/instrumentos', instrumentosRoutes)
app.use('/api/proveedores', proveedoresRoutes)
app.use('/api/clientes', clientesRoutes)
app.use('/api/pedidos', pedidosRoutes)
app.use('/api/instrumentos', instrumentosRoutes)
app.use('/api/ventas', ventasRoutes)
app.use('/api/detalleventa', detalleVentaRoutes)


app.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000')
  console.log('')
})