import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import { FiHome, FiShoppingBag, FiBox, FiLayers, FiUsers, FiFileText, FiSettings, FiLogOut, FiMenu, FiX, FiExternalLink } from 'react-icons/fi';
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
      <aside className={`fixed inset-y-0 right-0 z-50 w-72 bg-gradient-to-b from-dark-900 via-dark-900 to-primary-900/30 text-white transform transition-transform duration-500 ease-out md:translate-x-0 md:static ${sidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
        {/* Brand */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-white/5">
          <div className="w-11 h-11 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center text-white font-extrabold shadow-lg shadow-primary-500/20">N</div>
          <div>
            <h2 className="font-bold text-sm">Nasira Tiba3a</h2>
            <p className="text-[11px] text-dark-400">لوحة الإدارة</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1 flex-1">
          {menuItems.map(item => {
            const active = location.pathname === item.to;
            return (
              <Link key={item.to} to={item.to} onClick={() => setSidebarOpen(false)}
                className={`group flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-300 ${
                  active
                    ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-600/25'
                    : 'text-dark-400 hover:text-white hover:bg-white/5'
                }`}>
                <span className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
                  {item.icon}
                </span>
                {item.label}
                {active && <span className="mr-auto w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-white/5">
          <button onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-medium text-dark-400 hover:text-red-400 hover:bg-red-500/10 transition-all w-full group">
            <FiLogOut size={20} className="group-hover:rotate-12 transition-transform" />
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-dark-900/60 backdrop-blur-sm z-40 md:hidden animate-fade-in" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <header className="bg-white/70 backdrop-blur-2xl border-b border-dark-200/50 sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 sm:px-8 h-18">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2.5 rounded-xl text-dark-500 hover:bg-dark-100 transition-colors">
                <FiMenu size={22} />
              </button>
              <div>
                <h1 className="text-lg font-bold text-dark-800">
                  {menuItems.find(i => i.to === location.pathname)?.label || 'لوحة الإدارة'}
                </h1>
                <p className="text-xs text-dark-400 hidden sm:block">إدارة متجر Nasira Tiba3a</p>
              </div>
            </div>
            <Link to="/" className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-semibold bg-primary-50 px-4 py-2 rounded-xl hover:bg-primary-100 transition-all">
              <FiExternalLink size={14} />
              زيارة المتجر
            </Link>
          </div>
        </header>
        <main className="p-4 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
