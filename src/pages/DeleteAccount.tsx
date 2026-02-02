import type { Translations } from '@/i18n';
import type { User } from '@/types';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface DeleteAccountProps {
  t: Translations;
  user: User;
  onUpdateUser: (user: User) => void;
  onLogout: () => void;
  onShowToast: (type: 'success' | 'error', icon: string, message: string) => void;
}

const DeleteAccount: React.FC<DeleteAccountProps> = ({
  t,
  // user,
  // onUpdateUser,
  onLogout,
  onShowToast,
}) => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Call API to delete account
    try {
      const response = await fetch('http://localhost:3001/api/auth/delete-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('navigeer_token')}`,
        },
        body: JSON.stringify({ password }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        onShowToast('success', '✅', t.accountDeleted);
        onLogout();
        navigate('/login');
      } else {
        onShowToast('error', '❌', data.message || t.passwordIncorrect);
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      onShowToast('error', '❌', t.networkError);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12">
      <div className="glass-card p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-pink-500">
          {t.deleteAccount}
        </h2>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700 text-sm">{t.deleteAccountWarning}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label className="block text-sm font-medium mb-2">{t.password}</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              required
            />
            <p className="text-xs text-gray-500 mt-1">{t.deleteAccountConfirm}</p>
          </div>
          <div className="flex gap-3">
            <Button type="submit" className="flex-1 bg-red-500 hover:bg-red-600">
              {t.confirmDelete}
            </Button>
            <Button
              type="button"
              onClick={() => navigate('/settings')}
              className="btn-secondary flex-1"
              variant="outline"
            >
              {t.cancel}
            </Button>
          </div>
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

export default DeleteAccount;
