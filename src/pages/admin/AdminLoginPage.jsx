import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '../../firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { FiLock, FiMail, FiUser, FiUserPlus, FiLogIn } from 'react-icons/fi';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const navigate = useNavigate();

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-900 via-primary-900 to-dark-900 px-4" dir="rtl">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold shadow-lg">N</div>
          <h1 className="text-2xl font-bold text-white">
            {isRegister ? 'إنشاء حساب مسؤول' : 'لوحة الإدارة'}
          </h1>
          <p className="text-dark-400 mt-1">Nasira Tiba3a</p>
        </div>

        <form onSubmit={isRegister ? handleRegister : handleLogin} className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/10">
          <div className="space-y-4">
            {/* Name field - only for register */}
            {isRegister && (
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">الاسم الكامل</label>
                <div className="relative">
                  <FiUser className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                  <input type="text" value={name} onChange={e => setName(e.target.value)}
                    className="w-full pr-10 pl-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 placeholder-white/30"
                    placeholder="اسمك الكامل" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">البريد الإلكتروني</label>
              <div className="relative">
                <FiMail className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} dir="ltr"
                  className="w-full pr-10 pl-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 placeholder-white/30"
                  placeholder="admin@example.com" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">كلمة المرور</label>
              <div className="relative">
                <FiLock className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full pr-10 pl-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 placeholder-white/30"
                  placeholder="••••••••" />
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full mt-6 bg-gradient-to-r from-primary-500 to-accent-500 text-white py-3.5 rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-50 shadow-lg flex items-center justify-center gap-2">
            {loading ? (
              isRegister ? 'جاري إنشاء الحساب...' : 'جاري الدخول...'
            ) : (
              <>
                {isRegister ? <FiUserPlus size={18} /> : <FiLogIn size={18} />}
                {isRegister ? 'إنشاء حساب' : 'دخول'}
              </>
            )}
          </button>

          {/* Toggle between login and register */}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => { setIsRegister(!isRegister); resetForm(); }}
              className="text-sm text-white/60 hover:text-white transition-colors underline underline-offset-4"
            >
              {isRegister ? 'لديك حساب بالفعل؟ تسجيل الدخول' : 'إنشاء حساب مسؤول جديد'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
