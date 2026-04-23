import express from 'express'
import { pool } from '../db.js'

const router = express.Router()

// ✅ Obtener todos los pedidos
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.id_pedido, p.fecha_pedido, p.estado, 
             pr.nombre AS proveedor, pr.contacto, pr.telefono 
      FROM pedidos p
      LEFT JOIN proveedores pr ON p.id_proveedor = pr.id_proveedor
      ORDER BY p.id_pedido DESC
    `)
    res.json(rows)
  } catch (err) {
    console.error('Error al obtener pedidos:', err)
    res.status(500).json({ error: 'Error del servidor' })
  }
})

// ✅ Obtener un pedido por ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.id_pedido, p.fecha_pedido, p.estado, 
             pr.nombre AS proveedor, pr.contacto, pr.telefono 
      FROM pedidos p
      LEFT JOIN proveedores pr ON p.id_proveedor = pr.id_proveedor
      WHERE p.id_pedido = ?
    `, [req.params.id])

    if (rows.length === 0) return res.status(404).json({ error: 'Pedido no encontrado' })
    res.json(rows[0])
  } catch (err) {
    console.error('Error al obtener pedido:', err)
    res.status(500).json({ error: 'Error del servidor' })
  }
})

// ✅ Crear un nuevo pedido
router.post('/', async (req, res) => {
  try {
    const { id_proveedor, fecha_pedido, estado } = req.body
    const [result] = await pool.query(
      'INSERT INTO pedidos (id_proveedor, fecha_pedido, estado) VALUES (?, ?, ?)',
      [id_proveedor, fecha_pedido, estado]
    )
    res.status(201).json({ message: 'Pedido agregado correctamente', id: result.insertId })
  } catch (err) {
    console.error('Error al agregar pedido:', err)
    res.status(500).json({ error: 'Error del servidor', detalle: err.message })
  }
})

// ✅ Actualizar un pedido
router.put('/:id', async (req, res) => {
  try {
    const { id_proveedor, fecha_pedido, estado } = req.body
    const [result] = await pool.query(
      'UPDATE pedidos SET id_proveedor=?, fecha_pedido=?, estado=? WHERE id_pedido=?',
      [id_proveedor, fecha_pedido, estado, req.params.id]
    )
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Pedido no encontrado' })
    res.json({ message: 'pedido actualizado correctamente' })
  } catch (err) {
    console.error('Error al actualizar pedido:', err)
    res.status(500).json({ error: 'Error del servidor' })
  }
})

// ✅ Eliminar un pedido
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM pedidos WHERE id_pedido = ?', [req.params.id])
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Pedido no encontrado' })
    res.json({ message: 'Pedido eliminado correctamente' })
  } catch (err) {
    console.error('Error al eliminar pedido:', err)
    res.status(500).json({ error: 'Error del servidor' })
  }
})

export default router
