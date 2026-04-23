import express from 'express';
import bcrypt from 'bcrypt';
import { pool } from '../db.js';

const router = express.Router();

// ✅ Obtener todos los usuarios
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id_usuario, nombre, correo, rol, estado, fecha_creacion FROM usuarios ORDER BY id_usuario DESC');
        res.json(rows);
    } catch (error) {
        console.error('Error obteniendo usuarios:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ✅ Crear un usuario nuevo (similar a registro)
router.post('/', async (req, res) => {
    try {
        const { nombre, correo, contraseña, rol, estado } = req.body;
        
        // Comprobar si existe
        const [existe] = await pool.query('SELECT * FROM usuarios WHERE correo = ?', [correo]);
        if (existe.length > 0) return res.status(400).json({ error: 'El correo electrónico ya se encuentra registrado' });

        const hashedPwd = await bcrypt.hash(contraseña, 10);
        
        const [result] = await pool.query(
            'INSERT INTO usuarios (nombre, correo, contraseña, rol, estado) VALUES (?, ?, ?, ?, ?)',
            [nombre, correo, hashedPwd, rol || 'empleado', estado || 'Activo']
        );
        res.status(201).json({ message: 'Usuario creado exitosamente', id: result.insertId });
    } catch (error) {
        console.error('Error insertando usuario:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
});

// ✅ Obtener usuario específico
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id_usuario, nombre, correo, rol, estado FROM usuarios WHERE id_usuario = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ✅ Actualizar usuario / Desactivar
router.put('/:id', async (req, res) => {
    try {
        const { nombre, correo, contraseña, rol, estado } = req.body;
        const userId = req.params.id;
        
        let query = 'UPDATE usuarios SET ';
        const params = [];
        const updateFields = [];

        if (nombre) { updateFields.push('nombre = ?'); params.push(nombre); }
        if (correo) { updateFields.push('correo = ?'); params.push(correo); }
        if (rol) { updateFields.push('rol = ?'); params.push(rol); }
        if (estado) { updateFields.push('estado = ?'); params.push(estado); }

        if (contraseña) { 
            const hashedPwd = await bcrypt.hash(contraseña, 10);
            updateFields.push('contraseña = ?'); 
            params.push(hashedPwd); 
        }

        if (updateFields.length === 0) return res.status(400).json({ error: 'No se enviaron datos para actualizar' });

        query += updateFields.join(', ') + ' WHERE id_usuario = ?';
        params.push(userId);

        const [result] = await pool.query(query, params);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Usuario no encontrado' });

        res.json({ message: 'Usuario actualizado correctamente' });
    } catch (error) {
        console.error('Error actualizando usuario:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
});

export default router;
