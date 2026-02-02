import type { Translations } from '@/i18n';
import type { User } from '@/types';
import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface AdminProps {
  t: Translations;
  users: User[];
  onUpdateUser: (user: User) => void;
  onDeleteUser: (userId: number) => void;
  onShowToast: (type: 'success' | 'error' | 'warning', icon: string, message: string) => void;
}

const Admin: React.FC<AdminProps> = ({ t, users, onUpdateUser, onDeleteUser, onShowToast }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) {
      return users;
    }
    const query = searchQuery.toLowerCase();
    return users.filter(
      (u) =>
        u.username.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query)
    );
  }, [users, searchQuery]);

  const editLimit = (u: User) => {
    const newLimit = prompt('输入新的书签上限:', u.bookmarkLimit.toString());
    if (newLimit && !isNaN(parseInt(newLimit))) {
      u.bookmarkLimit = parseInt(newLimit);
      onUpdateUser(u);
      onShowToast('success', '✅', t.updateSuccess);
    }
  };

  const toggleStatus = (u: User) => {
    if (u.username === 'KwinKo') {
      onShowToast('warning', '⚠️', t.cannotDisableAdmin);
      return;
    }
    u.disabled = !u.disabled;
    onUpdateUser(u);
    onShowToast('success', '✅', u.disabled ? t.disabled : t.active);
  };

  const deleteUser = (u: User) => {
    if (u.username === 'KwinKo') {
      onShowToast('warning', '⚠️', t.cannotDisableAdmin);
      return;
    }
    if (confirm(`${t.deleteConfirm} "${u.username}"`)) {
      onDeleteUser(u.id);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-8">{t.admin}</h1>

      {/* Search */}
      <div className="mb-8">
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t.searchUserPlaceholder}
          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
        />
      </div>

      <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden border border-gray-200/30">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.username}</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.email}</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.bookmarkLimit}</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{u.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{u.username}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className="cursor-pointer text-purple-600 hover:text-purple-800 font-medium"
                      onClick={() => editLimit(u)}
                    >
                      {u.bookmarkLimit}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        u.disabled ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                      }`}
                    >
                      {u.disabled ? t.disabled : t.active}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-3">
                      <Button
                        onClick={() => toggleStatus(u)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                          u.disabled ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-red-500 hover:bg-red-600 text-white'
                        }`}
                      >
                        {u.disabled ? t.enable : t.disable}
                      </Button>
                      {u.username !== 'KwinKo' && (
                        <Button
                          onClick={() => deleteUser(u)}
                          className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-600 hover:bg-gray-700 text-white transition-all duration-300"
                        >
                          {t.delete}
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredUsers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="text-6xl mb-4"><FontAwesomeIcon icon="users" size="5x" /></div>
            <p className="text-lg text-gray-500 font-medium">{t.noUsersFound}</p>
            <p className="text-sm text-gray-400 mt-2">没有找到匹配的用户</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
