import express from 'express'
import { pool } from '../db.js'

const router = express.Router()

// ✅ Obtener todos los clientes
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Clientes')
    res.json(rows)
  } catch (err) {
    console.error('Error al obtener clientes:', err)
    res.status(500).json({ error: 'Error del servidor' })
  }
})

// ✅ Obtener cliente por ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Clientes WHERE id_cliente = ?', [req.params.id])
    if (rows.length === 0) return res.status(404).json({ error: 'Cliente no encontrado' })
    res.json(rows[0])
  } catch (err) {
    console.error('Error al obtener cliente:', err)
    res.status(500).json({ error: 'Error del servidor' })
  }
})

// ✅ Agregar cliente
router.post('/', async (req, res) => {
  try {
    const { nombre, correo, telefono, direccion } = req.body
    const [result] = await pool.query(
      'INSERT INTO Clientes (nombre, correo, telefono, direccion) VALUES (?, ?, ?, ?)',
      [nombre, correo, telefono, direccion]
    )
    res.status(201).json({ message: 'Cliente agregado correctamente', id: result.insertId })
  } catch (err) {
    console.error('Error al agregar cliente:', err)
    res.status(500).json({ error: 'Error del servidor', detalle: err.message })
  }
})

// ✅ Actualizar cliente
router.put('/:id', async (req, res) => {
  try {
    const { nombre, correo, telefono, direccion } = req.body
    const [result] = await pool.query(
      'UPDATE Clientes SET nombre=?, correo=?, telefono=?, direccion=? WHERE id_cliente=?',
      [nombre, correo, telefono, direccion, req.params.id]
    )
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Cliente no encontrado' })
    res.json({ message: 'Cliente actualizado correctamente' })
  } catch (err) {
    console.error('Error al actualizar cliente:', err)
    res.status(500).json({ error: 'Error del servidor' })
  }
})

// ✅ Eliminar cliente
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM Clientes WHERE id_cliente = ?', [req.params.id])
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Cliente no encontrado' })
    res.json({ message: 'Cliente eliminado correctamente' })
  } catch (err) {
    console.error('Error al eliminar cliente:', err)
    res.status(500).json({ error: 'Error del servidor' })
  }
})

export default router
