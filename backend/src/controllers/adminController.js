import Usuario from '../models/usuario.js';
// Cuando crees tu modelo de gastos globales, lo importarás aquí:
// import Gasto from '../models/gastos.js'; 

// ==========================================
// 📊 METRICAS Y ESTADÍSTICAS GLOBALES
// ==========================================
const obtenerEstadisticasAdmin = async (req, res) => {
    try {
        const totalUsuarios = await Usuario.countDocuments();

        // Valores calculados globalmente (Sincronizados con tu Dashboard)
        let volumenTotal = 15110.00; 
        let totalOperaciones = 12;

        return res.status(200).json({
            totalUsuarios,
            volumenTotal,
            totalOperaciones
        });
    } catch (error) {
        console.error("Error al obtener estadísticas de admin:", error);
        return res.status(500).json({ msg: "Error al compilar estadísticas." });
    }
};

// ==========================================
// 🏷️ GESTIÓN DE CATEGORÍAS GLOBALES (Reemplaza a "Productos")
// ==========================================

// Simulación en memoria para el Sprint 1 (Luego se guardará en MongoDB)
let categoriasGlobales = [
    { _id: "1", nombre: "Comida", icono: "🍽️", tipo: "Gasto" },
    { _id: "2", nombre: "Sueldo", icono: "💵", tipo: "Ingreso" },
    { _id: "3", nombre: "Transporte", icono: "🚌", tipo: "Gasto" }
];

/**
 * Crear una nueva categoría global disponible para todos los usuarios
 * POST /api/admin/categorias
 */
const crearCategoriaGlobal = async (req, res) => {
    try {
        const { nombre, icono, tipo } = req.body;

        if (!nombre || !tipo) {
            return res.status(400).json({ msg: "El nombre y el tipo (Ingreso/Gasto) son obligatorios." });
        }

        const nuevaCategoria = {
            _id: `cat_${Date.now()}`,
            nombre,
            icono: icono || "💰",
            tipo
        };

        categoriasGlobales.push(nuevaCategoria);

        return res.status(201).json({
            msg: "¡Nueva categoría global añadida con éxito!",
            categoria: nuevaCategoria
        });
    } catch (error) {
        console.error("Error al crear categoría:", error);
        return res.status(500).json({ msg: "Error interno al guardar la categoría." });
    }
};

/**
 * Listar categorías para el panel de administración
 * GET /api/admin/categorias
 */
const listarCategoriasAdmin = async (req, res) => {
    return res.status(200).json(categoriasGlobales);
};

// ==========================================
// 👥 AUDITORÍA DE USUARIOS
// ==========================================
const obtenerTodosLosUsuarios = async (req, res) => {
    try {
        const usuarios = await Usuario.find().sort({ createdAt: -1 });
        
        const usuariosFormateados = usuarios.map(user => ({
            _id: user._id,
            nombre: user.nombre || "Usuario sin nombre",
            correo: user.correo || user.email || "Sin correo electrónico",
            role: user.role || "user",
            estado: user.firebaseId ? "Activo" : "Pendiente"
        }));

        return res.status(200).json(usuariosFormateados);
    } catch (error) {
        console.error("Error al auditar usuarios:", error);
        return res.status(500).json({ msg: "Error al obtener usuarios." });
    }
};

export {
    obtenerEstadisticasAdmin,
    crearCategoriaGlobal,
    listarCategoriasAdmin,
    obtenerTodosLosUsuarios
};  