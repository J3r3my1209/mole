import admin from '../config/firebase.js'; 
import Usuario from '../models/usuario.js'; 

const checkAuth = async (req, res, next) => {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decodedToken = await admin.auth().verifyIdToken(token);
            
            let emailDetectado = decodedToken.email || "";
            if (emailDetectado) {
                emailDetectado = emailDetectado.trim().toLowerCase();
            }

            req.usuario = {
                uid: decodedToken.uid,
                email: emailDetectado,
                name: decodedToken.name || "Usuario de Google"
            };

            if (emailDetectado) {
                try {
                    const usuarioBD = await Usuario.findOne({ correo: emailDetectado });
                    if (usuarioBD) {
                        req.usuario = usuarioBD;
                        req.usuario.id = usuarioBD._id; 
                    }
                } catch (dbError) {
                    console.error("Error al buscar en la base de datos dentro del middleware:", dbError);
                }
            }
            
            return next(); 
        } catch (error) {
            console.error("Error crítico al verificar token de Firebase en middleware:", error);
            return res.status(403).json({ msg: 'Token no válido o expirado desde Firebase.' });
        }
    }

    if (!token) {
        return res.status(401).json({ msg: 'Token no proporcionado o inexistente.' });
    }
};

export default checkAuth;