import type { Translations } from '@/i18n';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface LoginProps {
  t: Translations;
  onLogin: (username: string, password: string) => Promise<{ success: boolean; code?: string }>;
  onShowToast: (type: 'success' | 'error', icon: string, message: string) => void;
}

const Login: React.FC<LoginProps> = ({ t, onLogin, onShowToast }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await onLogin(form.username, form.password);
    
    if (result.success) {
      onShowToast('success', '✅', t.loginSuccess);
      navigate('/dashboard');
    } else {
      let errorMsg = t.loginFail;
      if (result.code === 'USER_NOT_FOUND') {
        errorMsg = t.usernameNotFound;
      } else if (result.code === 'WRONG_PASSWORD') {
        errorMsg = t.passwordIncorrect;
      } else if (result.code === 'ACCOUNT_DISABLED') {
        errorMsg = t.userDisabled;
      }
      onShowToast('error', '❌', errorMsg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 bg-transparent">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md transform transition-all hover:shadow-2xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
            {t.loginTitle}
          </h2>
          <p className="text-gray-500">欢迎回来，请登录您的账户</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label className="block text-sm font-medium text-gray-700">{t.username}</Label>
            <Input
              type="text"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
              placeholder="请输入用户名"
              required
            />
          </div>
          <div className="space-y-2">
            <Label className="block text-sm font-medium text-gray-700">{t.password}</Label>
            <Input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
              placeholder="请输入密码"
              required
            />
          </div>
          <div className="text-right">
            <Link to="/forgot-password" className="text-sm text-purple-600 hover:text-purple-800 font-medium transition-colors">
              {t.forgotPassword}
            </Link>
          </div>
          <Button 
            type="submit" 
            className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
          >
            {t.loginBtn}
          </Button>
        </form>
        <p className="text-center mt-8 text-gray-600">
          {t.noAccount}{' '}
          <Link to="/register" className="text-purple-600 font-bold hover:text-purple-800 transition-colors">
            {t.register}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
