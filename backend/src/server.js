import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import admin from 'firebase-admin';
import conectarDB from './config/db.js';
import usuarioRouter from './routers/usuarioRouter.js';
import gastoRouter from './routers/gastoRouter.js'; 
import adminRouter from './routers/adminRouter.js';
import { readFileSync } from 'fs';

// 1. Configurar variables de entorno y base de datos
dotenv.config();
conectarDB();

// 2. Inicializar Firebase Admin (Seguro para Local y Render)
let firebaseConfig;

if (process.env.FIREBASE_KEYS_JSON) {
    firebaseConfig = JSON.parse(process.env.FIREBASE_KEYS_JSON);
} else {
    firebaseConfig = JSON.parse(readFileSync('./firebase-keys.json', 'utf8'));
}

admin.initializeApp({
    credential: admin.credential.cert(firebaseConfig)
});

// 3. CREAR LA APP PRIMERO
const app = express();

// 4. Middlewares globales
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'https://ntdu.vercel.app' 
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// 5. Definir las rutas
app.use('/api/usuarios', usuarioRouter);
app.use('/api/gastos', gastoRouter); 
app.use('/api/admin', adminRouter); // 👈 2. REGISTRAMOS LAS RUTAS DE ADMINISTRACIÓN

// Ruta base de prueba
app.get('/', (req, res) => {
    res.json({ message: "API de Desarrollo de Aplicaciones Web corriendo", status: "ok" });
});

// 6. Encender el servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🟢 Servidor corriendo de forma segura en: http://localhost:${PORT}`);
});