import { Link } from 'react-router-dom';
import { FiFacebook, FiInstagram, FiPhone, FiMapPin, FiHeart } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer style={{ background: 'linear-gradient(145deg, #0d1326 0%, #1a2340 60%, #075985 100%)', color: '#8896b0', marginTop: 'auto', position: 'relative', overflow: 'hidden' }}>

      {/* Top glow line */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(14,165,233,0.6), transparent)' }} />
      <div style={{ position: 'absolute', top: 0, right: '20%', width: 260, height: 100, background: 'rgba(14,165,233,0.06)', borderRadius: '50%', filter: 'blur(40px)' }} />
      <div style={{ position: 'absolute', bottom: 0, left: '30%', width: 200, height: 80, background: 'rgba(232,67,147,0.05)', borderRadius: '50%', filter: 'blur(30px)' }} />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '56px 20px', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 40 }}>

          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
              <div style={{ width: 46, height: 46, background: '#f0f9ff', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(14,165,233,0.3)', overflow: 'hidden' }}>
                <img src="/app-icon-192.png" alt="طباعة التيشرتات" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <span style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>طباعة التيشرتات</span>
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.7, color: '#6272a0', maxWidth: 240 }}>
              متخصصون في طباعة التيشرتات بأعلى جودة وأحدث التقنيات. اختر تصميمك المفضل ونحن نحوّله إلى واقع.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 style={{ color: '#fff', fontWeight: 700, marginBottom: 20, fontSize: 16 }}>روابط سريعة</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[{to:'/',l:'الرئيسية'},{to:'/products',l:'المنتجات'},{to:'/design',l:'صمّم تيشرتك'},{to:'/track-order',l:'تتبع الطلب'},{to:'/cart',l:'السلة'}].map(item => (
                <Link key={item.to} to={item.to} style={{ color: '#6272a0', textDecoration: 'none', fontSize: 13, fontWeight: 500, transition: 'color 0.2s ease' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#38bdf8'}
                  onMouseLeave={e => e.currentTarget.style.color = '#6272a0'}
                >{item.l}</Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 style={{ color: '#fff', fontWeight: 700, marginBottom: 20, fontSize: 16 }}>تواصل معنا</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <a href="tel:+213000000000" style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#6272a0', textDecoration: 'none', fontSize: 13 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(14,165,233,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8' }}>
                  <FiPhone size={15} />
                </div>
                0000 000 000
              </a>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#6272a0', fontSize: 13 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(14,165,233,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8' }}>
                  <FiMapPin size={15} />
                </div>
                الجزائر
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                {[{icon: <FiFacebook size={17} />, hoverBg: '#1877f2'}, {icon: <FiInstagram size={17} />, hoverBg: 'linear-gradient(135deg,#833ab4,#e1306c)'}].map((s,i) => (
                  <a key={i} href="#" style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6272a0', textDecoration: 'none', transition: 'all 0.2s ease', border: '1px solid rgba(255,255,255,0.06)' }}
                    onMouseEnter={e => { e.currentTarget.style.background = s.hoverBg; e.currentTarget.style.color = '#fff'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#6272a0'; }}
                  >{s.icon}</a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 48, paddingTop: 28, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <p style={{ color: '#475280', fontSize: 13 }}>© {new Date().getFullYear()} Shop Disin. جميع الحقوق محفوظة.</p>
          <p style={{ color: '#075985', fontSize: 12, display: 'flex', alignItems: 'center', gap: 5 }}>
            صُنع بـ <FiHeart size={12} style={{ color: '#e84393' }} /> في الجزائر
          </p>
        </div>
      </div>
    </footer>
  );
}
