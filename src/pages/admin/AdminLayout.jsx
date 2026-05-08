import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import { FiHome, FiShoppingBag, FiBox, FiLayers, FiUsers, FiFileText, FiSettings, FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import { useState } from 'react';
import toast from 'react-hot-toast';

const menuItems = [
  { to: '/admin/dashboard', icon: <FiHome size={20} />, label: 'لوحة التحكم' },
  { to: '/admin/orders', icon: <FiShoppingBag size={20} />, label: 'الطلبات' },
  { to: '/admin/products', icon: <FiBox size={20} />, label: 'المنتجات' },
  { to: '/admin/inventory', icon: <FiLayers size={20} />, label: 'المخزون' },
  { to: '/admin/customers', icon: <FiUsers size={20} />, label: 'الزبائن' },
  { to: '/admin/invoices', icon: <FiFileText size={20} />, label: 'الفواتير' },
  { to: '/admin/settings', icon: <FiSettings size={20} />, label: 'الإعدادات' },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    toast.success('تم تسجيل الخروج');
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-dark-50 flex" dir="rtl">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 right-0 z-50 w-64 bg-dark-900 text-white transform transition-transform duration-300 md:translate-x-0 md:static ${sidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
        <div className="flex items-center gap-3 px-6 py-5 border-b border-dark-800">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center text-white font-bold">N</div>
          <div>
            <h2 className="font-bold text-sm">Nasira Tiba3a</h2>
            <p className="text-xs text-dark-400">لوحة الإدارة</p>
          </div>
        </div>
        <nav className="p-4 space-y-1 flex-1">
          {menuItems.map(item => (
            <Link key={item.to} to={item.to} onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                location.pathname === item.to ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30' : 'text-dark-400 hover:text-white hover:bg-dark-800'
              }`}>
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-dark-800">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-dark-400 hover:text-danger-500 hover:bg-dark-800 transition-all w-full">
            <FiLogOut size={20} /> تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <header className="bg-white/80 backdrop-blur-lg border-b border-dark-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 sm:px-6 h-16">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 rounded-lg text-dark-600 hover:bg-dark-100">
              <FiMenu size={22} />
            </button>
            <h1 className="text-lg font-semibold text-dark-800">
              {menuItems.find(i => i.to === location.pathname)?.label || 'لوحة الإدارة'}
            </h1>
            <Link to="/" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              زيارة المتجر ←
            </Link>
          </div>
        </header>
        <main className="p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
