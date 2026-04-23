import express from 'express'
import { pool } from '../db.js'

const router = express.Router()

// ✅ Obtener todas las ventas (Join para formato de panel en Frontend)
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        v.id_venta as id, 
        DATE_FORMAT(v.fecha, '%Y-%m-%d') as fecha, 
        COALESCE(c.nombre, 'Comprador Invitado') AS cliente,
        GROUP_CONCAT(p.nombre SEPARATOR ', ') as producto, 
        COALESCE(SUM(dv.cantidad), 0) as cantidad, 
        v.total, 
        v.estado
      FROM ventas v
      LEFT JOIN clientes c ON v.id_cliente = c.id_cliente
      LEFT JOIN detalle_venta dv ON v.id_venta = dv.id_venta
      LEFT JOIN productos p ON dv.id_instrumento = p.id_producto
      GROUP BY v.id_venta
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
      SELECT v.id_venta as id, DATE_FORMAT(v.fecha, '%Y-%m-%d') as fecha, v.total, v.estado,
             c.nombre AS cliente, c.correo, c.telefono
      FROM ventas v
      LEFT JOIN clientes c ON v.id_cliente = c.id_cliente
      WHERE v.id_venta = ?
    `, [req.params.id])

    if (rows.length === 0) return res.status(404).json({ error: 'Venta no encontrada' })
    res.json(rows[0])
  } catch (err) {
    console.error('Error al obtener venta:', err)
    res.status(500).json({ error: 'Error del servidor' })
  }
})

// ✅ Agregar una nueva venta (Procesando el Checkout del Carrito)
router.post('/', async (req, res) => {
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()

    const { id_cliente, total, detalles } = req.body

    // 1. Insertar Encabezado
    const [ventaResult] = await connection.query(
      'INSERT INTO ventas (id_cliente, total, estado) VALUES (?, ?, ?)',
      [id_cliente || null, total, 'Completado']
    )
    const id_venta = ventaResult.insertId

    // 2. Insertar Multiples Detalles y Reducir el inventario 
    if (detalles && detalles.length > 0) {
      for (const item of detalles) {
        
        // Omitimos "subtotal" porque es generada automáticamente.
        // Agregamos "precio_unitario" porque la base de datos lo exige (no tiene valor por defecto).
        await connection.query(
          'INSERT INTO detalle_venta (id_venta, id_instrumento, cantidad, precio_unitario) VALUES (?, ?, ?, ?)',
          [id_venta, item.id_producto, item.cantidad, item.precio_unitario]
        )

        // Extraer lógica de stock
        await connection.query(
          'UPDATE productos SET stock = stock - ? WHERE id_producto = ?',
          [item.cantidad, item.id_producto]
        )
      }
    }

    // 3. Confirmar la transacción atomica
    await connection.commit()
    res.status(201).json({ message: 'Venta registrada e inventario descontado exitosamente', id: id_venta })
  } catch (err) {
    await connection.rollback()
    console.error('Error al registrar venta desde carrito:', err)
    res.status(500).json({ error: 'Error del servidor', detalle: err.message })
  } finally {
    connection.release()
  }
})

// ✅ Actualizar estado de una venta o datos
router.put('/:id', async (req, res) => {
  try {
    const { id_cliente, fecha, total, estado } = req.body
    
    let query = 'UPDATE ventas SET '
    let params = []
    if (id_cliente !== undefined) { query += 'id_cliente=?, '; params.push(id_cliente) }
    if (fecha !== undefined) { query += 'fecha=?, '; params.push(fecha) }
    if (total !== undefined) { query += 'total=?, '; params.push(total) }
    if (estado !== undefined) { query += 'estado=?, '; params.push(estado) }
    
    query = query.slice(0, -2) + ' WHERE id_venta=?'
    params.push(req.params.id)

    const [result] = await pool.query(query, params)
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
    const [result] = await pool.query('DELETE FROM ventas WHERE id_venta = ?', [req.params.id])
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Venta no encontrada' })
    res.json({ message: 'Venta eliminada correctamente' })
  } catch (err) {
    console.error('Error al eliminar venta:', err)
    res.status(500).json({ error: 'Error del servidor' })
  }
})

export default router
