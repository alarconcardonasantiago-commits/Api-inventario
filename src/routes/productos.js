import express from 'express'
import { pool } from '../db.js'
import { verifyToken, verifyAdmin } from '../middleware/verifyToken.js'

const router = express.Router()

//Obtener todos los productos (público)
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Productos')
    res.json(rows)
  } catch (err) {
    console.error('❌ Error al obtener productos:', err)
    res.status(500).json({ error: 'Error del servidor', detalle: err.message })
  }
})

//buscar productos por nombre o tipo (insensible a mayúsculas)
router.get('/buscar', async (req, res) => {
  try {
    let { nombre, tipo } = req.query

    // Normalizar valores (eliminar espacios y pasar a minúsculas)
    nombre = nombre ? nombre.trim().toLowerCase() : null
    tipo = tipo ? tipo.trim().toLowerCase() : null

    // Si no hay filtros, devolver todos los productos
    if (!nombre && !tipo) {
      const [rows] = await pool.query('SELECT * FROM Productos')
      return res.json(rows)
    }

    // Consulta dinámica
    let query = 'SELECT * FROM Productos WHERE 1=1'
    const params = []

    if (nombre) {
      query += ' AND LOWER(nombre) LIKE ?'
      params.push(`%${nombre}%`)
    }

    if (tipo) {
      query += ' AND LOWER(tipo) LIKE ?'
      params.push(`%${tipo}%`)
    }

    const [rows] = await pool.query(query, params)

    if (rows.length === 0) {
      return res.status(404).json({ message: 'No se encontraron productos con esos criterios' })
    }

    res.json(rows)
  } catch (err) {
    console.error('❌ Error en búsqueda de productos:', err)
    res.status(500).json({ error: 'Error del servidor', detalle: err.message })
  }
})

// Obtener producto por ID (público)
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Productos WHERE id_producto = ?', [req.params.id])
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' })
    }
    res.json(rows[0])
  } catch (err) {
    console.error('❌ Error al obtener producto:', err)
    res.status(500).json({ error: 'Error del servidor', detalle: err.message })
  }
})

// Agregar producto (solo usuarios autenticados)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { nombre, tipo, precio, stock, id_proveedor } = req.body

    if (!nombre || !precio) {
      return res.status(400).json({ error: 'El nombre y el precio son obligatorios' })
    }

    const [result] = await pool.query(
      'INSERT INTO Productos (nombre, tipo, precio, stock, id_proveedor) VALUES (?, ?, ?, ?, ?)',
      [nombre, tipo, precio, stock || 0, id_proveedor || null]
    )

    res.status(201).json({ message: '✅ Producto agregado correctamente', id: result.insertId })
  } catch (err) {
    console.error('❌ Error al agregar producto:', err)
    res.status(500).json({ error: 'Error del servidor', detalle: err.message })
  }
})

//Actualizar producto (solo usuarios autenticados)
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { nombre, tipo, precio, stock, id_proveedor } = req.body

    const [result] = await pool.query(
      'UPDATE Productos SET nombre=?, tipo=?, precio=?, stock=?, id_proveedor=? WHERE id_producto=?',
      [nombre, tipo, precio, stock, id_proveedor, req.params.id]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' })
    }

    res.json({ message: '✅ Producto actualizado correctamente' })
  } catch (err) {
    console.error('❌ Error al actualizar producto:', err)
    res.status(500).json({ error: 'Error del servidor', detalle: err.message })
  }
})

//Eliminar producto (solo administradores)
router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM Productos WHERE id_producto = ?', [req.params.id])

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' })
    }

    res.json({ message: '🗑️ Producto eliminado correctamente' })
  } catch (err) {
    console.error('❌ Error al eliminar producto:', err)
    res.status(500).json({ error: 'Error del servidor', detalle: err.message })
  }
})

export default router
