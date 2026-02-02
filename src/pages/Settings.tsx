import type { Translations } from '@/i18n';
import type { User } from '@/types';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
  onUpdateSettings: (settings: Partial<User>) => void;
  onSendCode: (email: string) => Promise<{ sent: boolean; code?: string }>;
  onVerifyCode: (email: string, code: string) => { success: boolean; message?: string };
  onShowToast: (type: 'success' | 'error', icon: string, message: string) => void;
}

const Settings: React.FC<SettingsProps> = ({
  t,
  user,
  settings,
  onUpdateSettings,
  onSendCode,
  onVerifyCode,
  onShowToast,
}) => {
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

  const [emailForm, setEmailForm] = useState({ newEmail: '', code: '' });
  const [emailCountdown, setEmailCountdown] = useState(0);

  const sendEmailCode = async () => {
    if (!emailForm.newEmail) {
      onShowToast('error', '❌', t.emailRequired);
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailForm.newEmail)) {
      onShowToast('error', '❌', t.invalidEmail);
      return;
    }
    const result = await onSendCode(emailForm.newEmail);
    if (result.sent) {
      onShowToast('success', '✅', t.codeSentEmail);
    } else {
      onShowToast('success', '✅', `${t.codeSent}: ${result.code}`);
    }
    setEmailCountdown(60);
    const timer = setInterval(() => {
      setEmailCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const bindEmail = async () => {
    if (!emailForm.newEmail) {
      onShowToast('error', '❌', t.emailRequired);
      return;
    }
    if (!emailForm.code) {
      onShowToast('error', '❌', t.codeRequired);
      return;
    }
    const verifyResult = await onVerifyCode(emailForm.newEmail, emailForm.code);
    if (!verifyResult.success) {
      onShowToast('error', '❌', verifyResult.message || t.codeIncorrect);
      return;
    }
    await onUpdateSettings({ email: emailForm.newEmail });
    onShowToast('success', '✅', t.emailBindSuccess);
    setEmailForm({ newEmail: '', code: '' });
  };

  const saveSettings = async () => {
    await onUpdateSettings({
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
              <Label className="block text-sm font-medium text-gray-700">{t.siteName}</Label>
              <Input
                value={form.siteName}
                onChange={(e) => setForm({ ...form, siteName: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                placeholder="请输入站点名称"
              />
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
              {!user.email ? (
                <div className="space-y-3">
                  <Input
                    type="email"
                    value={emailForm.newEmail}
                    onChange={(e) => setEmailForm({ ...emailForm, newEmail: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    placeholder={t.enterEmail}
                  />
                  <div className="flex gap-3">
                    <Input
                      type="text"
                      value={emailForm.code}
                      onChange={(e) => setEmailForm({ ...emailForm, code: e.target.value })}
                      className="flex-1 px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                      placeholder={t.enterCode}
                      maxLength={6}
                    />
                    <Button
                      onClick={sendEmailCode}
                      disabled={emailCountdown > 0}
                      className="px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-300 whitespace-nowrap"
                      variant="outline"
                    >
                      {emailCountdown > 0 ? `${emailCountdown}s` : t.sendCode}
                    </Button>
                  </div>
                  <Button 
                    onClick={bindEmail} 
                    className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    {t.bindEmail}
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-green-50 px-4 py-3 rounded-lg border border-green-100">
                  <span className="text-gray-700">{user.email}</span>
                  <span className="text-sm text-green-600 font-medium">{t.emailVerified}</span>
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
              <Label htmlFor="minimal" className="text-gray-700 font-medium cursor-pointer">极简模式</Label>
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

        {/* Account Management */}
        <div className="border-t border-gray-200 pt-8">
          <h3 className="text-xl font-semibold mb-6 text-gray-800">{t.accountManagement}</h3>
          <div className="space-y-4">
            <Link to="/change-password">
              <Button className="w-full py-3 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg shadow-sm transition-all duration-300">
                <FontAwesomeIcon icon="key" className="mr-2" /> {t.changePassword}
              </Button>
            </Link>
            <Link to="/delete-account">
              <Button className="w-full py-3 bg-white border border-red-300 text-red-600 hover:bg-red-50 rounded-lg shadow-sm transition-all duration-300">
                <FontAwesomeIcon icon="exclamation-triangle" className="mr-2" /> {t.deleteAccount}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
