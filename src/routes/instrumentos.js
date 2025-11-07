import express from 'express'
import { pool } from '../db.js'

const router = express.Router()

// Obtener todos los instrumentos
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Instrumentos')
    res.json(rows)
  } catch (err) {
    console.error('Error al obtener instrumentos:', err)
    res.status(500).json({ error: 'Error del servidor' })
  }
})

// Obtener un instrumento por ID
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Instrumentos')
    res.json(rows)
  } catch (err) {
    console.error('❌ Error al obtener instrumentos:', err)
    res.status(500).json({ error: 'Error del servidor', detalle: err.message })
  }
})


// Agregar un nuevo instrumento
router.post('/', async (req, res) => {
  try {
    const { nombre, tipo, precio, stock, id_proveedor } = req.body

    const [result] = await pool.query(
      'INSERT INTO Instrumentos (nombre, tipo, precio, stock, id_proveedor) VALUES (?, ?, ?, ?, ?)',
      [nombre, tipo, precio, stock, id_proveedor]
    )

    res.json({ message: 'Instrumento agregado', id: result.insertId })
  } catch (err) {
    console.error('❌ Error al agregar instrumento:', err)
    res.status(500).json({ error: 'Error del servidor', detalle: err.message })
  }
})

// Actualizar un instrumento
router.put('/:id', async (req, res) => {
  try {
    const { nombre, tipo, precio, stock, id_proveedor } = req.body
    const [result] = await pool.query(
      'UPDATE Instrumentos SET nombre=?, tipo=?, precio=?, stock=?, id_proveedor=? WHERE id_instrumento=?',
      [nombre, tipo, precio, stock, id_proveedor, req.params.id]
    )
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Instrumento no encontrado' })
    res.json({ message: 'Instrumento actualizado correctamente' })
  } catch (err) {
    console.error('Error al actualizar instrumento:', err)
    res.status(500).json({ error: 'Error del servidor' })
  }
})

// Eliminar un instrumento
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM Instrumentos WHERE id_instrumento = ?', [req.params.id])
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Instrumento no encontrado' })
    res.json({ message: 'Instrumento eliminado correctamente' })
  } catch (err) {
    console.error('Error al eliminar instrumento:', err)
    res.status(500).json({ error: 'Error del servidor' })
  }
})

export default router
