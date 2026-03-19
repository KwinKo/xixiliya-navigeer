'use client';

import type { Translations } from '@/i18n';
import type { User, Bookmark, Category } from '@/types';
import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Plus, Edit, Trash2, ExternalLink, List, Grid, Folder, 
  Download, Upload, Bookmark as BookmarkIcon, ChevronDown, Link, 
  Globe, Home, FileText, Wifi, Lock, Earth, Monitor, Laptop, 
  Smartphone, Zap, Wrench, Settings, Code, Server, Heart, ThumbsUp, 
  Star, MessageSquare, Mail, Phone, Send, Users, User as UserIcon, Share2, Bell, 
  MessageCircle, Twitter, Facebook, Instagram, Linkedin, BarChart3, 
  TrendingUp, TrendingDown, FolderTree, FileCheck, FilePenLine, Pin, 
  Lightbulb, Target, CheckCircle, AlertCircle, Info, 
  Music, Video, Film, MonitorPlay, Camera, Image, Palette, Headphones, 
  Mic, Radio, Gamepad2, Tv, Disc, Guitar, Piano, Drum, Calendar, Clock, 
  FileBarChart, DollarSign, CreditCard, Banknote, FileCode, 
  Clipboard, Database, Briefcase, Printer, ScanLine, Utensils, 
  Coffee, ShoppingBag, Car, Plane, Hotel, Sun, Cloud, Leaf, Mountain, 
  MapPin, AlertTriangle, HelpCircle, Diamond, Sparkles, Gift, Award, 
  Trophy, Compass, Brush, Bike, Handshake, Brain, Activity 
} from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import BackToTopButton from '@/components/BackToTopButton';
import { TRANSLATIONS } from '@/i18n';
import { useLanguage } from '@/contexts/LanguageContext';
import { apiService } from '@/services/api';

interface DashboardProps {
  t: Translations;
  user: User;
  bookmarks: Bookmark[];
  categories: Category[];
  settings: {
    cardColor: string;
    cardOpacity: number;
    cardTextColor: string;
  };
  searchQuery: string;
  onAddBookmark: (data: Omit<Bookmark, 'id' | 'createdAt'>) => void;
  onUpdateBookmark: (id: number, data: Partial<Bookmark>) => void;
  onDeleteBookmark: (id: number) => void;
  onAddCategory: (name: string) => void;
  onDeleteCategory: (id: number) => void;
  onExport: () => void;
  onImport: (data: string) => Promise<{ success: boolean; error?: string }>;
  onShowToast: (type: 'success' | 'error', icon: string, message: string) => void;
}

const iconMap = {
  Link,
  Globe,
  Home,
  FileText,
  Wifi,
  Lock,
  Earth,
  Monitor,
  Laptop,
  Smartphone,
  Zap,
  Wrench,
  Settings,
  Code,
  Server,
  Heart,
  ThumbsUp,
  Star,
  MessageSquare,
  Mail,
  Phone,
  Send,
  Users,
  UserIcon,
  Share2,
  Bell,
  MessageCircle,
  Twitter,
  Facebook,
  Instagram,
  Linkedin,
  BarChart3,
  TrendingUp,
  TrendingDown,
  FolderTree,
  Folder,
  FileCheck,
  FilePenLine,
  Pin,
  Lightbulb,
  Target,
  CheckCircle,
  AlertCircle,
  Info,
  Music,
  Video,
  Film,
  MonitorPlay,
  Camera,
  Image,
  Palette,
  Headphones,
  Mic,
  Radio,
  Gamepad2,
  Tv,
  Disc,
  Guitar,
  Piano,
  Drum,
  Calendar,
  Clock,
  FileBarChart,
  DollarSign,
  CreditCard,
  Banknote,
  FileCode,
  Clipboard,
  Database,
  Briefcase,
  Printer,
  ScanLine,
  Utensils,
  Coffee,
  ShoppingBag,
  Car,
  Plane,
  Hotel,
  Sun,
  Cloud,
  Leaf,
  Mountain,
  Bike,
  Handshake,
  Brain,
  Activity,
  MapPin,
  AlertTriangle,
  HelpCircle,
  Diamond,
  Sparkles,
  Gift,
  Award,
  Trophy,
  Compass,
  Brush,
};

const emojiPresets: Record<string, string[]> = {
  web: ['Link', 'Globe', 'Home', 'FileText', 'Search', 'Wifi', 'Lock', 'Earth', 'Monitor', 'Laptop', 'Smartphone', 'Zap', 'Wrench', 'Settings', 'Code', 'Server'],
  social: ['Heart', 'ThumbsUp', 'Star', 'MessageSquare', 'Mail', 'Phone', 'Send', 'Users', 'UserIcon', 'Share2', 'Bell', 'MessageCircle', 'Twitter', 'Facebook', 'Instagram', 'Linkedin'],
  tools: ['Wrench', 'Settings', 'BarChart3', 'TrendingUp', 'TrendingDown', 'FolderTree', 'Folder', 'FileCheck', 'FilePenLine', 'Pin', 'Lightbulb', 'Target', 'CheckCircle', 'AlertCircle', 'Info'],
  media: ['Music', 'Video', 'Film', 'MonitorPlay', 'Camera', 'Image', 'Palette', 'Headphones', 'Mic', 'Radio', 'Gamepad2', 'Tv', 'Disc', 'Guitar', 'Piano', 'Drum'],
  office: ['Calendar', 'Clock', 'FileBarChart', 'DollarSign', 'CreditCard', 'Banknote', 'Mail', 'FileText', 'FileCode', 'Clipboard', 'Database', 'Briefcase', 'Printer', 'ScanLine'],
  life: ['Utensils', 'Coffee', 'ShoppingBag', 'Car', 'Plane', 'Hotel', 'Sun', 'Cloud', 'Leaf', 'Mountain', 'Bike', 'Handshake', 'Brain', 'Activity', 'Target'],
  other: ['Bell', 'Pin', 'MapPin', 'AlertTriangle', 'HelpCircle', 'Diamond', 'Star', 'Sparkles', 'Gift', 'Award', 'Trophy', 'Target', 'Compass', 'Palette', 'Brush', 'Camera'],
};

const DashboardComponent = ({
  t,
  user,
  bookmarks,
  categories,
  settings,
  searchQuery,
  onAddBookmark,
  onUpdateBookmark,
  onDeleteBookmark,
  onAddCategory,
  onDeleteCategory,
  onExport,
  onImport,
  onShowToast,
}: DashboardProps) => {
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [showBookmarkForm, setShowBookmarkForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedEmojiCategory, setSelectedEmojiCategory] = useState('web');
  const [showLimitReachedDialog, setShowLimitReachedDialog] = useState(false);
  const [showFormError, setShowFormError] = useState(false);
  const [formErrorMessage, setFormErrorMessage] = useState('');
  const [showFormSuccess, setShowFormSuccess] = useState(false);
  const [formSuccessMessage, setFormSuccessMessage] = useState('');
  const [showIconPresets, setShowIconPresets] = useState(false);
  const [SearchIcon, setSearchIcon] = useState<any>(null);

  const [bookmarkForm, setBookmarkForm] = useState({
    title: '',
    url: '',
    description: '',
    icon: '🔗',
    categoryId: null as number | null,
    isPublic: true,
  });

  const [categoryForm, setCategoryForm] = useState({ name: '' });
  const [editForm, setEditForm] = useState({
    title: '',
    url: '',
    description: '',
    categoryId: null as number | null,
    isPublic: true,
    icon: '🔗',
  });

  const userBookmarks = useMemo(
    () => bookmarks.filter((b) => b.userId === user.id),
    [bookmarks, user.id]
  );

  const userCategories = useMemo(
    () => categories.filter((c) => c.userId === user.id),
    [categories, user.id]
  );

  const filteredBookmarks = useMemo(() => {
    let result = userBookmarks;

    if (selectedCategory !== null) {
      result = result.filter((b) => b.categoryId === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(query) ||
          b.url.toLowerCase().includes(query) ||
          (b.description && b.description.toLowerCase().includes(query))
      );
    }

    return result;
  }, [userBookmarks, selectedCategory, searchQuery]);

  const cardStyle = useMemo(() => {
    const color = settings.cardColor || '#ffffff';
    const opacity = (settings.cardOpacity || 85) / 100;
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return {
      backgroundColor: `rgba(${r}, ${g}, ${b}, ${opacity})`,
    };
  }, [settings]);

  const textStyle = useMemo(() => {
    return {
      color: settings.cardTextColor || '#333333',
    };
  }, [settings.cardTextColor]);

  const getCategoryName = (categoryId: number | null) => {
    if (!categoryId) return t.uncategorized;
    const cat = userCategories.find((c) => c.id === categoryId);
    return cat ? cat.name : t.uncategorized;
  };

  useEffect(() => {
    import('lucide-react').then((module) => {
      setSearchIcon(() => module.Search);
    });
  }, []);

  const handleSaveBookmark = () => {
    // Validate form inputs
    if (!bookmarkForm.title.trim()) {
      setFormErrorMessage(t.titleRequired);
      setShowFormError(true);
      return;
    }
    if (!bookmarkForm.url.trim()) {
      setFormErrorMessage(t.urlRequired);
      setShowFormError(true);
      return;
    }
    
    // Validate URL format
    try {
      new URL(bookmarkForm.url.trim());
    } catch (error) {
      setFormErrorMessage(t.invalidUrl);
      setShowFormError(true);
      return;
    }
    
    if (editingBookmark) {
      onUpdateBookmark(editingBookmark.id, bookmarkForm);
      setFormSuccessMessage(t.updateSuccess);
      setShowFormSuccess(true);
    } else {
      // Check bookmark limit
      if (userBookmarks.length >= user.bookmarkLimit) {
        setShowLimitReachedDialog(true);
        return;
      }
      onAddBookmark({ ...bookmarkForm, userId: user.id });
      setFormSuccessMessage(t.addSuccess);
      setShowFormSuccess(true);
    }
    closeBookmarkForm();
  };

  const handleSaveCategory = () => {
    onAddCategory(categoryForm.name);
    setFormSuccessMessage(t.categoryAddSuccess);
    setShowFormSuccess(true);
    setCategoryForm({ name: '' });
    setShowCategoryForm(false);
  };

  const handleDeleteBookmark = (bookmark: Bookmark) => {
    if (confirm(t.deleteConfirm)) {
      onDeleteBookmark(bookmark.id);
    }
  };

  const handleDeleteCategory = (cat: Category) => {
    const hasBookmarks = userBookmarks.some((b) => b.categoryId === cat.id);
    if (hasBookmarks) {
      setFormErrorMessage(t.deleteCategoryFail);
      setShowFormError(true);
      return;
    }
    if (confirm(`${t.deleteConfirm} "${cat.name}"`)) {
      onDeleteCategory(cat.id);
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const result = await onImport(ev.target?.result as string);
      if (result.success) {
        setFormSuccessMessage(t.importSuccess);
        setShowFormSuccess(true);
      } else {
        setFormErrorMessage(result.error || t.importFail);
        setShowFormError(true);
      }
    };
    reader.readAsText(file);
  };

  const closeBookmarkForm = () => {
    setShowBookmarkForm(false);
    setEditingBookmark(null);
    setShowEmojiPicker(false);
    setSelectedEmojiCategory('web');
    setBookmarkForm({
      title: '',
      url: '',
      description: '',
      icon: '🔗',
      categoryId: null,
      isPublic: true,
    });
  };

  const startEdit = (bookmark: Bookmark) => {
    setEditingBookmark(bookmark);
    setBookmarkForm({
      title: bookmark.title,
      url: bookmark.url,
      description: bookmark.description,
      icon: bookmark.icon || '',
      categoryId: bookmark.categoryId,
      isPublic: bookmark.isPublic,
    });
    setShowBookmarkForm(true);
  };

  const startRowEdit = (bookmark: Bookmark) => {
    setEditingRow(bookmark.id);
    setEditForm({
      title: bookmark.title,
      url: bookmark.url,
      description: bookmark.description,
      categoryId: bookmark.categoryId,
      isPublic: bookmark.isPublic,
      icon: bookmark.icon || '',
    });
  };

  const saveRowEdit = (bookmark: Bookmark) => {
    // Validate title
    if (!editForm.title || !editForm.title.trim()) {
      setFormErrorMessage(t.titleRequired);
      setShowFormError(true);
      return;
    }
    
    // Validate URL
    if (!editForm.url || !editForm.url.trim()) {
      setFormErrorMessage(t.urlRequired);
      setShowFormError(true);
      return;
    }
    
    // Validate URL format
    try {
      new URL(editForm.url.trim());
    } catch (error) {
      setFormErrorMessage(t.invalidUrl);
      setShowFormError(true);
      return;
    }
    
    onUpdateBookmark(bookmark.id, editForm);
    setEditingRow(null);
    setFormSuccessMessage(t.updateSuccess);
    setShowFormSuccess(true);
  };

  const cancelRowEdit = () => {
    setEditingRow(null);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          {t.welcome}, {user.username}!
        </h1>
        <p className="text-white/70">{user.siteDesc || t.siteDescDefault}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-gray-200/30">
          <div className="text-3xl font-bold text-gray-800">{userBookmarks.length}</div>
          <div className="text-sm text-gray-500 mt-2">{t.totalBookmarks}</div>
        </div>
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-gray-200/30">
          <div className="text-3xl font-bold text-gray-800">{userCategories.length}</div>
          <div className="text-sm text-gray-500 mt-2">{t.totalCategories}</div>
        </div>
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-gray-200/30">
          <div className="text-3xl font-bold text-gray-800">{user.bookmarkLimit}</div>
          <div className="text-sm text-gray-500 mt-2">{t.bookmarkLimit}</div>
        </div>
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-gray-200/30">
          <a href={`/${user.username}`} className="text-lg font-bold text-purple-600 hover:text-purple-700 transition-colors">
            /{user.username}
          </a>
          <div className="text-sm text-gray-500 mt-2">{t.publicLink}</div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-4 mb-8">
        <Button onClick={() => setShowBookmarkForm(true)} className="bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2">
          <Plus size={18} /> {t.addBookmark}
        </Button>
        <Button onClick={() => setShowCategoryForm(true)} className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-6 py-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-2">
          <Folder size={18} /> {t.addCategory}
        </Button>
        <Button onClick={() => setViewMode(viewMode === 'card' ? 'table' : 'card')} className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-6 py-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-2">
          {viewMode === 'card' ? <List size={18} /> : <Grid size={18} />} {viewMode === 'card' ? t.tableView : t.cardView}
        </Button>
        <Button onClick={onExport} className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-6 py-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-2">
          <Download size={18} /> {t.export}
        </Button>
        <Button asChild className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-6 py-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
          <label className="cursor-pointer flex items-center gap-2">
            <Upload size={18} /> {t.import}
            <input type="file" onChange={handleImport} accept=".json" className="hidden" />
          </label>
        </Button>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-3 mb-8 items-center">
        <span
          className={`px-4 py-2 rounded-full cursor-pointer transition-all ${!selectedCategory ? 'bg-indigo-600 text-white shadow-md' : 'bg-white/90 text-gray-700 hover:bg-white shadow-sm'}`}
          onClick={() => setSelectedCategory(null)}
        >
          {t.all} ({userBookmarks.length})
        </span>
        {userCategories.map((cat) => (
          <span
            key={cat.id}
            className={`px-4 py-2 rounded-full cursor-pointer transition-all group flex items-center ${selectedCategory === cat.id ? 'bg-indigo-600 text-white shadow-md' : 'bg-white/90 text-gray-700 hover:bg-white shadow-sm'}`}
          >
            <span onClick={() => setSelectedCategory(cat.id)} className="flex items-center gap-2">
              <Folder size={14} /> {cat.name} ({userBookmarks.filter((b) => b.categoryId === cat.id).length})
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteCategory(cat);
              }}
              className="ml-2 p-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center w-5 h-5"
            >
              <Trash2 size={12} />
            </button>
          </span>
        ))}
      </div>

      {/* Card View */}
      {viewMode === 'card' && (
        <>
          {filteredBookmarks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredBookmarks.map((b) => (
                  <div
                    key={b.id}
                    className="rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                    style={cardStyle}
                    onClick={() => window.open(b.url, '_blank')}
                  >
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-12 h-12 flex items-center justify-center">
                          {b.icon && iconMap[b.icon as keyof typeof iconMap] ? (
                            React.createElement(iconMap[b.icon as keyof typeof iconMap], { size: 24, className: "text-gray-600" })
                          ) : (
                            <BookmarkIcon size={24} className="text-gray-600" />
                          )}
                        </div>
                        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => startEdit(b)} className="p-2 rounded-full bg-transparent hover:bg-white/20 text-gray-600 hover:text-indigo-600 transition-all focus:outline-none">
                            <Edit size={16} />
                          </button>
                          <button onClick={() => handleDeleteBookmark(b)} className="p-2 rounded-full bg-transparent hover:bg-white/20 text-gray-600 hover:text-red-600 transition-all focus:outline-none">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <h3 className="font-semibold mb-1 truncate" style={textStyle}>{b.title}</h3>
                      <p className="text-sm mb-2 truncate" style={{ color: (settings.cardTextColor || '#333333') + '80' }}>{b.url}</p>
                      {b.description && <p className="text-xs mb-3" style={{ color: (settings.cardTextColor || '#333333') + '60' }}>{b.description}</p>}
                      <div className="flex gap-2 mt-3">
                        {b.isPublic ? (
                          <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full font-medium">{t.public}</span>
                        ) : (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-medium">{t.private}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/30">
              <BookmarkIcon size={64} className="text-gray-300 mb-4" />
              <p className="text-xl text-gray-600 font-medium">{t.noBookmarks}</p>
            </div>
          )}
        </>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <>
          {filteredBookmarks.length > 0 ? (
            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden border border-gray-200/30">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.title}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.url}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.description}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.category}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.isPublic}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredBookmarks.map((b) => (
                    <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingRow === b.id ? (
                          <Input
                            value={editForm.title}
                            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          />
                        ) : (
                          <span className="font-medium flex items-center gap-2">
                            <span>
                              {b.icon && iconMap[b.icon as keyof typeof iconMap] ? (
                                React.createElement(iconMap[b.icon as keyof typeof iconMap], { size: 16, className: "text-gray-600" })
                              ) : (
                                <BookmarkIcon size={16} className="text-gray-600" />
                              )}
                            </span>
                            {b.title}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingRow === b.id ? (
                          <Input
                            value={editForm.url}
                            onChange={(e) => setEditForm({ ...editForm, url: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          />
                        ) : (
                          <a href={b.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline truncate block max-w-xs">
                            {b.url}
                          </a>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {editingRow === b.id ? (
                          <Input
                            value={editForm.description}
                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          />
                        ) : (
                          <span className="text-gray-500 text-sm">{b.description || '-'}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingRow === b.id ? (
                          <Select
                            value={editForm.categoryId?.toString() || 'null'}
                            onValueChange={(v) => setEditForm({ ...editForm, categoryId: v === 'null' ? null : parseInt(v) })}
                          >
                            <SelectTrigger className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="null">{t.uncategorized}</SelectItem>
                              {userCategories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id.toString()}>
                                  {cat.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <span className="text-sm">{getCategoryName(b.categoryId)}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingRow === b.id ? (
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={editForm.isPublic}
                              onChange={(e) => setEditForm({ ...editForm, isPublic: e.target.checked })}
                              className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="text-sm">{editForm.isPublic ? t.public : t.private}</span>
                          </label>
                        ) : (
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${b.isPublic ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}
                          >
                            {b.isPublic ? t.public : t.private}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {editingRow === b.id ? (
                          <div className="flex gap-2">
                            <Button onClick={() => saveRowEdit(b)} className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs">
                              ✓
                            </Button>
                            <Button onClick={cancelRowEdit} className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-xs">
                              ✗
                            </Button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <button onClick={() => startRowEdit(b)} className="text-indigo-600 hover:text-indigo-800">
                              <Edit size={16} />
                            </button>
                            <button onClick={() => handleDeleteBookmark(b)} className="text-red-600 hover:text-red-800">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/30">
              <BookmarkIcon size={64} className="text-gray-300 mb-4" />
              <p className="text-xl text-gray-600 font-medium">{t.noBookmarks}</p>
            </div>
          )}
        </>
      )}

      {/* Bookmark Form Dialog */}
      <Dialog open={showBookmarkForm} onOpenChange={setShowBookmarkForm}>
        <DialogContent 
          className="max-h-[90vh] overflow-y-auto"
        >
          <DialogHeader className="sr-only">
            <DialogTitle>{editingBookmark ? t.editBookmark : t.addBookmark}</DialogTitle>
          </DialogHeader>
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-2">{t.title}</Label>
                <Input
                  value={bookmarkForm.title}
                  onChange={(e) => setBookmarkForm({ ...bookmarkForm, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                  placeholder={t.title}
                />
              </div>
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-2">{t.url}</Label>
                <Input
                  type="url"
                  value={bookmarkForm.url}
                  onChange={(e) => setBookmarkForm({ ...bookmarkForm, url: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                  placeholder="https://example.com"
                />
              </div>
            </div>
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">{t.icon}</Label>
              <div className="flex items-center gap-3">
                <Input
                  value={bookmarkForm.icon}
                  onChange={(e) => setBookmarkForm({ ...bookmarkForm, icon: e.target.value })}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                  placeholder={t.iconPlaceholder}
                  maxLength={2}
                />
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0">
                  {bookmarkForm.icon && iconMap[bookmarkForm.icon as keyof typeof iconMap] ? (
                    <>
                      {(() => {
                        const IconComponent = iconMap[bookmarkForm.icon as keyof typeof iconMap];
                        return IconComponent ? <IconComponent size={18} className="text-gray-600" /> : null;
                      })()}
                    </>
                  ) : (
                    <Link size={18} className="text-gray-600" />
                  )}
                </div>
              </div>

              {/* Icon Presets */}
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => setShowIconPresets(!showIconPresets)}
                  className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors"
                >
                  <span>{t.iconPresets}</span>
                  <ChevronDown size={16} className={`transition-transform ${showIconPresets ? 'rotate-180' : ''}`} />
                </button>

                {showIconPresets && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {Object.keys(emojiPresets).map((catName) => {
                        return (
                          <button
                            key={catName}
                            onClick={() => setSelectedEmojiCategory(catName)}
                            className={`px-2.5 py-1 text-xs rounded-full transition-colors ${selectedEmojiCategory === catName ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                          >
                            {catName.charAt(0).toUpperCase() + catName.slice(1)}
                          </button>
                        );
                      })}
                    </div>
                    <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5 max-h-32 overflow-y-auto">
                      {emojiPresets[selectedEmojiCategory].map((iconName) => {
                        const IconComponent = iconMap[iconName as keyof typeof iconMap];
                        return (
                          <button
                            key={iconName}
                            type="button"
                            onClick={() => {
                              setBookmarkForm({ ...bookmarkForm, icon: iconName });
                              setShowIconPresets(false);
                            }}
                            className="w-8 h-8 flex items-center justify-center hover:bg-indigo-100 rounded-lg transition-colors"
                          >
                            {IconComponent && <IconComponent size={16} className="text-gray-600" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <p className="text-xs text-gray-500 mt-1">{t.iconHint}</p>
            </div>
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">{t.description}</Label>
              <Textarea
                value={bookmarkForm.description}
                onChange={(e) => setBookmarkForm({ ...bookmarkForm, description: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 resize-none"
                rows={2}
                placeholder={t.description}
              />
            </div>
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">{t.category}</Label>
              <Select
                value={bookmarkForm.categoryId?.toString() || 'null'}
                onValueChange={(v) => setBookmarkForm({ ...bookmarkForm, categoryId: v === 'null' ? null : parseInt(v) })}
              >
                <SelectTrigger className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300">
                  <SelectValue placeholder={t.selectCategory} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="null">{t.uncategorized}</SelectItem>
                  {userCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="public"
                checked={bookmarkForm.isPublic}
                onChange={(e) => setBookmarkForm({ ...bookmarkForm, isPublic: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <Label htmlFor="public" className="text-gray-700">{t.isPublic}</Label>
            </div>
            <div className="flex gap-3 pt-2">
              <Button onClick={handleSaveBookmark} className="flex-1 bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white py-2.5 rounded-lg font-medium">
                {t.save}
              </Button>
              <Button onClick={closeBookmarkForm} variant="outline" className="flex-1 py-2.5 rounded-lg font-medium">
                {t.cancel}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Category Form Dialog */}
      <Dialog open={showCategoryForm} onOpenChange={setShowCategoryForm}>
        <DialogContent>
          <DialogHeader className="sr-only">
            <DialogTitle>{t.addCategory}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">{t.categoryName}</Label>
              <Input
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                placeholder={t.categoryName}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button onClick={handleSaveCategory} className="flex-1 bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white py-2.5 rounded-lg font-medium">
                {t.save}
              </Button>
              <Button onClick={() => setShowCategoryForm(false)} variant="outline" className="flex-1 py-2.5 rounded-lg font-medium">
                {t.cancel}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Limit Reached Dialog */}
      <AlertDialog open={showLimitReachedDialog} onOpenChange={setShowLimitReachedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">{t.reachLimit}</AlertDialogTitle>
            <AlertDialogDescription>
              {userBookmarks.length}/{user.bookmarkLimit} {t.bookmarkLimitReached}
              <div className="mt-3 text-sm text-gray-600">
                📱 {t.contactAdmin}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogAction className="bg-indigo-600 hover:bg-indigo-700">
            {t.ok}
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>

      {/* Form Error Dialog */}
      <AlertDialog open={showFormError} onOpenChange={setShowFormError}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">{t.error}</AlertDialogTitle>
            <AlertDialogDescription>
              {formErrorMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogAction className="bg-indigo-600 hover:bg-indigo-700">
            {t.ok}
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>

      {/* Form Success Dialog */}
      <AlertDialog open={showFormSuccess} onOpenChange={setShowFormSuccess}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-green-600">{t.success}</AlertDialogTitle>
            <AlertDialogDescription>
              {formSuccessMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogAction className="bg-indigo-600 hover:bg-indigo-700">
            {t.ok}
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>

      {/* Back to Top Button */}
      <BackToTopButton />
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

const defaultBookmarks: Bookmark[] = [];
const defaultCategories: Category[] = [];
const defaultSettings = {
  cardColor: '#ffffff',
  cardOpacity: 90,
  cardTextColor: '#000000',
};

export default function DashboardPage() {
  const { lang } = useLanguage();
  const t = TRANSLATIONS[lang === 'zh' ? 'zh' : 'en'];
  const router = useRouter();

  const [user, setUser] = useState<User>(defaultUser);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(defaultBookmarks);
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user data
  useEffect(() => {
    const fetchUserAndData = async () => {
      try {
        setLoading(true);
        
        // Get current user info
        const userResponse = await apiService.getCurrentUserInfo();
        if (userResponse.success && userResponse.data) {
          setUser(userResponse.data);
        } else if (!userResponse.success && (userResponse.message?.includes('Authentication failed') || userResponse.message?.includes('认证失败'))) {
          // 认证失败，重定向到登录页
          router.push('/login');
          return;
        }

        // Get categories
        const categoriesResponse = await apiService.getCategories();
        if (categoriesResponse.success && categoriesResponse.data) {
          setCategories(categoriesResponse.data);
        }

        // Get bookmarks
        const bookmarksResponse = await apiService.getBookmarks();
        if (bookmarksResponse.success && bookmarksResponse.data?.bookmarks) {
          setBookmarks(bookmarksResponse.data.bookmarks);
        }

        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        // 如果是网络错误或认证错误，也重定向到登录页
        if (err instanceof Error && (err.message.includes('fetch') || err.message.includes('Authentication'))) {
          router.push('/login');
          return;
        }
        setError('Failed to fetch data. Please refresh page.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndData();
  }, [router]);

  // API callback functions
  const handleAddBookmark = async (data: Omit<Bookmark, 'id' | 'createdAt'>) => {
    try {
      const response = await apiService.addBookmark(data);
      if (response.success && response.data) {
        setBookmarks(prev => [...prev, response.data!]);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error adding bookmark:', err);
      return false;
    }
  };

  const handleUpdateBookmark = async (id: number, data: Partial<Bookmark>) => {
    try {
      const response = await apiService.updateBookmark(id, data);
      if (response.success && response.data) {
        setBookmarks(prev => prev.map(bookmark => 
          bookmark.id === id ? (response.data || bookmark) : bookmark
        ));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error updating bookmark:', err);
      return false;
    }
  };

  const handleDeleteBookmark = async (id: number) => {
    try {
      const response = await apiService.deleteBookmark(id);
      if (response.success) {
        setBookmarks(prev => prev.filter(bookmark => bookmark.id !== id));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error deleting bookmark:', err);
      return false;
    }
  };

  const handleAddCategory = async (name: string) => {
    try {
      const response = await apiService.addCategory(name);
      if (response.success && response.data) {
        setCategories(prev => [...prev, response.data!]);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error adding category:', err);
      return false;
    }
  };

  const handleDeleteCategory = async (id: number) => {
    try {
      const response = await apiService.deleteCategory(id);
      if (response.success) {
        setCategories(prev => prev.filter(category => category.id !== id));
        // Also update bookmarks in this category to have null categoryId
        setBookmarks(prev => prev.map(bookmark => 
          bookmark.categoryId === id ? ({ ...bookmark, categoryId: null }) : bookmark
        ));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error deleting category:', err);
      return false;
    }
  };

  const handleExport = async () => {
    try {
      const response = await apiService.exportData();
      if (response.success && response.data) {
        // Create download link for export data
        const dataStr = JSON.stringify(response.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `navigeer-export-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error exporting data:', err);
      return false;
    }
  };

  const handleImport = async (data: string) => {
    try {
      const importData = JSON.parse(data);
      const response = await apiService.importData(importData);
      return { success: response.success, error: response.message };
    } catch (err) {
      console.error('Error importing data:', err);
      return { success: false, error: 'Import failed' };
    }
  };

  const handleShowToast = (type: 'success' | 'error', icon: string, message: string) => {
    // Toast notification implementation
    console.log('Toast:', type, icon, message);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900">
        <div className="text-center">
          <div className="text-white text-xl mb-4">Error</div>
          <div className="text-white/70 mb-4">{error}</div>
          <button 
            onClick={() => window.location.reload()}
            className="bg-white text-indigo-900 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <DashboardComponent
      t={t}
      user={user}
      bookmarks={bookmarks}
      categories={categories}
      settings={defaultSettings}
      searchQuery={searchQuery}
      onAddBookmark={handleAddBookmark}
      onUpdateBookmark={handleUpdateBookmark}
      onDeleteBookmark={handleDeleteBookmark}
      onAddCategory={handleAddCategory}
      onDeleteCategory={handleDeleteCategory}
      onExport={handleExport}
      onImport={handleImport}
      onShowToast={handleShowToast}
    />
  );
}
