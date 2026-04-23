import express from 'express'
import { pool } from '../db.js'
import { verifyToken, verifyAdmin } from '../middleware/verifyToken.js'

const router = express.Router()

//Obtener todos los productos (público)
router.get('/', async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : null
    const limit = req.query.limit ? parseInt(req.query.limit) : null

    if (page && limit) {
      const offset = (page - 1) * limit
      const [totalRows] = await pool.query('SELECT COUNT(*) as total FROM productos')
      const total = totalRows[0].total
      const totalPages = Math.ceil(total / limit)
      const [rows] = await pool.query('SELECT * FROM productos LIMIT ? OFFSET ?', [limit, offset])
      
      return res.json({
        datos: rows,
        total,
        totalPages,
        currentPage: page
      })
    }

    // Comportamiento original si no hay paginación
    const [rows] = await pool.query('SELECT * FROM productos')
    res.json(rows)
  } catch (err) {
    console.error('❌ Error al obtener productos:', err)
    res.status(500).json({ error: 'Error del servidor', detalle: err.message })
  }
})

//buscar productos por nombre o tipo (insensible a mayúsculas)
router.get('/buscar', async (req, res) => {
  try {
    let { nombre, tipo, page, limit } = req.query

    // Normalizar valores (eliminar espacios y pasar a minúsculas)
    nombre = nombre ? nombre.trim().toLowerCase() : null
    tipo = tipo ? tipo.trim().toLowerCase() : null
    
    const isPaginated = page && limit
    const pageNum = isPaginated ? parseInt(page) : 1
    const limitNum = isPaginated ? parseInt(limit) : null
    const offset = isPaginated ? (pageNum - 1) * limitNum : 0

    // Si no hay filtros de búsqueda
    if (!nombre && !tipo) {
      if (isPaginated) {
        const [totalRows] = await pool.query('SELECT COUNT(*) as total FROM productos')
        const total = totalRows[0].total
        const totalPages = Math.ceil(total / limitNum)
        const [rows] = await pool.query('SELECT * FROM productos LIMIT ? OFFSET ?', [limitNum, offset])
        return res.json({ datos: rows, total, totalPages, currentPage: pageNum })
      } else {
        const [rows] = await pool.query('SELECT * FROM productos')
        return res.json(rows)
      }
    }

    // Consulta dinámica
    let queryBase = 'FROM productos WHERE 1=1'
    const params = []

    if (nombre) {
      queryBase += ' AND LOWER(nombre) LIKE ?'
      params.push(`%${nombre}%`)
    }

    if (tipo) {
      queryBase += ' AND LOWER(tipo) LIKE ?'
      params.push(`%${tipo}%`)
    }

    if (isPaginated) {
      // Primero obtener el conteo total para la paginación
      const [totalRows] = await pool.query(`SELECT COUNT(*) as total ${queryBase}`, params)
      const total = totalRows[0].total
      const totalPages = Math.ceil(total / limitNum)

      // Luego obtener los datos paginados
      const [rows] = await pool.query(`SELECT * ${queryBase} LIMIT ? OFFSET ?`, [...params, limitNum, offset])
      
      return res.json({
        datos: rows,
        total,
        totalPages,
        currentPage: pageNum
      })
    } else {
      // Búsqueda sin paginar (comportamiento original)
      const [rows] = await pool.query(`SELECT * ${queryBase}`, params)
      
      if (rows.length === 0) {
        return res.status(404).json({ message: 'No se encontraron productos con esos criterios' })
      }
      
      res.json(rows)
    }
  } catch (err) {
    console.error('❌ Error en búsqueda de productos:', err)
    res.status(500).json({ error: 'Error del servidor', detalle: err.message })
  }
})

// Obtener producto por ID (público)
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM productos WHERE id_producto = ?', [req.params.id])
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
      'INSERT INTO productos (nombre, tipo, precio, stock, id_proveedor) VALUES (?, ?, ?, ?, ?)',
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
      'UPDATE productos SET nombre=?, tipo=?, precio=?, stock=?, id_proveedor=? WHERE id_producto=?',
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
    const [result] = await pool.query('DELETE FROM productos WHERE id_producto = ?', [req.params.id])

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
