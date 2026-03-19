'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { TRANSLATIONS } from '@/i18n';
import Particles from '@/components/particles';

export default function HomePage() {
  const router = useRouter();
  const { lang } = useLanguage();
  const t = TRANSLATIONS[lang === 'zh' ? 'zh' : 'en'];
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('navigeer_access_token');
      setIsLoggedIn(!!token);
    }
  }, []);

  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/30 via-pink-600/30 to-indigo-600/30 backdrop-blur-sm"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center overflow-hidden relative">
      {/* 背景粒子效果 */}
      <Particles 
        style="stars" 
        color="#ffffff" 
      />
      
      {/* 半透明背景 */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/30 via-pink-600/30 to-indigo-600/30 backdrop-blur-sm"></div>
      
      {/* 主内容 */}
      <div className="relative z-10 text-center p-8 max-w-4xl mx-auto">
        {/* Logo 和标题 */}
        <div className="mb-12">
          <h1 className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-white mb-4 animate-fadeIn">
            XiXiLiYa
          </h1>
          <p className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-white animate-fadeIn delay-100">
            Navigeer
          </p>
        </div>
        
        {/* 描述 */}
        <div className="mb-16 animate-fadeIn delay-200">
          <p className="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
            {t.siteDescription}
          </p>
        </div>
        
        {/* 按钮区域 */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center animate-fadeIn delay-300">
          <Button 
            asChild
            className="px-8 py-4 text-lg bg-white hover:bg-white/90 text-purple-600"
          >
            <Link href="/login">
              {t.login}
            </Link>
          </Button>
          <Button 
            asChild
            className="px-8 py-4 text-lg bg-white/20 hover:bg-white/30 text-white border border-white/30"
          >
            <Link href="/register">
              {t.register}
            </Link>
          </Button>
        </div>
        
        {/* 底部信息 */}
        <div className="mt-20 text-white/60 text-sm animate-fadeIn delay-400">
          <p>© 2026 XiXiLiYa Navigeer. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}