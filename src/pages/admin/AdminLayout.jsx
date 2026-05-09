import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import {
  FiHome, FiShoppingBag, FiBox, FiLayers, FiUsers,
  FiFileText, FiSettings, FiLogOut, FiMenu, FiX, FiExternalLink, FiChevronLeft
} from 'react-icons/fi';
import { useState } from 'react';
import toast from 'react-hot-toast';

const menuItems = [
  { to: '/admin/dashboard', icon: <FiHome size={19} />, label: 'لوحة التحكم' },
  { to: '/admin/orders',    icon: <FiShoppingBag size={19} />, label: 'الطلبات' },
  { to: '/admin/products',  icon: <FiBox size={19} />, label: 'المنتجات' },
  { to: '/admin/inventory', icon: <FiLayers size={19} />, label: 'المخزون' },
  { to: '/admin/customers', icon: <FiUsers size={19} />, label: 'الزبائن' },
  { to: '/admin/invoices',  icon: <FiFileText size={19} />, label: 'الفواتير' },
  { to: '/admin/settings',  icon: <FiSettings size={19} />, label: 'الإعدادات' },
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

  const currentLabel = menuItems.find(i => i.to === location.pathname)?.label || 'لوحة الإدارة';

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fc', display: 'flex', direction: 'rtl' }}>

      {/* ===== SIDEBAR ===== */}
      <aside style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 50,
        width: 268,
        background: 'linear-gradient(175deg, #1a2340 0%, #075985 50%, #1a2340 100%)',
        display: 'flex', flexDirection: 'column',
        transform: sidebarOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.35s cubic-bezier(0.4,0,0.2,1)',
        boxShadow: '4px 0 40px rgba(13,19,38,0.25)',
      }} className="md:translate-x-0 md:static md:transform-none">

        {/* Brand */}
        <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, background: '#f0f9ff', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(14,165,233,0.4)', flexShrink: 0, overflow: 'hidden' }}>
              <img src="/app-icon-192.png" alt="طباعة التيشرتات" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div>
              <div style={{ fontWeight: 800, color: '#fff', fontSize: 16 }}>طباعة التيشرتات</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>لوحة الإدارة</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ padding: '16px 12px', flex: 1, overflowY: 'auto' }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0 8px', marginBottom: 10 }}>القائمة الرئيسية</p>
          {menuItems.map(item => {
            const active = location.pathname === item.to;
            return (
              <Link key={item.to} to={item.to} onClick={() => setSidebarOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 14px', borderRadius: 14,
                  fontSize: 14, fontWeight: 600,
                  textDecoration: 'none', marginBottom: 4,
                  color: active ? '#fff' : 'rgba(255,255,255,0.5)',
                  background: active ? 'linear-gradient(135deg, rgba(14,165,233,0.9), rgba(56,189,248,0.8))' : 'transparent',
                  boxShadow: active ? '0 4px 18px rgba(14,165,233,0.45)' : 'none',
                  transition: 'all 0.22s ease',
                }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'rgba(255,255,255,0.85)'; } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; } }}
              >
                <span style={{ opacity: active ? 1 : 0.7 }}>{item.icon}</span>
                {item.label}
                {active && <FiChevronLeft size={14} style={{ marginRight: 'auto', opacity: 0.7 }} />}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button onClick={handleLogout} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 14px', borderRadius: 14,
            fontSize: 14, fontWeight: 600,
            color: 'rgba(255,100,100,0.7)', background: 'transparent',
            border: 'none', cursor: 'pointer', width: '100%',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(231,76,60,0.12)'; e.currentTarget.style.color = '#e74c3c'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,100,100,0.7)'; }}
          >
            <FiLogOut size={19} />
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(13,19,38,0.55)', backdropFilter: 'blur(4px)', zIndex: 40 }}
          className="md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ===== MAIN CONTENT ===== */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', marginRight: 0 }} className="admin-main">

        {/* Header */}
        <header style={{
          position: 'sticky', top: 0, zIndex: 30,
          background: 'rgba(248,249,252,0.92)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(197,204,224,0.5)',
          padding: '0 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          height: 64,
          boxShadow: '0 2px 12px rgba(13,19,38,0.05)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button className="md:hidden" onClick={() => setSidebarOpen(true)} style={{
              padding: 10, borderRadius: 12, border: 'none', cursor: 'pointer',
              background: '#e0f2fe', color: '#0284c7',
            }}>
              <FiMenu size={20} />
            </button>
            <div>
              <h1 style={{ fontSize: 17, fontWeight: 800, color: '#0d1326' }}>{currentLabel}</h1>
              <p style={{ fontSize: 12, color: '#8896b0', fontWeight: 500 }}>إدارة متجر Shop Disin</p>
            </div>
          </div>
          <Link to="/" style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            fontSize: 13, color: '#0284c7', textDecoration: 'none', fontWeight: 700,
            background: '#e0f2fe', padding: '8px 16px', borderRadius: 12,
            border: '1px solid rgba(14,165,233,0.15)',
            transition: 'all 0.2s ease',
          }}>
            <FiExternalLink size={14} /> زيارة المتجر
          </Link>
        </header>

        <main style={{ padding: '28px 24px', flex: 1 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
