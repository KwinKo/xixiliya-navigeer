import type { Translations } from '@/i18n';
import type { User, Bookmark, Category, EmojiPresets } from '@/types';
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
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
import BackToTopButton from '@/components/BackToTopButton';

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

const emojiPresets: EmojiPresets = {
  web: ['🔗', '🌐', '🏠', '📄', '🔍', '📡', '🔒', '🌍', '🌎', '🌏', '💻', '🖥️', '📱', '⚡', '🔧', '⚙️'],
  social: ['❤️', '👍', '⭐', '🔥', '💬', '📧', '📞', '📮', '🎁', '🎉', '👥', '👤', '🤝', '💬', '📢', '📣'],
  tools: ['🛠️', '🔧', '⚙️', '📊', '📈', '📉', '🗂️', '📁', '📋', '📝', '✏️', '📌', '🔎', '💡', '🎯', '✅'],
  media: ['🎵', '🎶', '🎬', '📺', '🎥', '📷', '🖼️', '🎨', '🎭', '🎪', '🎮', '🕹️', '🎲', '🎸', '🎹', '🎺'],
  office: ['📅', '📆', '🗓️', '⏰', '⏱️', '📊', '📈', '💰', '💳', '🏦', '📧', '✉️', '📄', '📑', '📋', '🗃️'],
  life: ['🍕', '🍔', '☕', '🍰', '🎁', '🛒', '🚗', '✈️', '🏨', '🏖️', '☀️', '🌈', '🏃', '💪', '🧘', '🎯'],
  other: ['🔔', '📌', '📍', '⚠️', '❓', '💎', '🌟', '✨', '🎀', '🏆', '🎪', '🎯', '🔮', '🎭', '🎨', '🎬'],
};

const Dashboard: React.FC<DashboardProps> = ({
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
}) => {
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [showBookmarkForm, setShowBookmarkForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedEmojiCategory, setSelectedEmojiCategory] = useState('web');

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

  const handleSaveBookmark = () => {
    // Validate form inputs
    if (!bookmarkForm.title.trim()) {
      onShowToast('error', '❌', '请输入书签标题');
      return;
    }
    if (!bookmarkForm.url.trim()) {
      onShowToast('error', '❌', '请输入书签网址');
      return;
    }
    
    // Validate URL format
    try {
      new URL(bookmarkForm.url.trim());
    } catch (error) {
      onShowToast('error', '❌', '请输入有效的网址格式');
      return;
    }
    
    if (editingBookmark) {
      onUpdateBookmark(editingBookmark.id, bookmarkForm);
      onShowToast('success', '✅', t.updateSuccess);
    } else {
      // Check bookmark limit
      if (userBookmarks.length >= user.bookmarkLimit) {
        alert(`⚠️ ${t.reachLimit}\n\n📱 微信添加: KwinKo`);
        return;
      }
      onAddBookmark({ ...bookmarkForm, userId: user.id });
      onShowToast('success', '✅', t.addSuccess);
    }
    closeBookmarkForm();
  };

  const handleSaveCategory = () => {
    onAddCategory(categoryForm.name);
    onShowToast('success', '✅', t.categoryAddSuccess);
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
      onShowToast('error', '❌', t.deleteCategoryFail);
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
        onShowToast('success', '✅', t.importSuccess);
      } else {
        onShowToast('error', '❌', t.importFail);
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
      icon: bookmark.icon,
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
      icon: bookmark.icon,
    });
  };

  const saveRowEdit = (bookmark: Bookmark) => {
    // Validate title
    if (!editForm.title.trim()) {
      onShowToast('error', '❌', '请输入书签标题');
      return;
    }
    
    // Validate URL
    if (!editForm.url.trim()) {
      onShowToast('error', '❌', '请输入书签网址');
      return;
    }
    
    // Validate URL format
    try {
      new URL(editForm.url.trim());
    } catch (error) {
      onShowToast('error', '❌', '请输入有效的网址格式');
      return;
    }
    
    onUpdateBookmark(bookmark.id, editForm);
    setEditingRow(null);
    onShowToast('success', '✅', t.updateSuccess);
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
        <p className="text-white/70">{user.siteDesc}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="stat-card">
          <div className="stat-value">{userBookmarks.length}</div>
          <div className="text-sm text-gray-500 mt-2">{t.totalBookmarks}</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{userCategories.length}</div>
          <div className="text-sm text-gray-500 mt-2">{t.totalCategories}</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{user.bookmarkLimit}</div>
          <div className="text-sm text-gray-500 mt-2">{t.bookmarkLimit}</div>
        </div>
        <div className="stat-card">
          <a href={`/#/${user.username}`} className="stat-value text-lg text-purple-500 hover:text-purple-700">
            /{user.username}
          </a>
          <div className="text-sm text-gray-500 mt-2">{t.publicLink}</div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-4 mb-8">
        <Button onClick={() => setShowBookmarkForm(true)} className="btn-primary">
          <FontAwesomeIcon icon="plus" className="mr-2" /> {t.addBookmark}
        </Button>
        <Button onClick={() => setShowCategoryForm(true)} className="btn-secondary" variant="outline">
          <FontAwesomeIcon icon="folder" className="mr-2" /> {t.addCategory}
        </Button>
        <Button onClick={() => setViewMode(viewMode === 'card' ? 'table' : 'card')} className="btn-secondary" variant="outline">
          <FontAwesomeIcon icon={viewMode === 'card' ? 'list' : 'th'} className="mr-2" /> {viewMode === 'card' ? t.tableView : t.cardView}
        </Button>
        <Button onClick={onExport} className="btn-secondary" variant="outline">
          <FontAwesomeIcon icon="download" className="mr-2" /> {t.export}
        </Button>
        <Button asChild className="btn-secondary" variant="outline">
          <label className="cursor-pointer">
            <FontAwesomeIcon icon="upload" className="mr-2" /> {t.import}
            <input type="file" onChange={handleImport} accept=".json" className="hidden" />
          </label>
        </Button>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-3 mb-8 items-center">
        <span
          className={`px-4 py-2 rounded-full cursor-pointer transition-all ${!selectedCategory ? 'bg-purple-600 text-white shadow-md' : 'bg-white/90 text-gray-700 hover:bg-white shadow-sm'}`}
          onClick={() => setSelectedCategory(null)}
        >
          {t.all} ({userBookmarks.length})
        </span>
        {userCategories.map((cat) => (
          <span
            key={cat.id}
            className={`px-4 py-2 rounded-full cursor-pointer transition-all group flex items-center ${selectedCategory === cat.id ? 'bg-purple-600 text-white shadow-md' : 'bg-white/90 text-gray-700 hover:bg-white shadow-sm'}`}
          >
            <span onClick={() => setSelectedCategory(cat.id)} className="flex items-center gap-2">
              <FontAwesomeIcon icon="folder" /> {cat.name} ({userBookmarks.filter((b) => b.categoryId === cat.id).length})
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteCategory(cat);
              }}
              className="ml-2 p-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center w-5 h-5"
            >
              ×
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
                        <div className="w-12 h-12 flex items-center justify-center text-2xl">
                          {b.icon || <FontAwesomeIcon icon="link" size="lg" />}
                        </div>
                        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => startEdit(b)} className="p-2 rounded-full bg-transparent hover:bg-white/20 text-gray-600 hover:text-purple-600 transition-all focus:outline-none">
                            <FontAwesomeIcon icon="edit" />
                          </button>
                          <button onClick={() => handleDeleteBookmark(b)} className="p-2 rounded-full bg-transparent hover:bg-white/20 text-gray-600 hover:text-red-600 transition-all focus:outline-none">
                            <FontAwesomeIcon icon="trash" />
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
            <div className="empty-state flex flex-col items-center justify-center py-20">
              <div className="text-8xl mb-4"><FontAwesomeIcon icon="book" size="5x" /></div>
              <p className="text-xl text-gray-600 font-medium">{t.noBookmarks}</p>
            </div>
          )}
        </>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <>
          {filteredBookmarks.length > 0 ? (
            <div className="glass-card overflow-hidden">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{t.title}</th>
                    <th>{t.url}</th>
                    <th>{t.description}</th>
                    <th>{t.category}</th>
                    <th>{t.isPublic}</th>
                    <th>{t.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookmarks.map((b) => (
                    <tr key={b.id}>
                      <td>
                        {editingRow === b.id ? (
                          <Input
                            value={editForm.title}
                            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                            className="form-input text-sm py-1"
                          />
                        ) : (
                          <span className="font-medium flex items-center gap-2">
                            <span className="text-lg">{b.icon || <FontAwesomeIcon icon="link" />}</span>
                            {b.title}
                          </span>
                        )}
                      </td>
                      <td>
                        {editingRow === b.id ? (
                          <Input
                            value={editForm.url}
                            onChange={(e) => setEditForm({ ...editForm, url: e.target.value })}
                            className="form-input text-sm py-1"
                          />
                        ) : (
                          <a href={b.url} target="_blank" className="text-purple-500 hover:underline truncate block max-w-xs">
                            {b.url}
                          </a>
                        )}
                      </td>
                      <td>
                        {editingRow === b.id ? (
                          <Input
                            value={editForm.description}
                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                            className="form-input text-sm py-1"
                          />
                        ) : (
                          <span className="text-gray-500 text-sm">{b.description || '-'}</span>
                        )}
                      </td>
                      <td>
                        {editingRow === b.id ? (
                          <Select
                            value={editForm.categoryId?.toString() || 'null'}
                            onValueChange={(v) => setEditForm({ ...editForm, categoryId: v === 'null' ? null : parseInt(v) })}
                          >
                            <SelectTrigger className="form-input text-sm py-1">
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
                      <td>
                        {editingRow === b.id ? (
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={editForm.isPublic}
                              onChange={(e) => setEditForm({ ...editForm, isPublic: e.target.checked })}
                              className="w-4 h-4"
                            />
                            <span className="text-sm">{editForm.isPublic ? t.public : t.private}</span>
                          </label>
                        ) : (
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              b.isPublic ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {b.isPublic ? t.public : t.private}
                          </span>
                        )}
                      </td>
                      <td>
                        {editingRow === b.id ? (
                          <div className="flex gap-2">
                            <button onClick={() => saveRowEdit(b)} className="text-sm px-2 py-1 bg-green-500 text-white rounded">
                              ✓
                            </button>
                            <button onClick={cancelRowEdit} className="text-sm px-2 py-1 bg-gray-500 text-white rounded">
                              ✗
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <button onClick={() => startRowEdit(b)} className="p-2 rounded-full bg-transparent hover:bg-white/20 text-gray-600 hover:text-purple-600 transition-all focus:outline-none">
                              <FontAwesomeIcon icon="edit" size="sm" />
                            </button>
                            <button onClick={() => handleDeleteBookmark(b)} className="p-2 rounded-full bg-transparent hover:bg-white/20 text-gray-600 hover:text-red-600 transition-all focus:outline-none">
                              <FontAwesomeIcon icon="trash" size="sm" />
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
            <div className="empty-state">
              <div className="text-6xl mb-4">📚</div>
              <p>{t.noBookmarks}</p>
            </div>
          )}
        </>
      )}

      {/* Bookmark Form Dialog */}
      <Dialog open={showBookmarkForm} onOpenChange={setShowBookmarkForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingBookmark ? t.edit : t.addBookmark}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label className="block text-sm font-medium mb-2">{t.title}</Label>
              <Input
                value={bookmarkForm.title}
                onChange={(e) => setBookmarkForm({ ...bookmarkForm, title: e.target.value })}
                className="form-input"
              />
            </div>
            <div>
              <Label className="block text-sm font-medium mb-2">{t.url}</Label>
              <Input
                type="url"
                value={bookmarkForm.url}
                onChange={(e) => setBookmarkForm({ ...bookmarkForm, url: e.target.value })}
                className="form-input"
              />
            </div>
            <div>
              <Label className="block text-sm font-medium mb-2">{t.icon}</Label>
              <div className="flex items-center gap-3">
                <Input
                  value={bookmarkForm.icon}
                  onChange={(e) => setBookmarkForm({ ...bookmarkForm, icon: e.target.value })}
                  className="form-input flex-1"
                  placeholder={t.iconPlaceholder}
                  maxLength={2}
                />
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-2xl flex-shrink-0">
                  {bookmarkForm.icon || '🔗'}
                </div>
              </div>

              {/* Emoji Picker */}
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1"
                >
                  <span>{t.iconPresets}</span>
                  <svg
                    className={`w-4 h-4 transition-transform ${showEmojiPicker ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showEmojiPicker && (
                  <div className="mt-3 p-4 bg-white rounded-xl border border-gray-200 shadow-lg">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {Object.keys(emojiPresets).map((catName) => (
                        <button
                          key={catName}
                          onClick={() => setSelectedEmojiCategory(catName)}
                          className={`px-3 py-1 text-xs rounded-full transition-colors ${
                            selectedEmojiCategory === catName
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {t[`presetCategory${catName.charAt(0).toUpperCase() + catName.slice(1)}` as keyof Translations] || catName}
                        </button>
                      ))}
                    </div>
                    <div className="grid grid-cols-8 gap-2">
                      {emojiPresets[selectedEmojiCategory].map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => {
                            setBookmarkForm({ ...bookmarkForm, icon: emoji });
                            setShowEmojiPicker(false);
                          }}
                          className="w-8 h-8 flex items-center justify-center text-lg hover:bg-blue-100 rounded-lg transition-colors"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <p className="text-xs text-gray-500 mt-1">{t.iconHint}</p>
            </div>
            <div>
              <Label className="block text-sm font-medium mb-2">{t.description}</Label>
              <Textarea
                value={bookmarkForm.description}
                onChange={(e) => setBookmarkForm({ ...bookmarkForm, description: e.target.value })}
                className="form-input"
                rows={2}
              />
            </div>
            <div>
              <Label className="block text-sm font-medium mb-2">{t.category}</Label>
              <Select
                value={bookmarkForm.categoryId?.toString() || 'null'}
                onValueChange={(v) => setBookmarkForm({ ...bookmarkForm, categoryId: v === 'null' ? null : parseInt(v) })}
              >
                <SelectTrigger className="form-input">
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
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="pub"
                checked={bookmarkForm.isPublic}
                onChange={(e) => setBookmarkForm({ ...bookmarkForm, isPublic: e.target.checked })}
                className="w-4 h-4"
              />
              <Label htmlFor="pub">{t.isPublic}</Label>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleSaveBookmark} className="btn-primary flex-1">
                {t.save}
              </Button>
              <Button onClick={closeBookmarkForm} className="btn-secondary flex-1" variant="outline">
                {t.cancel}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Category Form Dialog */}
      <Dialog open={showCategoryForm} onOpenChange={setShowCategoryForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.addCategory}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label className="block text-sm font-medium mb-2">{t.categoryName}</Label>
              <Input
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ name: e.target.value })}
                className="form-input"
              />
            </div>
            <div className="flex gap-3">
              <Button onClick={handleSaveCategory} className="btn-primary flex-1">
                {t.save}
              </Button>
              <Button onClick={() => setShowCategoryForm(false)} className="btn-secondary flex-1" variant="outline">
                {t.cancel}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Back to Top Button */}
      <BackToTopButton />
    </div>
  );
};

export default Dashboard;
