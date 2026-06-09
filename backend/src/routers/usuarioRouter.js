import express from 'express';
import { autenticarOSincronizarUsuario, perfil, actualizarPerfil } from '../controllers/usuarioController.js';
import authMiddleware from '../middleware/authMiddleware.js'; // Tu middleware que valida el token

const router = express.Router();

// Ruta de sincronización (POST)
router.post('/sincronizar', authMiddleware, autenticarOSincronizarUsuario);

// Ruta de perfil (GET)
router.get('/perfil', authMiddleware, perfil);

router.put('/perfil', authMiddleware, actualizarPerfil);

export default router;