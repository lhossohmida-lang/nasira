import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '../../firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { FiLock, FiMail, FiUser, FiUserPlus, FiLogIn } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const navigate = useNavigate();
  const { refreshAdminStatus } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) { toast.error('أدخل البريد وكلمة المرور'); return; }
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const adminDoc = await getDoc(doc(db, 'admins', cred.user.uid));
      if (!adminDoc.exists()) {
        await setDoc(doc(db, 'admins', cred.user.uid), {
          name: cred.user.displayName || email.split('@')[0],
          email, role: 'admin', createdAt: serverTimestamp(),
        });
      }
      await refreshAdminStatus();
      toast.success('مرحبا بك!');
      navigate('/admin/dashboard');
    } catch (error) {
      console.error(error);
      if (['auth/user-not-found','auth/wrong-password','auth/invalid-credential'].includes(error.code)) {
        toast.error('البريد أو كلمة المرور غير صحيحة');
      } else {
        toast.error('حدث خطأ في تسجيل الدخول');
      }
    } finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) { toast.error('أدخل جميع البيانات'); return; }
    if (password.length < 6) { toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل'); return; }
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
      await setDoc(doc(db, 'admins', cred.user.uid), { name, email, role: 'admin', createdAt: serverTimestamp() });
      await refreshAdminStatus();
      toast.success('تم إنشاء الحساب بنجاح!');
      navigate('/admin/dashboard');
    } catch (error) {
      console.error(error);
      if (error.code === 'auth/email-already-in-use') toast.error('البريد الإلكتروني مستخدم بالفعل');
      else if (error.code === 'auth/weak-password') toast.error('كلمة المرور ضعيفة جداً');
      else toast.error('حدث خطأ في إنشاء الحساب');
    } finally { setLoading(false); }
  };

  const inputStyle = {
    width: '100%', padding: '13px 46px 13px 16px',
    background: 'rgba(255,255,255,0.06)',
    border: '1.5px solid rgba(255,255,255,0.12)',
    borderRadius: 14, color: '#fff', fontSize: 14,
    fontFamily: 'inherit', outline: 'none',
    transition: 'all 0.2s ease',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', padding: '20px', direction: 'rtl' }}>

      {/* Animated background */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(145deg, #0d1326 0%, #075985 50%, #1a2340 100%)' }} className="animate-gradient-shift" />

      {/* Blobs */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div className="animate-blob" style={{ position: 'absolute', top: '15%', right: '10%', width: 320, height: 320, background: 'rgba(14,165,233,0.18)', borderRadius: '60%', filter: 'blur(60px)' }} />
        <div className="animate-blob" style={{ position: 'absolute', bottom: '15%', left: '10%', width: 280, height: 280, background: 'rgba(232,67,147,0.12)', borderRadius: '50%', filter: 'blur(50px)', animationDelay: '2.5s' }} />
      </div>

      <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 10 }} className="animate-scale-in">

        {/* Logo + Title */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ position: 'relative', display: 'inline-flex', marginBottom: 20 }}>
            <div className="animate-pulse-glow" style={{
              width: 80, height: 80,
              background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
              borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 32, fontWeight: 900,
              boxShadow: '0 8px 32px rgba(14,165,233,0.45)',
            }}>S</div>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#fff', marginBottom: 6 }}>
            {isRegister ? 'إنشاء حساب مسؤول' : 'لوحة الإدارة'}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, fontWeight: 500 }}>Shop Disin</p>
        </div>

        {/* Card */}
        <form onSubmit={isRegister ? handleRegister : handleLogin} style={{
          background: 'rgba(255,255,255,0.06)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 24, padding: '32px 28px',
          boxShadow: '0 24px 60px rgba(0,0,0,0.3)',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            {isRegister && (
              <div className="animate-fade-in-up">
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: 8 }}>الاسم الكامل</label>
                <div style={{ position: 'relative' }}>
                  <FiUser style={{ position: 'absolute', right: 15, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} size={16} />
                  <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="اسمك الكامل" style={inputStyle}
                    onFocus={e => { e.target.style.borderColor = 'rgba(14,165,233,0.7)'; e.target.style.background = 'rgba(14,165,233,0.1)'; }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; e.target.style.background = 'rgba(255,255,255,0.06)'; }} />
                </div>
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: 8 }}>البريد الإلكتروني</label>
              <div style={{ position: 'relative' }}>
                <FiMail style={{ position: 'absolute', right: 15, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} size={16} />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@example.com" dir="ltr" style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = 'rgba(14,165,233,0.7)'; e.target.style.background = 'rgba(14,165,233,0.1)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; e.target.style.background = 'rgba(255,255,255,0.06)'; }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: 8 }}>كلمة المرور</label>
              <div style={{ position: 'relative' }}>
                <FiLock style={{ position: 'absolute', right: 15, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} size={16} />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = 'rgba(14,165,233,0.7)'; e.target.style.background = 'rgba(14,165,233,0.1)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; e.target.style.background = 'rgba(255,255,255,0.06)'; }} />
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading} style={{
            width: '100%', marginTop: 28,
            background: loading ? 'rgba(14,165,233,0.5)' : 'linear-gradient(135deg, #0284c7, #38bdf8)',
            color: '#fff', padding: '14px', borderRadius: 16,
            fontWeight: 800, fontSize: 15, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: '0 6px 24px rgba(14,165,233,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            fontFamily: 'inherit', transition: 'all 0.2s ease',
          }}>
            {loading ? (
              <>
                <div className="animate-spin" style={{ width: 18, height: 18, border: '2.5px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} />
                {isRegister ? 'جاري إنشاء الحساب...' : 'جاري الدخول...'}
              </>
            ) : (
              <>
                {isRegister ? <FiUserPlus size={18} /> : <FiLogIn size={18} />}
                {isRegister ? 'إنشاء حساب' : 'دخول'}
              </>
            )}
          </button>

          <div style={{ marginTop: 20, textAlign: 'center' }}>
            <button type="button" onClick={() => { setIsRegister(!isRegister); setEmail(''); setPassword(''); setName(''); }} style={{
              fontSize: 13, color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none',
              cursor: 'pointer', fontFamily: 'inherit', transition: 'color 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
            >
              {isRegister ? 'لديك حساب بالفعل؟ تسجيل الدخول' : 'إنشاء حساب مسؤول جديد'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
