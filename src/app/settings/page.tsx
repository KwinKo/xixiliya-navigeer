'use client';

import type { Translations } from '@/i18n';
import type { User } from '@/types';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download, Upload, Key, Trash } from 'lucide-react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { TRANSLATIONS } from '@/i18n';
import { useLanguage } from '@/contexts/LanguageContext';
import { getUser, updateUserSettings, exportData, importData } from './actions';

interface SettingsProps {
  t: Translations;
  user: User;
  settings: {
    bgMode: string;
    bgColor: string;
    bgImage: string;
    enableParticles: boolean;
    particleStyle: string;
    particleColor: string;
    cardColor: string;
    cardOpacity: number;
    cardTextColor: string;
  };
  onUpdateSettings: (settings: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  onExportData: () => Promise<{ success: boolean; data?: any; error?: string }>;
  onImportData: (data: any) => Promise<{ success: boolean; importedBookmarks?: number; importedCategories?: number; error?: string }>;
  onShowToast: (type: 'success' | 'error', icon: string, message: string) => void;
}

const SettingsComponent: React.FC<SettingsProps> = ({
  t,
  user,
  settings,
  onUpdateSettings,
  onExportData,
  onImportData,
  onShowToast,
}) => {
  const router = useRouter();
  const [form, setForm] = useState({
    siteName: user.siteName || '',
    siteDesc: user.siteDesc || '',
    bgMode: settings.bgMode,
    bgColor: settings.bgColor,
    bgImage: settings.bgImage,
    enableParticles: settings.enableParticles,
    particleStyle: settings.particleStyle,
    particleColor: settings.particleColor,
    cardColor: settings.cardColor,
    cardOpacity: settings.cardOpacity,
    cardTextColor: settings.cardTextColor,
    enableMinimalMode: user.enableMinimalMode || false,
  });
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    
    // 尝试从sessionStorage获取缓存的设置
    const cachedSettings = sessionStorage.getItem('userSettings');
    if (cachedSettings) {
      try {
        const parsedSettings = JSON.parse(cachedSettings);
        setForm({
          siteName: parsedSettings.siteName || user.siteName || '',
          siteDesc: parsedSettings.siteDesc || user.siteDesc || '',
          bgMode: parsedSettings.bgMode || settings.bgMode,
          bgColor: parsedSettings.bgColor || settings.bgColor,
          bgImage: parsedSettings.bgImage || settings.bgImage,
          enableParticles: parsedSettings.enableParticles !== undefined ? parsedSettings.enableParticles : settings.enableParticles,
          particleStyle: parsedSettings.particleStyle || settings.particleStyle,
          particleColor: parsedSettings.particleColor || settings.particleColor,
          cardColor: parsedSettings.cardColor || settings.cardColor,
          cardOpacity: parsedSettings.cardOpacity !== undefined ? parsedSettings.cardOpacity : settings.cardOpacity,
          cardTextColor: parsedSettings.cardTextColor || settings.cardTextColor,
          enableMinimalMode: parsedSettings.enableMinimalMode !== undefined ? parsedSettings.enableMinimalMode : (user.enableMinimalMode || false),
        });
        return;
      } catch (error) {
        console.error('Error parsing cached settings:', error);
      }
    }

    // 缓存不存在或解析失败，使用从服务器获取的数据
    setForm({
      siteName: user.siteName || '',
      siteDesc: user.siteDesc || '',
      bgMode: settings.bgMode,
      bgColor: settings.bgColor,
      bgImage: settings.bgImage,
      enableParticles: settings.enableParticles,
      particleStyle: settings.particleStyle,
      particleColor: settings.particleColor,
      cardColor: settings.cardColor,
      cardOpacity: settings.cardOpacity,
      cardTextColor: settings.cardTextColor,
      enableMinimalMode: user.enableMinimalMode || false,
    });
  }, [user, settings, isMounted]);

  const saveSettings = async () => {
    const result = await onUpdateSettings({
      siteName: form.siteName,
      siteDesc: form.siteDesc,
      bgMode: form.bgMode as 'gradient' | 'color' | 'image',
      bgColor: form.bgColor,
      bgImage: form.bgImage || '',
      enableParticles: form.enableParticles,
      particleStyle: form.particleStyle as 'stars' | 'falling' | 'pulse' | 'float' | 'mixed',
      particleColor: form.particleColor,
      cardColor: form.cardColor,
      cardOpacity: parseInt(form.cardOpacity.toString()),
      cardTextColor: form.cardTextColor,
      enableMinimalMode: form.enableMinimalMode,
    });

    if (result.success) {
      // 更新sessionStorage中的缓存
      sessionStorage.setItem('userSettings', JSON.stringify({
        siteName: form.siteName,
        siteDesc: form.siteDesc,
        bgMode: form.bgMode,
        bgColor: form.bgColor,
        bgImage: form.bgImage || '',
        enableParticles: form.enableParticles,
        particleStyle: form.particleStyle,
        particleColor: form.particleColor,
        cardColor: form.cardColor,
        cardOpacity: parseInt(form.cardOpacity.toString()),
        cardTextColor: form.cardTextColor,
        enableMinimalMode: form.enableMinimalMode,
      }));
      setDialogMessage(t.updateSettingsSuccess);
      setShowSuccessDialog(true);
    } else {
      setDialogMessage(t.updateSettingsFail);
      setShowErrorDialog(true);
    }
  };

  const handleExportData = async () => {
    const result = await onExportData();
    if (result.success && result.data) {
      const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'navigeer-backup.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDialogMessage(t.exportSuccess);
      setShowSuccessDialog(true);
    } else {
      setDialogMessage(result.error || t.exportFail);
      setShowErrorDialog(true);
    }
  };

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      const result = await onImportData(data);
      if (result.success) {
        setDialogMessage(`${t.importSuccess} (${result.importedBookmarks} bookmarks, ${result.importedCategories} categories)`);
        setShowSuccessDialog(true);
        router.refresh();
      } else {
        setDialogMessage(result.error || t.importFail);
        setShowErrorDialog(true);
      }
    } catch (error) {
      console.error('Import error:', error);
      setDialogMessage(t.importFail);
      setShowErrorDialog(true);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-8">{t.settings}</h1>
      <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-8 space-y-8 border border-gray-200/30">
        {/* Site Info */}
        <div>
          <h3 className="text-xl font-semibold mb-6 text-gray-800">{t.siteInfo}</h3>
          <div className="space-y-6">
            <div className="space-y-2">
              <Input
                value={form.siteName}
                onChange={(e) => setForm({ ...form, siteName: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                placeholder={t.siteName}
              />
              <Label className="block text-sm font-medium text-gray-700">{t.siteNameLabel}</Label>
            </div>
            <div className="space-y-2">
              <Label className="block text-sm font-medium text-gray-700">{t.siteDesc}</Label>
              <textarea
                value={form.siteDesc}
                onChange={(e) => setForm({ ...form, siteDesc: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 resize-none"
                rows={2}
                placeholder="请输入站点描述"
              />
            </div>
          </div>
        </div>

        {/* Account Info */}
        <div className="border-t border-gray-200 pt-8">
          <h3 className="text-xl font-semibold mb-6 text-gray-800">{t.accountInfo}</h3>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="block text-sm font-medium text-gray-700">{t.username}</Label>
              <Input 
                value={user.username} 
                className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 cursor-not-allowed" 
                disabled 
              />
            </div>
            <div className="space-y-2">
              <Label className="block text-sm font-medium text-gray-700">{t.email}</Label>
              {user.email ? (
                <div className="flex items-center justify-between bg-green-50 px-4 py-3 rounded-lg border border-green-100">
                  <span className="text-gray-700">{user.email}</span>
                  <span className="text-sm text-green-600 font-medium">{t.emailVerified}</span>
                </div>
              ) : (
                <div className="bg-yellow-50 px-4 py-3 rounded-lg border border-yellow-100">
                  <span className="text-gray-700">{t.optional}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="border-t border-gray-200 pt-8">
          <h3 className="text-xl font-semibold mb-6 text-gray-800">{t.appearance}</h3>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="block text-sm font-medium text-gray-700">{t.bgMode}</Label>
              <Select
                value={form.bgMode}
                onValueChange={(v) => setForm({ ...form, bgMode: v })}
              >
                <SelectTrigger className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gradient">{t.gradientBg}</SelectItem>
                  <SelectItem value="color">{t.solidColor}</SelectItem>
                  <SelectItem value="image">{t.bgImage}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {form.bgMode === 'color' && (
              <div className="space-y-2">
                <Label className="block text-sm font-medium text-gray-700">{t.bgColor}</Label>
                <div className="flex items-center gap-4">
                  <input
                    type="color"
                    value={form.bgColor}
                    onChange={(e) => setForm({ ...form, bgColor: e.target.value })}
                    className="w-20 h-12 rounded-lg cursor-pointer border border-gray-200"
                  />
                  <span className="text-sm text-gray-600 font-medium">{form.bgColor}</span>
                </div>
              </div>
            )}
            {form.bgMode === 'image' && (
              <div className="space-y-2">
                <Label className="block text-sm font-medium text-gray-700">{t.bgImageUrl}</Label>
                <Input
                  type="url"
                  value={form.bgImage}
                  onChange={(e) => setForm({ ...form, bgImage: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            )}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="part"
                checked={form.enableParticles}
                onChange={(e) => setForm({ ...form, enableParticles: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <Label htmlFor="part" className="text-gray-700 font-medium cursor-pointer">{t.enableParticles}</Label>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="minimal"
                checked={form.enableMinimalMode}
                onChange={(e) => setForm({ ...form, enableMinimalMode: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <Label htmlFor="minimal" className="text-gray-700 font-medium cursor-pointer">{t.enableMinimalMode}</Label>
            </div>
            {form.enableParticles && (
              <>
                <div className="space-y-2">
                  <Label className="block text-sm font-medium text-gray-700">{t.particleStyle}</Label>
                  <Select
                    value={form.particleStyle}
                    onValueChange={(v) => setForm({ ...form, particleStyle: v })}
                  >
                    <SelectTrigger className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stars">{t.particleStars}</SelectItem>
                      <SelectItem value="falling">{t.particleFalling}</SelectItem>
                      <SelectItem value="pulse">{t.particlePulse}</SelectItem>
                      <SelectItem value="float">{t.particleFloat}</SelectItem>
                      <SelectItem value="mixed">{t.particleMixed}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="block text-sm font-medium text-gray-700">{t.particleColor}</Label>
                  <div className="flex items-center gap-4">
                    <input
                      type="color"
                      value={form.particleColor}
                      onChange={(e) => setForm({ ...form, particleColor: e.target.value })}
                      className="w-20 h-12 rounded-lg cursor-pointer border border-gray-200"
                    />
                    <span className="text-sm text-gray-600 font-medium">{form.particleColor}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Bookmark Card Style */}
        <div className="border-t border-gray-200 pt-8">
          <h3 className="text-xl font-semibold mb-6 text-gray-800">{t.bookmarkCardStyle}</h3>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="block text-sm font-medium text-gray-700">{t.cardColor}</Label>
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  value={form.cardColor}
                  onChange={(e) => setForm({ ...form, cardColor: e.target.value })}
                  className="w-20 h-12 rounded-lg cursor-pointer border border-gray-200"
                />
                <span className="text-sm text-gray-600 font-medium">{form.cardColor}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="block text-sm font-medium text-gray-700">字体颜色</Label>
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  value={form.cardTextColor}
                  onChange={(e) => setForm({ ...form, cardTextColor: e.target.value })}
                  className="w-20 h-12 rounded-lg cursor-pointer border border-gray-200"
                />
                <span className="text-sm text-gray-600 font-medium">{form.cardTextColor}</span>
              </div>
            </div>
            <div className="space-y-3">
              <Label className="block text-sm font-medium text-gray-700">{t.cardOpacity}</Label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  value={form.cardOpacity}
                  onChange={(e) => setForm({ ...form, cardOpacity: parseInt(e.target.value) })}
                  min={10}
                  max={100}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-sm text-gray-600 font-medium w-16">{form.cardOpacity}%</span>
              </div>
            </div>
          </div>
        </div>

        <Button 
          onClick={saveSettings} 
          className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
        >
          {t.save}
        </Button>

        {/* Data Management */}
        <div className="border-t border-gray-200 pt-8">
          <h3 className="text-xl font-semibold mb-6 text-gray-800">{t.dataManagement}</h3>
          <div className="space-y-4">
            <Button 
              onClick={handleExportData}
              className="w-full py-3 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg shadow-sm transition-all duration-300"
            >
              <Download className="mr-2 h-4 w-4" /> {t.exportData}
            </Button>
            <label className="w-full">
              <Button 
                className="w-full py-3 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg shadow-sm transition-all duration-300"
                asChild
              >
                <span>
                  <Upload className="mr-2 h-4 w-4" /> {t.importData}
                </span>
              </Button>
              <input 
                type="file" 
                accept=".json" 
                className="hidden" 
                onChange={handleImportData} 
              />
            </label>
          </div>
        </div>

        {/* Account Management */}
        <div className="border-t border-gray-200 pt-8">
          <h3 className="text-xl font-semibold mb-6 text-gray-800">{t.accountManagement}</h3>
          <div className="space-y-4">
            <Link href="/changepassword">
              <Button 
                className="w-full py-3 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg shadow-sm transition-all duration-300"
              >
                <Key className="mr-2 h-4 w-4" /> {t.changePassword}
              </Button>
            </Link>
            <Link href="/deleteaccount">
              <Button 
                className="w-full py-3 bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 rounded-lg shadow-sm transition-all duration-300"
              >
                <Trash className="mr-2 h-4 w-4" /> {t.deleteAccount}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 成功弹出框 */}
      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.success}</AlertDialogTitle>
            <AlertDialogDescription>
              {dialogMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogAction>{t.ok}</AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>

      {/* 错误弹出框 */}
      <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.error}</AlertDialogTitle>
            <AlertDialogDescription>
              {dialogMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogAction>{t.ok}</AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

const defaultUser: User = {
  id: 0,
  username: '',
  email: '',
  password: '',
  role: 'user',
  bookmarkLimit: 99,
  disabled: false,
  siteName: '',
  siteDesc: '',
  bgMode: 'gradient',
  bgColor: '#ffffff',
  bgImage: '',
  enableParticles: false,
  particleStyle: 'stars',
  particleColor: '#ffffff',
  cardColor: '#ffffff',
  cardOpacity: 90,
  cardTextColor: '#000000',
  enableMinimalMode: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const showToast = (type: 'success' | 'error', icon: string, message: string) => {
  if (type === 'success') {
    toast.success(message);
  } else {
    toast.error(message);
  }
};

export default function SettingsPage() {
  const { lang } = useLanguage();
  // 直接使用lang来设置t，不再使用useState
  const t = TRANSLATIONS[lang === 'zh' ? 'zh' : 'en'];
  const [user, setUser] = useState<User>(defaultUser);

  useEffect(() => {
    const loadUser = async () => {
      const userData = await getUser();
      if (userData) {
        setUser(userData);
      }
    };
    loadUser();
  }, []);

  const handleUpdateSettings = async (settings: Partial<User>) => {
    return await updateUserSettings(settings);
  };

  const handleExportData = async () => {
    return await exportData();
  };

  const handleImportData = async (data: any) => {
    return await importData(data);
  };

  return (
    <SettingsComponent
      t={t}
      user={user}
      settings={{
        bgMode: user.bgMode,
        bgColor: user.bgColor,
        bgImage: user.bgImage,
        enableParticles: user.enableParticles,
        particleStyle: user.particleStyle,
        particleColor: user.particleColor,
        cardColor: user.cardColor,
        cardOpacity: user.cardOpacity,
        cardTextColor: user.cardTextColor
      }}
      onUpdateSettings={handleUpdateSettings}
      onExportData={handleExportData}
      onImportData={handleImportData}
      onShowToast={showToast}
    />
  );
}
