import Usuario from '../models/usuario.js'; 

// 1. Sincronizar Autenticación / Registro Automático
const autenticarOSincronizarUsuario = async (req, res) => {
    try {
        let emailFinal = (req.usuario && (req.usuario.email || req.usuario.correo)) || (req.body && req.body.email) || "";
        let uidFinal = (req.usuario && req.usuario.uid) || (req.body && req.body.firebaseId) || "";
        let nombreFinal = (req.usuario && req.usuario.name) || (req.body && req.body.nombre) || "Usuario Nuevo";

        if (!emailFinal) {
            return res.status(422).json({ msg: "No se pudo procesar el usuario: Falta el correo electrónico." });
        }

        emailFinal = emailFinal.trim().toLowerCase();
        
        // Si viene un UID válido de Firebase, lo usamos; si no, generamos un identificador único provisional 
        // para que JAMÁS se inserte un valor 'null' o vacío que rompa el índice E11000
        const firebaseIdDefinitivo = uidFinal ? uidFinal.trim() : `oauth_manual_${Date.now()}`;
        const rolAsignado = emailFinal === 'vivasmoreirajeremy@gmail.com' ? 'admin' : 'user';

        // 🚨 SOLUCIÓN DEFINITIVA A NIVEL DE CÓDIGO:
        // Buscamos por correo. Si existe, actualizamos sus campos (incluido el firebaseId para que deje de ser null)
        // Si no existe, creamos el documento asegurando un firebaseId único generado arriba.
        const usuarioSincronizado = await Usuario.findOneAndUpdate(
            { correo: emailFinal },
            { 
                $set: { 
                    nombre: nombreFinal,
                    firebaseId: firebaseIdDefinitivo,
                    role: rolAsignado
                }
            },
            { 
                returnDocument: 'after', // Soluciona el Deprecation Warning de Mongoose
                upsert: true,            // Si no existe, lo crea
                runValidators: false
            }
        );

        return res.status(200).json({
            msg: "Usuario sincronizado con éxito de forma limpia",
            usuario: usuarioSincronizado
        });

    } catch (error) {
        console.error("Error crítico en sincronizarUsuario (Controlador):", error);
        return res.status(500).json({ msg: "Hubo un error interno al procesar el usuario en el backend." });
    }
};

// 2. Ver Perfil (Requerimiento del Sprint 1)
const perfil = async (req, res) => {
    try {
        let emailFinal = (req.usuario && (req.usuario.correo || req.usuario.email)) || "";
        
        if (!emailFinal) {
            return res.status(404).json({ msg: "Usuario no identificado por el servidor." });
        }

        emailFinal = emailFinal.trim().toLowerCase();
        
        const usuarioCompleto = await Usuario.findOne({ correo: emailFinal });

        if (!usuarioCompleto) {
            return res.status(404).json({ msg: "El usuario no existe en la base de datos." });
        }
        
        return res.json(usuarioCompleto);
    } catch (error) {
        console.error("Error al obtener perfil:", error);
        return res.status(500).json({ msg: "Hubo un error al obtener el perfil." });
    }
};

// 3. Actualizar Perfil (Requerimiento del Sprint 1)
const actualizarPerfil = async (req, res) => {
    const { nombre, email } = req.body;

    if (!nombre || !email) {
        return res.status(400).json({ msg: "Todos los campos son obligatorios." });
    }

    try {
        let emailBuscar = (req.usuario && (req.usuario.correo || req.usuario.email)) || email;
        emailBuscar = emailBuscar.trim().toLowerCase();

        const usuario = await Usuario.findOne({ correo: emailBuscar });

        if (!usuario) {
            return res.status(404).json({ msg: "Usuario no encontrado." });
        }

        usuario.nombre = nombre.trim();
        usuario.correo = email.trim().toLowerCase(); 

        const usuarioActualizado = await usuario.save();
        return res.json({
            msg: "Perfil actualizado correctamente en la BDD",
            usuario: usuarioActualizado
        });
    } catch (error) {
        console.error("Error al actualizar perfil:", error);
        return res.status(500).json({ msg: "Hubo un error al actualizar el perfil." });
    }
};

export {
    autenticarOSincronizarUsuario,
    perfil,
    actualizarPerfil
};