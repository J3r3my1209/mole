const adminMiddleware = (req, res, next) => {
  if (req.usuario && req.usuario.role === 'admin') {
    next(); // Si es admin, lo deja pasar al controlador
  } else {
    res.status(403).json({ msg: 'Acceso denegado. Se requieren permisos de administrador.' });
  }
};

module.exports = adminMiddleware;