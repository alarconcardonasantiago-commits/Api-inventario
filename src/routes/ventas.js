import express from 'express'
import { pool } from '../db.js'

const router = express.Router()

// ✅ Obtener todas las ventas
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT v.id_venta, v.fecha, v.total, 
             c.nombre AS cliente, c.correo, c.telefono
      FROM Ventas v
      LEFT JOIN Clientes c ON v.id_cliente = c.id_cliente
      ORDER BY v.id_venta DESC
    `)
    res.json(rows)
  } catch (err) {
    console.error('Error al obtener ventas:', err)
    res.status(500).json({ error: 'Error del servidor' })
  }
})

// ✅ Obtener una venta por ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT v.id_venta, v.fecha_venta, v.total, 
             c.nombre AS cliente, c.correo, c.telefono
      FROM Ventas v
      LEFT JOIN Clientes c ON v.id_cliente = c.id_cliente
      WHERE v.id_venta = ?
    `, [req.params.id])

    if (rows.length === 0) return res.status(404).json({ error: 'Venta no encontrada' })
    res.json(rows[0])
  } catch (err) {
    console.error('Error al obtener venta:', err)
    res.status(500).json({ error: 'Error del servidor' })
  }
})

// ✅ Agregar una nueva venta
router.post('/', async (req, res) => {
  try {
    const { id_cliente, fecha_venta, total } = req.body
    const [result] = await pool.query(
      'INSERT INTO Ventas (id_cliente, fecha, total) VALUES (?, ?, ?)',
      [id_cliente, fecha_venta, total]
    )
    res.status(201).json({ message: 'Venta registrada correctamente', id: result.insertId })
  } catch (err) {
    console.error('Error al registrar venta:', err)
    res.status(500).json({ error: 'Error del servidor', detalle: err.message })
  }
})

// ✅ Actualizar una venta
router.put('/:id', async (req, res) => {
  try {
    const { id_cliente, fecha_venta, total } = req.body
    const [result] = await pool.query(
      'UPDATE Ventas SET id_cliente=?, fecha=?, total=? WHERE id_venta=?',
      [id_cliente, fecha_venta, total, req.params.id]
    )
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Venta no encontrada' })
    res.json({ message: 'Venta actualizada correctamente' })
  } catch (err) {
    console.error('Error al actualizar venta:', err)
    res.status(500).json({ error: 'Error del servidor' })
  }
})

// ✅ Eliminar una venta
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM Ventas WHERE id_venta = ?', [req.params.id])
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Venta no encontrada' })
    res.json({ message: 'Venta eliminada correctamente' })
  } catch (err) {
    console.error('Error al eliminar venta:', err)
    res.status(500).json({ error: 'Error del servidor' })
  }
})

export default router
