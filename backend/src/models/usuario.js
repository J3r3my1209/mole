import mongoose from 'mongoose';

const usuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  correo: { type: String, required: true, unique: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' }, 
  activo: { type: Boolean, default: true } 
});

// ¡ASEGÚRATE DE QUE ESTA LÍNEA ESTÉ ASÍ!
const Usuario = mongoose.model('Usuario', usuarioSchema);
export default Usuario;