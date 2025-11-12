import express from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { pool } from '../db.js'
import dotenv from 'dotenv'

dotenv.config()
const router = express.Router()

// 🧩 Clave secreta para JWT
const JWT_SECRET = process.env.JWT_SECRET || 'clave_secreta_super_segura'

// ✅ Registro de nuevo usuario
router.post('/register', async (req, res) => {
  try {
    const { nombre, correo, contraseña, rol } = req.body

    // Verificar si el correo ya está registrado
    const [existe] = await pool.query('SELECT * FROM Usuarios WHERE correo = ?', [correo])
    if (existe.length > 0) {
      return res.status(400).json({ error: 'El correo ya está registrado' })
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(contraseña, 10)

    // Insertar usuario en la base de datos
    const [result] = await pool.query(
      'INSERT INTO Usuarios (nombre, correo, contraseña, rol) VALUES (?, ?, ?, ?)',
      [nombre, correo, hashedPassword, rol || 'empleado']
    )

    res.status(201).json({ message: 'Usuario registrado correctamente', id: result.insertId })
  } catch (err) {
    console.error('Error en registro:', err)
    res.status(500).json({ error: 'Error del servidor', detalle: err.message })
  }
})

// ✅ Login de usuario
router.post('/login', async (req, res) => {
  try {
    const { correo, contraseña } = req.body

    // Buscar el usuario por correo
    const [rows] = await pool.query('SELECT * FROM Usuarios WHERE correo = ?', [correo])
    if (rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' })

    const usuario = rows[0]

    // Verificar contraseña
    const passwordValida = await bcrypt.compare(contraseña, usuario.contraseña)
    if (!passwordValida) return res.status(401).json({ error: 'Contraseña incorrecta' })

    // Crear token JWT
    const token = jwt.sign(
      { id_usuario: usuario.id_usuario, rol: usuario.rol },
      JWT_SECRET,
      { expiresIn: '2h' } // duración del token
    )

    res.json({
      message: 'Login exitoso',
      token,
      usuario: {
        id: usuario.id_usuario,
        nombre: usuario.nombre,
        rol: usuario.rol
      }
    })
  } catch (err) {
    console.error('Error en login:', err)
    res.status(500).json({ error: 'Error del servidor', detalle: err.message })
  }
})

export default router
