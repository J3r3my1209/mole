import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
  // Estados para datos del servidor
  const [stats, setStats] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Estado para controlar la pestaña activa: 'dashboard', 'usuarios', o 'categorias'
  const [pestanaActiva, setPestanaActiva] = useState('dashboard');

  // Estado para el formulario de nueva categoría global
  const [nuevaCat, setNuevaCat] = useState({ nombre: '', icono: '💰', tipo: 'Gasto' });
  const [mensajeForm, setMensajeForm] = useState({ texto: '', tipo: '' });

  // Configuración de llamadas a la API
  const token = localStorage.getItem('token'); 
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  // Cargar datos al inicializar el componente
  const cargarDatosAdmin = async () => {
    try {
      const [statsRes, usersRes, catRes] = await Promise.all([
        axios.get(`${API_URL}/api/admin/stats`, config),
        axios.get(`${API_URL}/api/admin/usuarios`, config),
        axios.get(`${API_URL}/api/admin/categorias`, config)
      ]);

      setStats(statsRes.data);
      setUsuarios(usersRes.data);
      setCategorias(catRes.data);
    } catch (error) {
      console.error("Error al cargar datos de administrador", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatosAdmin();
  }, []);

  // Manejar el envío de una nueva categoría
  const handleCrearCategoria = async (e) => {
    e.preventDefault();
    if (!nuevaCat.nombre.trim()) {
      setMensajeForm({ texto: 'El nombre de la categoría es requerido.', tipo: 'error' });
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/api/admin/categorias`, nuevaCat, config);
      setMensajeForm({ texto: response.data.msg, tipo: 'exito' });
      setNuevaCat({ nombre: '', icono: '💰', tipo: 'Gasto' });
      
      // Refrescar la lista de categorías sin recargar la página
      const catRes = await axios.get(`${API_URL}/api/admin/categorias`, config);
      setCategorias(catRes.data);
    } catch (error) {
      console.error(error);
      setMensajeForm({ texto: 'Error al procesar la solicitud en el backend.', tipo: 'error' });
    }
  };

  if (cargando) return <div className="text-center p-10 font-medium text-gray-600">Cargando panel de control corporativo...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Encabezado Principal */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Panel de Control General</h1>
          <p className="text-sm text-gray-500 mt-1">Consola administrativa de No Tan De Una</p>
        </div>
        <div className="text-xs bg-purple-100 text-purple-800 font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider mt-2 md:mt-0 self-start">
          Modo Administrador
        </div>
      </div>

      {/* Menú de Pestañas de Navegación */}
      <div className="flex space-x-2 border-b border-gray-200 mb-6">
        <button
          onClick={() => setPestanaActiva('dashboard')}
          className={`px-4 py-2.5 font-semibold text-sm transition-all rounded-t-lg ${pestanaActiva === 'dashboard' ? 'border-b-2 border-purple-600 text-purple-600 bg-purple-50' : 'text-gray-500 hover:text-gray-700'}`}
        >
          📈 Resumen de Métricas
        </button>
        <button
          onClick={() => setPestanaActiva('usuarios')}
          className={`px-4 py-2.5 font-semibold text-sm transition-all rounded-t-lg ${pestanaActiva === 'usuarios' ? 'border-b-2 border-purple-600 text-purple-600 bg-purple-50' : 'text-gray-500 hover:text-gray-700'}`}
        >
          👥 Gestión de Usuarios ({usuarios.length})
        </button>
        <button
          onClick={() => setPestanaActiva('categorias')}
          className={`px-4 py-2.5 font-semibold text-sm transition-all rounded-t-lg ${pestanaActiva === 'categorias' ? 'border-b-2 border-purple-600 text-purple-600 bg-purple-50' : 'text-gray-500 hover:text-gray-700'}`}
        >
          ⚙️ Categorías Globales ({categorias.length})
        </button>
      </div>

      {/* ========================================================= */}
      {/* PESTAÑA 1: METRICAS                                       */}
      {/* ========================================================= */}
      {pestanaActiva === 'dashboard' && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-blue-500">
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Usuarios Registrados</p>
              <p className="text-4xl font-black text-gray-800 mt-2">{stats?.totalUsuarios ?? 0}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-green-500">
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Volumen Transaccionado</p>
              <p className="text-4xl font-black text-gray-800 mt-2">
                ${stats?.volumenTotal ? stats.volumenTotal.toLocaleString('es-EC', { minimumFractionDigits: 2 }) : "0,00"}
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-purple-500">
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Operaciones en la App</p>
              <p className="text-4xl font-black text-gray-800 mt-2">{stats?.totalOperaciones ?? 0}</p>
            </div>
          </div>
          <div className="bg-purple-50 p-6 rounded-xl border border-purple-100">
            <h3 className="font-bold text-purple-800 text-lg mb-2">💡 Resumen de Operación</h3>
            <p className="text-sm text-purple-950 leading-relaxed">
              Como administrador puedes configurar los catálogos base del sistema. Las categorías agregadas en la tercera pestaña impactarán de forma directa el menú desplegable del formulario del cliente.
            </p>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* PESTAÑA 2: AUDITORÍA DE USUARIOS                          */}
      {/* ========================================================= */}
      {pestanaActiva === 'usuarios' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b">
            <h2 className="text-lg font-bold text-gray-800">Historial de Cuentas y Accesos</h2>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-600 text-xs uppercase font-bold border-b">
                <th className="p-4">Nombre Completo</th>
                <th className="p-4">Correo Electrónico</th>
                <th className="p-4">Rol Asignado</th>
                <th className="p-4">Estado Conexión</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-gray-700 text-sm">
              {usuarios.map((user, i) => (
                <tr key={user._id || user.correo || i} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-semibold text-gray-900">{user.nombre}</td>
                  <td className="p-4 text-gray-500">{user.correo}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${user.estado === 'Activo' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {user.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ========================================================= */}
      {/* PESTAÑA 3: CATEGORÍAS GLOBALES                           */}
      {/* ========================================================= */}
      {pestanaActiva === 'categorias' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulario para añadir categoría */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-fit">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Nueva Categoría Global</h2>
            
            {mensajeForm.texto && (
              <div className={`p-3 rounded-lg text-xs font-bold mb-4 ${mensajeForm.tipo === 'exito' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                {mensajeForm.texto}
              </div>
            )}

            <form onSubmit={handleCrearCategoria} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase">Nombre</label>
                <input
                  type="text"
                  value={nuevaCat.nombre}
                  onChange={(e) => setNuevaCat({ ...nuevaCat, nombre: e.target.value })}
                  placeholder="Ej. Educación, Mascotas"
                  className="mt-1 w-full p-2.5 border rounded-lg text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase">Icono (Emoji)</label>
                  <input
                    type="text"
                    maxLength={2}
                    value={nuevaCat.icono}
                    onChange={(e) => setNuevaCat({ ...nuevaCat, icono: e.target.value })}
                    className="mt-1 w-full p-2.5 border rounded-lg text-sm text-center bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase">Tipo</label>
                  <select
                    value={nuevaCat.tipo}
                    onChange={(e) => setNuevaCat({ ...nuevaCat, tipo: e.target.value })}
                    className="mt-1 w-full p-2.5 border rounded-lg text-sm bg-gray-50 focus:bg-white focus:outline-none"
                  >
                    <option value="Gasto">📉 Gasto</option>
                    <option value="Ingreso">📈 Ingreso</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-purple-600 text-white font-bold text-sm py-2.5 px-4 rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
              >
                Inyectar al Sistema Global
              </button>
            </form>
          </div>

          {/* Listado de categorías existentes */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 bg-gray-50 border-bAn">
              <h2 className="text-lg font-bold text-gray-800">Catálogo Actual en la Plataforma</h2>
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-600 text-xs uppercase font-bold border-b">
                  <th className="p-4 w-20 text-center">Visual</th>
                  <th className="p-4">Identificador de Categoría</th>
                  <th className="p-4">Naturaleza</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-700 text-sm">
                {categorias.map((cat, i) => (
                  <tr key={cat._id || i} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-2xl text-center bg-gray-50/50">{cat.icono}</td>
                    <td className="p-4 font-bold text-gray-900">{cat.nombre}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${cat.tipo === 'Ingreso' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {cat.tipo}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;