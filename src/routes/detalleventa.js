import express from 'express'
import { pool } from '../db.js'

const router = express.Router()
// ✅ Obtener todos los detalles de venta
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT dv.id_detalle, dv.id_venta, dv.id_instrumento, dv.cantidad, dv.subtotal,
             i.nombre AS instrumento, i.precio AS precio_unitario,
             v.fecha AS fecha_venta, v.total AS total_venta
      FROM DetalleVenta dv
      LEFT JOIN Instrumentos i ON dv.id_instrumento = i.id_instrumento
      LEFT JOIN Ventas v ON dv.id_venta = v.id_venta
      ORDER BY dv.id_detalle DESC
    `)
    res.json(rows)
  } catch (err) {
    console.error('Error al obtener detalles de venta:', err)
    res.status(500).json({ error: 'Error del servidor' })
  }
})

// ✅ Obtener un detalle por ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT dv.id_detalle, dv.id_venta, dv.id_instrumento, dv.cantidad, dv.subtotal,
             i.nombre AS instrumento, i.precio AS precio_unitario,
             v.fecha AS fecha_venta, v.total AS total_venta
      FROM DetalleVenta dv
      LEFT JOIN Instrumentos i ON dv.id_instrumento = i.id_instrumento
      LEFT JOIN Ventas v ON dv.id_venta = v.id_venta
      WHERE dv.id_detalle = ?
    `, [req.params.id])

    if (rows.length === 0) return res.status(404).json({ error: 'Detalle de venta no encontrado' })
    res.json(rows[0])
  } catch (err) {
    console.error('Error al obtener detalle de venta:', err)
    res.status(500).json({ error: 'Error del servidor' })
  }
})

// ✅ Agregar un nuevo detalle de venta
router.post('/', async (req, res) => {
  try {
    const { id_venta, id_instrumento, cantidad, subtotal } = req.body
    const [result] = await pool.query(
      'INSERT INTO DetalleVenta (id_venta, id_instrumento, cantidad, subtotal) VALUES (?, ?, ?, ?)',
      [id_venta, id_instrumento, cantidad, subtotal]
    )
    res.status(201).json({ message: 'Detalle de venta agregado correctamente', id: result.insertId })
  } catch (err) {
    console.error('Error al agregar detalle de venta:', err)
    res.status(500).json({ error: 'Error del servidor', detalle: err.message })
  }
})

// ✅ Actualizar un detalle de venta
router.put('/:id', async (req, res) => {
  try {
    const { id_venta, id_instrumento, cantidad, subtotal } = req.body
    const [result] = await pool.query(
      'UPDATE DetalleVenta SET id_venta=?, id_instrumento=?, cantidad=?, subtotal=? WHERE id_detalle=?',
      [id_venta, id_instrumento, cantidad, subtotal, req.params.id]
    )
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Detalle de venta no encontrado' })
    res.json({ message: 'Detalle de venta actualizado correctamente' })
  } catch (err) {
    console.error('Error al actualizar detalle de venta:', err)
    res.status(500).json({ error: 'Error del servidor' })
  }
})

// ✅ Eliminar un detalle de venta
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM DetalleVenta WHERE id_detalle = ?', [req.params.id])
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Detalle de venta no encontrado' })
    res.json({ message: 'Detalle de venta eliminado correctamente' })
  } catch (err) {
    console.error('Error al eliminar detalle de venta:', err)
    res.status(500).json({ error: 'Error del servidor' })
  }
})

export default router
