'use client';

import type { Translations } from '@/i18n';
import type { User } from '@/types';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { DeleteConfirmDialog } from '@/components/ui/alert-dialog-example';
import { Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { TRANSLATIONS } from '@/i18n';

interface AdminProps {
  t: Translations;
  users: User[];
  onUpdateUser: (user: User) => void;
  onDeleteUser: (userId: number) => void;
  onShowToast: (type: 'success' | 'error', icon: string, message: string) => void;
  isLoading?: boolean;
}

const AdminComponent = ({
  t,
  users,
  onUpdateUser,
  onDeleteUser,
  onShowToast,
  isLoading = false,
}: AdminProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [SearchIcon, setSearchIcon] = useState<any>(null);

  useEffect(() => {
    import('lucide-react').then((module) => {
      setSearchIcon(() => module.Search);
    });
  }, []);

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    setIsUpdating(true);
    try {
      await onUpdateUser(editingUser);
      setIsDialogOpen(false);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (userToDelete) {
      await onDeleteUser(userToDelete.id);
      setShowDeleteDialog(false);
      setUserToDelete(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <Card className="bg-white/90 backdrop-blur-md border-0 shadow-lg mb-8 sticky top-6 z-10">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle className="text-xl text-gray-800">{t.admin}</CardTitle>
            <div className="relative">
              <Input
                type="text"
                placeholder={t.searchUserPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full md:w-80"
              />
              {SearchIcon && <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <span className="ml-3 text-gray-500">加载中...</span>
            </div>
          ) : filteredUsers.length === 0 ? (
            <p className="text-gray-500 text-center py-8">{t.noUsersFound}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">{t.username}</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">{t.email}</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">{t.role}</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">{t.status}</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">创建时间</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">{t.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => (
                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">{user.username}</td>
                      <td className="py-3 px-4">{user.email || '-'}</td>
                      <td className="py-3 px-4">
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                          {user.role}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={!user.disabled ? 'default' : 'destructive'}>
                          {!user.disabled ? t.active : t.disabled}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">{new Date().toLocaleDateString()}</td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleEditClick(user)}
                                className="border-gray-300"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>{t.edit} {t.user}</DialogTitle>
                                <DialogDescription>
                                  {t.edit} {t.user} {t.info}
                                </DialogDescription>
                              </DialogHeader>
                              {editingUser && (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-username">{t.username}</Label>
                                      <Input
                                        id="edit-username"
                                        value={editingUser.username}
                                        onChange={(e) => setEditingUser({...editingUser, username: e.target.value})}
                                        className="w-full"
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-email">{t.email}</Label>
                                      <Input
                                        id="edit-email"
                                        value={editingUser.email || ''}
                                        onChange={(e) => setEditingUser({...editingUser, email: e.target.value || null})}
                                        className="w-full"
                                      />
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-role">{t.role}</Label>
                                      <select
                                        id="edit-role"
                                        value={editingUser.role}
                                        onChange={(e) => setEditingUser({...editingUser, role: e.target.value as 'user' | 'admin'})}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                      >
                                        <option value="user">{t.user}</option>
                                        <option value="admin">{t.admin}</option>
                                      </select>
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-status">{t.status}</Label>
                                      <select
                                        id="edit-status"
                                        value={editingUser.disabled ? 'disabled' : 'active'}
                                        onChange={(e) => setEditingUser({...editingUser, disabled: e.target.value === 'disabled'})}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                      >
                                        <option value="active">{t.active}</option>
                                        <option value="disabled">{t.disabled}</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-bookmark-limit">{t.bookmarkLimit}</Label>
                                    <Input
                                      id="edit-bookmark-limit"
                                      type="number"
                                      value={editingUser.bookmarkLimit}
                                      onChange={(e) => setEditingUser({...editingUser, bookmarkLimit: parseInt(e.target.value) || 100})}
                                      className="w-full"
                                    />
                                  </div>
                                  <div className="flex gap-3 pt-2">
                                    <DialogClose asChild>
                                      <Button variant="outline" className="flex-1" disabled={isUpdating}>
                                        {t.cancel || '取消'}
                                      </Button>
                                    </DialogClose>
                                    <Button 
                                      onClick={handleUpdateUser}
                                      disabled={isUpdating}
                                      className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                                    >
                                      {isUpdating ? '保存中...' : t.save}
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          <Button 
                            variant="outline" 
                            size="sm"
                            disabled={user.role === 'admin'}
                            className="border-gray-300 text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteClick(user)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <DeleteConfirmDialog
                            isOpen={showDeleteDialog}
                            onOpenChange={setShowDeleteDialog}
                            itemName={userToDelete?.username || ''}
                            onConfirm={handleDeleteConfirm}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card className="bg-white/90 backdrop-blur-md border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl text-gray-800">系统统计</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-gray-700 mb-2">总用户数</h3>
              <p className="text-3xl font-bold text-indigo-600">{users.length}</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-gray-700 mb-2">活跃用户</h3>
              <p className="text-3xl font-bold text-green-600">{users.filter(u => !u.disabled).length}</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-gray-700 mb-2">管理员用户</h3>
              <p className="text-3xl font-bold text-purple-600">{users.filter(u => u.role === 'admin').length}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// 默认用户数据，防止构建时出错
const defaultUsers: User[] = [];

// 模拟API调用
const fetchUsers = async (): Promise<User[]> => {
  try {
    console.log('=== 开始获取用户数据 ===');
    const token = localStorage.getItem('navigeer_access_token');
    console.log('Token:', token ? token.substring(0, 20) + '...' : 'No token');
    
    if (!token) {
      console.log('No token found, returning default users');
      return defaultUsers;
    }
    
    console.log('Fetching users from /api/admin/users');
    const response = await fetch('/api/admin/users', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Response data:', data);
      return data.users || defaultUsers;
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.log('Error response:', errorData);
      return defaultUsers;
    }
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return defaultUsers;
  }
};

const updateUser = async (user: User): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('=== 开始更新用户 ===');
    console.log('User data:', user);
    
    const token = localStorage.getItem('navigeer_access_token');
    if (!token) {
      console.log('No token found');
      return { success: false, message: '未找到登录凭证，请重新登录' };
    }
    
    console.log('Sending PUT request to /api/admin/users');
    const response = await fetch('/api/admin/users', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(user),
    });
    
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Response data:', data);
      return { success: true, message: '用户更新成功' };
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.log('Error response:', errorData);
      const errorMessage = errorData.error || '更新失败，请稍后重试';
      return { success: false, message: errorMessage };
    }
  } catch (error) {
    console.error('Failed to update user:', error);
    return { success: false, message: '网络错误，请检查连接后重试' };
  }
};

const deleteUser = async (userId: number): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('=== 开始删除用户 ===');
    console.log('User ID:', userId);
    
    const token = localStorage.getItem('navigeer_access_token');
    if (!token) {
      console.log('No token found');
      return { success: false, message: '未找到登录凭证，请重新登录' };
    }
    
    console.log('Sending DELETE request to /api/admin/users');
    const response = await fetch('/api/admin/users', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ id: userId }),
    });
    
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Response data:', data);
      return { success: true, message: '用户删除成功' };
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.log('Error response:', errorData);
      const errorMessage = errorData.error || '删除失败，请稍后重试';
      return { success: false, message: errorMessage };
    }
  } catch (error) {
    console.error('Failed to delete user:', error);
    return { success: false, message: '网络错误，请检查连接后重试' };
  }
};

const showToast = (type: 'success' | 'error', icon: string, message: string) => {
  if (type === 'success') {
    toast.success(message);
  } else {
    toast.error(message);
  }
};

export default function AdminPage() {
  const searchParams = useSearchParams();
  const lang = searchParams.get('lang') || 'zh';
  const [t, setT] = useState(TRANSLATIONS.zh);
  const [users, setUsers] = useState<User[]>(defaultUsers);
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 根据语言参数设置翻译
  useEffect(() => {
    const translations = TRANSLATIONS[lang === 'zh' ? 'zh' : 'en'];
    setT(translations);
  }, [lang]);

  // 获取用户数据
  useEffect(() => {
    if (!isMounted) return;
    
    const loadUsers = async () => {
      setIsLoading(true);
      try {
        const userData = await fetchUsers();
        setUsers(userData);
      } finally {
        setIsLoading(false);
      }
    };
    loadUsers();
  }, [isMounted]);

  const handleUpdateUser = async (user: User) => {
    const result = await updateUser(user);
    if (result.success) {
      showToast('success', 'CheckCircle', result.message);
      // 重新获取用户数据
      const userData = await fetchUsers();
      setUsers(userData);
    } else {
      showToast('error', 'AlertCircle', result.message);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    const result = await deleteUser(userId);
    if (result.success) {
      showToast('success', 'CheckCircle', result.message);
      // 重新获取用户数据
      const userData = await fetchUsers();
      setUsers(userData);
    } else {
      showToast('error', 'AlertCircle', result.message);
    }
  };

  return (
    <AdminComponent
      t={t}
      users={users}
      onUpdateUser={handleUpdateUser}
      onDeleteUser={handleDeleteUser}
      onShowToast={showToast}
      isLoading={isLoading}
    />
  );
}