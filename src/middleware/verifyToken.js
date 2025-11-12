import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()
// ✅ Middleware para verificar token JWT
export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization']

    // Verificar si viene el header Authorization
    if (!authHeader) {
      return res.status(401).json({ error: 'Token no proporcionado' })
    }

    // Extraer el token del formato "Bearer <token>"
    const token = authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({ error: 'Token inválido o faltante' })
    }

    // ✅ Verificar el token con la clave secreta
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Guardar los datos del usuario en la request
    req.user = decoded

    // Continuar hacia la siguiente función
    next()
  } catch (err) {
    console.error('❌ Error al verificar token:', err.message)

    if (err.name === 'TokenExpiredError') {
      return res.status(403).json({ error: 'El token ha expirado, por favor inicia sesión nuevamente' })
    }

    if (err.name === 'JsonWebTokenError') {
      return res.status(403).json({ error: 'Token inválido o manipulado' })
    }

    // Cualquier otro error
    return res.status(500).json({ error: 'Error interno al verificar el token' })
  }
}

// ✅ Middleware opcional: verificar si el usuario es administrador
export const verifyAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuario no autenticado' })
    }

    if (req.user.rol !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado: se requiere rol de administrador' })
    }

    // Si todo está bien, continuar
    next()
  } catch (err) {
    console.error('❌ Error en verificación de administrador:', err.message)
    return res.status(500).json({ error: 'Error interno al verificar privilegios' })
  }
}
