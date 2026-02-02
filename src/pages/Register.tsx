import type { Translations } from '@/i18n';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface RegisterProps {
  t: Translations;
  onRegister: (username: string, email: string | null, password: string) => Promise<{ success: boolean; message?: string }>;
  onSendCode: (email: string) => Promise<{ sent: boolean; code?: string }>;
  onVerifyCode: (email: string, code: string) => Promise<{ success: boolean; message?: string }>;
  onShowToast: (type: 'success' | 'error', icon: string, message: string) => void;
}

const Register: React.FC<RegisterProps> = ({
  t,
  onRegister,
  onSendCode,
  onVerifyCode,
  onShowToast,
}) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    verificationCode: '',
  });
  const [countdown, setCountdown] = useState(0);

  const sendCode = async () => {
    if (!form.email) {
      onShowToast('error', '❌', t.emailRequired);
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      onShowToast('error', '❌', t.invalidEmail);
      return;
    }
    const result = await onSendCode(form.email);
    if (result.sent) {
      onShowToast('success', '✅', t.codeSentEmail);
    } else {
      onShowToast('success', '✅', `${t.codeSent}: ${result.code}`);
    }
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // If email is provided, verify code
    if (form.email) {
      const emailRegex = /^[^@]+@[^@]+$/;
      if (!emailRegex.test(form.email)) {
        onShowToast('error', '❌', t.invalidEmail);
        return;
      }
      if (!form.verificationCode) {
        onShowToast('error', '❌', t.codeRequired);
        return;
      }
      const verifyResult = await onVerifyCode(form.email, form.verificationCode);
      if (!verifyResult.success) {
        onShowToast('error', '❌', verifyResult.message || t.codeIncorrect);
        return;
      }
    }
    
    if (form.password !== form.confirmPassword) {
      onShowToast('error', '❌', t.passwordMismatch);
      return;
    }
    
    const result = await onRegister(form.username, form.email || null, form.password);
    if (result.success) {
      onShowToast('success', '✅', t.registerSuccess);
      navigate('/dashboard');
    } else {
      onShowToast('error', '❌', result.message || t.loginFail);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md transform transition-all hover:shadow-2xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
            {t.registerTitle}
          </h2>
          <p className="text-gray-500">创建新账户，开始使用导航服务</p>
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
            <Label className="block text-sm font-medium text-gray-700">
              {t.email} <span className="text-gray-400 text-xs">({t.optional})</span>
            </Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
              placeholder="请输入邮箱（可选）"
            />
            <p className="text-xs text-gray-500">{t.emailOptionalHint}</p>
          </div>
          {form.email && (
            <div className="space-y-2">
              <Label className="block text-sm font-medium text-gray-700">{t.verificationCode}</Label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={form.verificationCode}
                  onChange={(e) => setForm({ ...form, verificationCode: e.target.value })}
                  className="flex-1 px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                  placeholder={t.enterCode}
                  maxLength={6}
                />
                <Button
                  type="button"
                  onClick={sendCode}
                  disabled={countdown > 0}
                  className="px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-300 whitespace-nowrap"
                  variant="outline"
                >
                  {countdown > 0 ? `${countdown}s` : t.sendCode}
                </Button>
              </div>
            </div>
          )}
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
          <div className="space-y-2">
            <Label className="block text-sm font-medium text-gray-700">{t.confirmPassword}</Label>
            <Input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
              placeholder="请确认密码"
              required
            />
          </div>
          <Button 
            type="submit" 
            className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
          >
            {t.registerBtn}
          </Button>
        </form>
        <p className="text-center mt-8 text-gray-600">
          {t.hasAccount}{' '}
          <Link to="/login" className="text-purple-600 font-bold hover:text-purple-800 transition-colors">
            {t.login}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
