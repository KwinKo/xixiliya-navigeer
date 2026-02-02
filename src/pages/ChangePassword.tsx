import type { Translations } from '@/i18n';
import type { User } from '@/types';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ChangePasswordProps {
  t: Translations;
  user: User;
  onUpdateUser: (user: User) => void;
  onShowToast: (type: 'success' | 'error', icon: string, message: string) => void;
}

const ChangePassword: React.FC<ChangePasswordProps> = ({
  t,
  // user,
  // onUpdateUser,
  onShowToast,
}) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (form.newPassword !== form.confirmPassword) {
      onShowToast('error', '❌', t.passwordMismatch);
      return;
    }
    
    // Call API to change password
    try {
      const response = await fetch('http://localhost:3001/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('navigeer_token')}`,
        },
        body: JSON.stringify({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        onShowToast('success', '✅', t.passwordChanged);
        navigate('/settings');
      } else {
        onShowToast('error', '❌', data.message || t.passwordChangeFail);
      }
    } catch (error) {
      console.error('Error changing password:', error);
      onShowToast('error', '❌', t.networkError);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12">
      <div className="glass-card p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500">
          {t.changePassword}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label className="block text-sm font-medium mb-2">{t.currentPassword}</Label>
            <Input
              type="password"
              value={form.currentPassword}
              onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
              className="form-input"
              required
            />
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
            {t.changePassword}
          </Button>
        </form>
        <p className="text-center mt-6 text-gray-600">
          <Link to="/settings" className="text-purple-500 font-medium">
            {t.backToSettings}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ChangePassword;
