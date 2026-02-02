import type { Translations } from '@/i18n';
import type { User } from '@/types';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ForgotPasswordProps {
  t: Translations;
  users: User[];
  onSendCode: (email: string) => Promise<{ sent: boolean; code?: string }>;
  onVerifyCode: (email: string, code: string) => Promise<{ success: boolean; message?: string }>;
  onUpdateUser: (user: User) => void;
  onShowToast: (type: 'success' | 'error', icon: string, message: string) => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({
  t,
  users,
  onSendCode,
  onVerifyCode,
  onUpdateUser,
  onShowToast,
}) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '',
    email: '',
    verificationCode: '',
    newPassword: '',
    confirmPassword: '',
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
    const user = users.find((u) => u.username === form.username && u.email === form.email);
    if (!user) {
      onShowToast('error', '❌', t.usernameNotFound);
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
    
    if (!form.username) {
      onShowToast('error', '❌', '请输入用户名');
      return;
    }
    
    if (!form.email) {
      onShowToast('error', '❌', t.emailRequired);
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
    
    if (form.newPassword !== form.confirmPassword) {
      onShowToast('error', '❌', t.passwordMismatch);
      return;
    }
    
    const user = users.find((u) => u.username === form.username && u.email === form.email);
    if (!user) {
      onShowToast('error', '❌', t.usernameNotFound);
      return;
    }
    
    user.password = form.newPassword;
    onUpdateUser(user);
    onShowToast('success', '✅', t.resetSuccess);
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12">
      <div className="glass-card p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500">
          {t.resetPassword}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label className="block text-sm font-medium mb-2">{t.username}</Label>
            <Input
              type="text"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="form-input"
              required
            />
          </div>
          <div>
            <Label className="block text-sm font-medium mb-2">{t.email}</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="form-input"
              required
            />
          </div>
          <div>
            <Label className="block text-sm font-medium mb-2">{t.verificationCode}</Label>
            <div className="flex gap-2">
              <Input
                type="text"
                value={form.verificationCode}
                onChange={(e) => setForm({ ...form, verificationCode: e.target.value })}
                className="form-input flex-1"
                placeholder={t.enterCode}
                maxLength={6}
                required
              />
              <Button
                type="button"
                onClick={sendCode}
                disabled={countdown > 0}
                className="btn-secondary whitespace-nowrap"
                variant="outline"
              >
                {countdown > 0 ? `${countdown}s` : t.sendCode}
              </Button>
            </div>
          </div>
          <div>
            <Label className="block text-sm font-medium mb-2">{t.newPassword}</Label>
            <Input
              type="password"
              value={form.newPassword}
              onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
              className="form-input"
              required
            />
          </div>
          <div>
            <Label className="block text-sm font-medium mb-2">{t.confirmNewPassword}</Label>
            <Input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              className="form-input"
              required
            />
          </div>
          <Button type="submit" className="btn-primary w-full">
            {t.resetPassword}
          </Button>
        </form>
        <p className="text-center mt-6 text-gray-600">
          <Link to="/login" className="text-purple-500 font-medium">
            {t.backToLogin}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
