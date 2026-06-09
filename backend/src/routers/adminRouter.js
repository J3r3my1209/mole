import express from 'express';
import { 
    obtenerEstadisticasAdmin, 
    obtenerTodosLosUsuarios,
    crearCategoriaGlobal,
    listarCategoriasAdmin 
} from '../controllers/adminController.js';
import checkAuth from '../middleware/authMiddleware.js';

const router = express.Router();

const isAdmin = (req, res, next) => {
    if (req.usuario && req.usuario.role === 'admin') {
        return next();
    }
    return res.status(403).json({ msg: "Acceso denegado." });
};

router.use(checkAuth);
router.use(isAdmin);

router.get('/stats', obtenerEstadisticasAdmin);
router.get('/usuarios', obtenerTodosLosUsuarios);

// Rutas de configuración de la App Financiera
router.post('/categorias', crearCategoriaGlobal);
router.get('/categorias', listarCategoriasAdmin);

export default router;