import { Link, useLocation } from 'react-router-dom';
import {
  FiEdit3,
  FiHome,
  FiMapPin,
  FiShoppingBag,
  FiShoppingCart,
} from 'react-icons/fi';
import { useCart } from '../contexts/CartContext';

export default function Navbar() {
  const { getItemCount } = useCart();
  const location = useLocation();
  const itemCount = getItemCount();

  const links = [
    { to: '/track-order', label: 'تتبع الطلب', icon: <FiMapPin size={23} /> },
    { to: '/design', label: 'صمم تيشرتك', icon: <FiEdit3 size={23} /> },
    { to: '/products', label: 'المنتجات', icon: <FiShoppingBag size={23} /> },
    { to: '/', label: 'الرئيسية', icon: <FiHome size={24} /> },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bottom-app-nav" aria-label="التنقل الرئيسي">
      <div className="bottom-app-nav__inner">
        <Link to="/" className="bottom-app-nav__logo" aria-label="طباعة التيشرتات">
          <img src="/app-icon-192.png" alt="طباعة التيشرتات" />
        </Link>

        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`bottom-app-nav__item ${isActive(link.to) ? 'is-active' : ''}`}
            aria-label={link.label}
            title={link.label}
          >
            {link.icon}
          </Link>
        ))}

        <Link
          to="/cart"
          className={`bottom-app-nav__item bottom-app-nav__cart ${isActive('/cart') ? 'is-active' : ''}`}
          aria-label="السلة"
          title="السلة"
        >
          <FiShoppingCart size={24} />
          {itemCount > 0 && <span className="bottom-app-nav__badge">{itemCount}</span>}
        </Link>
      </div>
    </nav>
  );
}
