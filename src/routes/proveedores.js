import express from 'express'
import { pool } from '../db.js'

const router = express.Router()

// Obtener todos los proveedores
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM proveedores')
    res.json(rows)
  } catch (err) {
    console.error('Error al obtener proveedores:', err)
    res.status(500).json({ error: 'Error del servidor' })
  }
})

// Obtener un proveedor por ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM proveedores WHERE id_proveedor = ?', [req.params.id])
    if (rows.length === 0) return res.status(404).json({ error: 'Proveedor no encontrado' })
    res.json(rows[0])
  } catch (err) {
    console.error('Error al obtener proveedor:', err)
    res.status(500).json({ error: 'Error del servidor' })
  }
})

// Agregar proveedor
router.post('/', async (req, res) => {
  try {
    const { nombre, contacto, telefono, direccion } = req.body
    const [result] = await pool.query(
      'INSERT INTO Proveedores (nombre, contacto, telefono, direccion) VALUES (?, ?, ?, ?)',
      [nombre, contacto, telefono, direccion]
    )
    res.status(201).json({ message: 'Proveedor agregado', id: result.insertId })
  } catch (err) {
    console.error('Error al agregar proveedor:', err)
    res.status(500).json({ error: 'Error del servidor' })
  }
})

// Actualizar proveedor
router.put('/:id', async (req, res) => {
  try {
    const { nombre, contacto, telefono, direccion } = req.body
    const [result] = await pool.query(
      'UPDATE Proveedores SET nombre=?, contacto=?, telefono=?, direccion=? WHERE id_proveedor=?',
      [nombre, contacto, telefono, direccion, req.params.id]
    )
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Proveedor no encontrado' })
    res.json({ message: 'Proveedor actualizado correctamente' })
  } catch (err) {
    console.error('Error al actualizar proveedor:', err)
    res.status(500).json({ error: 'Error del servidor' })
  }
})

// Eliminar proveedor
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM Proveedores WHERE id_proveedor = ?', [req.params.id])
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Proveedor no encontrado' })
    res.json({ message: 'Proveedor eliminado correctamente' })
  } catch (err) {
    console.error('Error al eliminar proveedor:', err)
    res.status(500).json({ error: 'Error del servidor' })
  }
})

export default router
