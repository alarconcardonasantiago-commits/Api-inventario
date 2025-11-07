import express from 'express'
import cors from 'cors'
import instrumentosRoutes from './routes/instrumentos.js'

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api/instrumentos', instrumentosRoutes)

app.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000')
})
