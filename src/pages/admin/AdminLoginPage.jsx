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
        // Auto-create admin document for existing users
        await setDoc(doc(db, 'admins', cred.user.uid), {
          name: cred.user.displayName || email.split('@')[0],
          email: email,
          role: 'admin',
          createdAt: serverTimestamp(),
        });
      }
      await refreshAdminStatus();
      toast.success('مرحبا بك!');
      navigate('/admin/dashboard');
    } catch (error) {
      console.error(error);
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
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
      // Add user to admins collection
      await setDoc(doc(db, 'admins', cred.user.uid), {
        name: name,
        email: email,
        role: 'admin',
        createdAt: serverTimestamp(),
      });
      await refreshAdminStatus();
      toast.success('تم إنشاء الحساب بنجاح!');
      navigate('/admin/dashboard');
    } catch (error) {
      console.error(error);
      if (error.code === 'auth/email-already-in-use') {
        toast.error('البريد الإلكتروني مستخدم بالفعل');
      } else if (error.code === 'auth/weak-password') {
        toast.error('كلمة المرور ضعيفة جداً');
      } else if (error.code === 'auth/invalid-email') {
        toast.error('البريد الإلكتروني غير صالح');
      } else {
        toast.error('حدث خطأ في إنشاء الحساب');
      }
    } finally { setLoading(false); }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4" dir="rtl">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-dark-900 via-primary-900 to-dark-900 animate-gradient-shift"></div>
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-[10%] w-72 h-72 bg-primary-500/15 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute bottom-20 left-[15%] w-96 h-96 bg-accent-500/10 rounded-full blur-3xl animate-blob" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl animate-blob" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="w-full max-w-md relative z-10 animate-scale-in">
        <div className="text-center mb-8">
          <div className="relative inline-flex mb-5">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-accent-500 rounded-3xl flex items-center justify-center text-white text-3xl font-extrabold shadow-2xl shadow-primary-500/30 animate-pulse-glow">N</div>
          </div>
          <h1 className="text-3xl font-extrabold text-white">
            {isRegister ? 'إنشاء حساب مسؤول' : 'لوحة الإدارة'}
          </h1>
          <p className="text-dark-400 mt-2 text-sm">Nasira Tiba3a</p>
        </div>

        <form onSubmit={isRegister ? handleRegister : handleLogin} className="glass rounded-3xl p-8 shadow-2xl">
          <div className="space-y-5">
            {isRegister && (
              <div className="animate-fade-in-up">
                <label className="block text-sm font-semibold text-white/80 mb-2">الاسم الكامل</label>
                <div className="relative">
                  <FiUser className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                  <input type="text" value={name} onChange={e => setName(e.target.value)}
                    className="w-full pr-12 pl-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 placeholder-white/20 transition-all"
                    placeholder="اسمك الكامل" />
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-white/80 mb-2">البريد الإلكتروني</label>
              <div className="relative">
                <FiMail className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} dir="ltr"
                  className="w-full pr-12 pl-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 placeholder-white/20 transition-all"
                  placeholder="admin@example.com" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-white/80 mb-2">كلمة المرور</label>
              <div className="relative">
                <FiLock className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full pr-12 pl-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 placeholder-white/20 transition-all"
                  placeholder="••••••••" />
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full mt-7 bg-gradient-to-r from-primary-500 via-accent-500 to-primary-500 animate-gradient-shift text-white py-4 rounded-2xl font-bold hover:opacity-90 transition-all disabled:opacity-50 shadow-2xl shadow-primary-500/20 flex items-center justify-center gap-2 text-[15px]">
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                {isRegister ? 'جاري إنشاء الحساب...' : 'جاري الدخول...'}
              </span>
            ) : (
              <>
                {isRegister ? <FiUserPlus size={18} /> : <FiLogIn size={18} />}
                {isRegister ? 'إنشاء حساب' : 'دخول'}
              </>
            )}
          </button>

          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={() => { setIsRegister(!isRegister); resetForm(); }}
              className="text-sm text-white/40 hover:text-white/80 transition-colors"
            >
              {isRegister ? 'لديك حساب بالفعل؟ تسجيل الدخول' : 'إنشاء حساب مسؤول جديد'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
