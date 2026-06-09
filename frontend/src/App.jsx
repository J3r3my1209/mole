import { Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { auth } from './config/firebase.js';
import { onAuthStateChanged } from 'firebase/auth';
import axios from 'axios';
import { Navbar } from './components/Navbar';
import Login from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { Profile } from './pages/Profile';
import GastosDashboard from './components/GastosDashboard';
import AdminDashboard from './pages/AdminDashboard'; 

function App() {
  const [user, setUser] = useState(null);
  const [mongoUser, setMongoUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        const emailFormateado = currentUser.email ? currentUser.email.trim().toLowerCase() : "";
        
        try {
          const token = await currentUser.getIdToken();
          localStorage.setItem('token', token); 

          const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
          
          const config = {
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          };

          // 1. Sincronización limpia
          const respuestaSincro = await axios.post(
            `${API_URL}/api/usuarios/sincronizar`, 
            { 
              email: emailFormateado,
              nombre: currentUser.displayName || "Usuario de Google",
              firebaseId: currentUser.uid
            }, 
            config
          );

          // 2. Solicitamos el perfil fresco de la base de datos
          const respuestaPerfil = await axios.get(`${API_URL}/api/usuarios/perfil`, config);
          let datosUsuario = respuestaPerfil.data;

          if (datosUsuario && datosUsuario.correo) {
            datosUsuario.email = datosUsuario.correo;
          }

          if (emailFormateado === 'vivasmoreirajeremy@gmail.com') {
            datosUsuario = { ...datosUsuario, role: 'admin' };
          }

          setMongoUser(datosUsuario);

        } catch (error) {
          console.error("Error al sincronizar o validar el rol con el backend:", error);
          
          if (emailFormateado === 'vivasmoreirajeremy@gmail.com') {
            setMongoUser({ email: 'vivasmoreirajeremy@gmail.com', correo: 'vivasmoreirajeremy@gmail.com', role: 'admin' });
          }
        }
      } else {
        setMongoUser(null);
        localStorage.removeItem('token');
      }
      
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 font-medium">Cargando aplicación...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar usuario={mongoUser} />

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<AdminDashboard />} />

        <Route path="/" element={
          <>
            <div className="text-center my-12 px-4">
              <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
                Controla tus gastos, <span className="text-emerald-500">sin tantas vueltas.</span>
              </h1>
              <p className="text-gray-600 max-w-md mx-auto">
                Bienvenido a No Tan de Una. La herramienta perfecta para saber a dónde se te está yendo la plata cada fin de mes.
              </p>
            </div>

            {user ? (
              <div className="pb-12">
                <GastosDashboard />
              </div>
            ) : (
              <div className="text-center mt-6">
                <p className="text-gray-500">Inicia sesión para empezar a registrar tus gastos.</p>
              </div>
            )}
          </>
        } />
      </Routes>
    </div>
  );
}

export default App;