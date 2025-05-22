import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { LayoutDashboard, Users, CalendarDays, Package, LogOut, Menu, X, Settings, Sun, Moon, Eye as AppIcon } from 'lucide-react';

const SidebarLink = ({ to, icon, children, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ease-in-out group
       ${isActive
         ? 'bg-indigo-600 text-white shadow-lg'
         : 'text-gray-300 hover:bg-gray-700 hover:text-white'
       }`
    }
  >
    {React.cloneElement(icon, { size: 20, className: "mr-3 group-hover:text-indigo-300 transition-colors" })}
    {children}
  </NavLink>
);


export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // const [darkMode, setDarkMode] = useState(localStorage.getItem('theme') === 'dark');

  // useEffect(() => {
  //   if (darkMode) {
  //     document.documentElement.classList.add('dark');
  //     localStorage.setItem('theme', 'dark');
  //   } else {
  //     document.documentElement.classList.remove('dark');
  //     localStorage.setItem('theme', 'light');
  //   }
  // }, [darkMode]);

  // const toggleDarkMode = () => setDarkMode(!darkMode);


  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-slate-900 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-gray-800 dark:bg-slate-800 text-white transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:flex md:flex-col justify-between shadow-lg`}
      >
        <div>
          <div className="flex items-center justify-center h-20 border-b border-gray-700 dark:border-slate-700">
            <AppIcon size={32} className="text-indigo-400 mr-2" />
            <span className="text-2xl font-bold text-white">LUMINA</span>
          </div>
          <nav className="mt-6 px-3 space-y-2">
            <SidebarLink to="/dashboard/home" icon={<LayoutDashboard />} onClick={closeSidebar}>Dashboard</SidebarLink>
            <SidebarLink to="/dashboard/pacientes" icon={<Users />} onClick={closeSidebar}>Pacientes</SidebarLink>
            <SidebarLink to="/dashboard/citas" icon={<CalendarDays />} onClick={closeSidebar}>Citas</SidebarLink>
            <SidebarLink to="/dashboard/inventario" icon={<Package />} onClick={closeSidebar}>Inventario</SidebarLink>
            {/* <SidebarLink to="/dashboard/configuracion" icon={<Settings />} onClick={closeSidebar}>Configuración</SidebarLink> */}
          </nav>
        </div>
        <div className="px-3 py-4 border-t border-gray-700 dark:border-slate-700">
            {user && (
                 <div className="mb-3 p-2 rounded-md bg-gray-700 dark:bg-slate-700">
                    <p className="text-sm font-medium text-indigo-300 truncate" title={user.name}>{user.name}</p>
                    <p className="text-xs text-gray-400 truncate" title={user.email}>{user.email}</p>
                </div>
            )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-2.5 rounded-lg text-sm font-medium text-red-300 hover:bg-red-500 hover:text-white transition-colors duration-150 ease-in-out group"
          >
            <LogOut size={20} className="mr-3 group-hover:text-white" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black opacity-50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <header className="bg-white dark:bg-slate-800 shadow-md dark:shadow-slate-700">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="text-gray-500 dark:text-gray-400 focus:outline-none md:hidden mr-4"
                  aria-label="Abrir menú lateral"
                >
                  <Menu size={24} />
                </button>
                {/* Puedes poner el título de la sección actual aquí si quieres */}
              </div>
              <div className="flex items-center">
                {/* <button onClick={toggleDarkMode} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 focus:outline-none mr-3">
                  {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button> */}
                {/* Otros iconos o info de usuario */}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-slate-900 p-4 sm:p-6 lg:p-8">
          <Outlet /> {/* Aquí se renderizarán las páginas anidadas */}
        </main>
      </div>
    </div>
  );
}

