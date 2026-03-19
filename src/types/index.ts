// User types
export interface User {
  id: number;
  username: string;
  email: string | null;
  password: string;
  role: string; // 'user' or 'admin'
  bookmarkLimit: number;
  disabled: boolean;
  siteName: string;
  siteDesc: string;
  // Visual settings
  bgMode: 'gradient' | 'color' | 'image';
  bgColor: string;
  bgImage: string;
  enableParticles: boolean;
  particleStyle: 'stars' | 'falling' | 'pulse' | 'float' | 'mixed';
  particleColor: string;
  cardColor: string;
  cardOpacity: number;
  cardTextColor: string;
  enableMinimalMode: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Bookmark {
  id: number;
  userId: number;
  title: string;
  url: string;
  description: string;
  icon: string | null;
  categoryId: number | null;
  isPublic: boolean;
  createdAt: string;
}

export interface Category {
  id: number;
  userId: number;
  name: string;
}

export interface VerificationCode {
  code: string;
  timestamp: number;
}

export interface Toast {
  show: boolean;
  icon: string;
  message: string;
  color: string;
}

export type Lang = 'zh' | 'en';

export interface EmojiPresets {
  [key: string]: string[];
}

export type BackgroundMode = 'gradient' | 'color' | 'image';
export type ParticleStyle = 'stars' | 'falling' | 'pulse' | 'float' | 'mixed';