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
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM Instrumentos WHERE id_instrumento = ?',
      [req.params.id]
    )
    if (rows.length === 0) return res.status(404).json({ error: 'Instrumento no encontrado' })
    res.json(rows[0])
  } catch (err) {
    console.error('Error al buscar instrumento:', err)
    res.status(500).json({ error: 'Error del servidor' })
  }
})

// Agregar un nuevo instrumento
router.post('/', async (req, res) => {
  try {
    const { nombre, tipo, precio, stock, id_proveedor } = req.body
    if (!nombre || !tipo || !precio || !id_proveedor)
      return res.status(400).json({ error: 'Faltan datos obligatorios' })

    const [result] = await pool.query(
      'INSERT INTO Instrumentos (nombre, tipo, precio, stock, id_proveedor) VALUES (?, ?, ?, ?, ?)',
      [nombre, tipo, precio, stock || 0, id_proveedor]
    )

    res.status(201).json({ message: 'Instrumento agregado', id: result.insertId })
  } catch (err) {
    console.error('Error al agregar instrumento:', err)
    res.status(500).json({ error: 'Error del servidor' })
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
