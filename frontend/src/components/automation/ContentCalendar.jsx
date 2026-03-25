"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAutomation, useSocialAccounts } from '@/components/hooks/useAutomation';
import { getAnalyticsSummary, getPosts, schedulePost, publishPost, deletePost } from '@/lib/dynamic-automation-api';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

// Platform icons
const PlatformIcon = ({ platform, size = "w-5 h-5" }) => {
  const icons = {
    facebook: <img src="/social/Facebook.png" alt="Facebook" className={size} />,
    instagram: <img src="/social/Instagram.png" alt="Instagram" className={size} />,
    linkedin: <img src="/social/LinkedIn.png" alt="LinkedIn" className={size} />,
    x: <img src="/social/X.png" alt="X" className={size} />,
    youtube: <img src="/social/Youtube.png" alt="YouTube" className={size} />,
    whatsapp: <img src="/social/whatsapp.png" alt="WhatsApp" className={size} />,
  };
  return icons[platform] || <div className={`${size} bg-gray-500 rounded`} />;
};

const platformColors = {
  facebook: 'border-blue-500 bg-blue-500/20 text-blue-400',
  instagram: 'border-pink-500 bg-pink-500/20 text-pink-400',
  linkedin: 'border-blue-700 bg-blue-700/20 text-blue-400',
  x: 'border-gray-500 bg-gray-500/20 text-gray-400',
  youtube: 'border-red-500 bg-red-500/20 text-red-400',
  whatsapp: 'border-green-500 bg-green-500/20 text-green-400',
};

// Calendar helper functions
const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();
const getDaysInWeek = (date) => {
  const start = new Date(date);
  start.setDate(start.getDate() - start.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });
};

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Optimal posting times
const optimalTimes = {
  facebook: [9, 12, 15, 18, 20],
  instagram: [6, 9, 12, 18, 21],
  linkedin: [7, 8, 9, 12, 17],
  x: [8, 9, 12, 17, 20],
  youtube: [14, 16, 18, 20, 21],
  whatsapp: [8, 12, 17, 20, 21],
};

// Post Preview Modal
const PostPreviewModal = ({ isOpen, onClose, post, onPublish, onEdit, onDelete, onReschedule }) => {
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [newTime, setNewTime] = useState('');

  if (!isOpen || !post) return null;

  const statusColors = {
    published: 'bg-green-500/20 text-green-400 border-green-500/30',
    scheduled: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    draft: 'bg-gray-700/50 text-gray-400 border-gray-600/30',
    failed: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  const handleReschedule = () => {
    if (newTime) {
      onReschedule(post._id, newTime);
      setShowTimePicker(false);
      setNewTime('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 border border-white/20 rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl">✕</button>

        <div className="flex items-center gap-3 mb-4">
          <div className={`px-3 py-1 rounded-full border text-sm ${statusColors[post.status] || statusColors.draft}`}>
            {post.status}
          </div>
          {post.scheduled_time && (
            <span className="text-gray-400 text-sm">📅 {new Date(post.scheduled_time).toLocaleString()}</span>
          )}
        </div>

        <div className="flex gap-2 mb-4">
          {post.platforms?.map(p => (
            <div key={p} className={`px-2 py-1 rounded-lg border ${platformColors[p]}`}>
              <PlatformIcon platform={p} size="w-4 h-4" />
            </div>
          ))}
        </div>

        <p className="text-white mb-4 whitespace-pre-wrap">{post.content}</p>

        {post.media_url && (
          <div className="mb-4">
            <img src={post.media_url} alt="Media" className="max-h-64 rounded-xl w-full object-cover" />
          </div>
        )}

        {post.status === 'published' && (
          <div className="grid grid-cols-4 gap-3 mb-4 p-3 bg-black/30 rounded-xl">
            <div className="text-center"><p className="text-pink-400 font-bold">{post.likes || 0}</p><p className="text-gray-500 text-xs">Likes</p></div>
            <div className="text-center"><p className="text-blue-400 font-bold">{post.comments || 0}</p><p className="text-gray-500 text-xs">Comments</p></div>
            <div className="text-center"><p className="text-green-400 font-bold">{post.shares || 0}</p><p className="text-gray-500 text-xs">Shares</p></div>
            <div className="text-center"><p className="text-purple-400 font-bold">{post.impressions || 0}</p><p className="text-gray-500 text-xs">Impressions</p></div>
          </div>
        )}

        {post.status === 'scheduled' && (
          <div className="mb-4">
            {showTimePicker ? (
              <div className="flex gap-2">
                <input type="datetime-local" value={newTime} onChange={(e) => setNewTime(e.target.value)} className="flex-1 bg-black/40 border border-white/20 rounded-xl px-3 py-2 text-white text-sm" />
                <button onClick={handleReschedule} className="px-4 py-2 bg-purple-600 text-white rounded-xl text-sm">Save</button>
                <button onClick={() => setShowTimePicker(false)} className="px-4 py-2 bg-gray-600 text-white rounded-xl text-sm">Cancel</button>
              </div>
            ) : (
              <button onClick={() => { setShowTimePicker(true); if (post.scheduled_time) { const d = new Date(post.scheduled_time); setNewTime(d.toISOString().slice(0, 16)); }}} className="w-full py-2 bg-yellow-600/20 text-yellow-400 border border-yellow-600/30 rounded-xl text-sm hover:bg-yellow-600/30">📅 Reschedule</button>
            )}
          </div>
        )}

        <div className="flex gap-3 flex-wrap">
          {(post.status === 'draft' || post.status === 'scheduled') && (
            <button onClick={() => { onPublish(post._id); onClose(); }} className="flex-1 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium hover:from-green-700 hover:to-emerald-700 transition-all">▶ Publish Now</button>
          )}
          {post.status === 'draft' && (
            <button onClick={() => { onEdit(post); onClose(); }} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all">✏️ Edit Draft</button>
          )}
          <button onClick={() => { onDelete(post._id); onClose(); }} className="flex-1 py-2.5 bg-red-600/20 text-red-400 border border-red-600/30 rounded-xl font-medium hover:bg-red-600/30 transition-all">🗑️ Delete</button>
        </div>
      </motion.div>
    </div>
  );
};

// Quick Schedule Modal
const QuickScheduleModal = ({ isOpen, onClose, onSchedule, selectedDate, selectedTime, posts }) => {
  const [selectedPost, setSelectedPost] = useState(null);
  const [scheduledTime, setScheduledTime] = useState('');
  const [scheduling, setScheduling] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState(null);

  useEffect(() => {
    if (selectedDate) {
      const date = new Date(selectedDate);
      date.setHours(selectedTime !== undefined ? selectedTime : 9, 0, 0, 0);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      setScheduledTime(`${year}-${month}-${day}T${hours}:${minutes}`);
    }
  }, [selectedDate, selectedTime]);

  const filteredPosts = useMemo(() => {
    if (!posts) return [];
    let filtered = posts.filter(p => p.status === 'draft');
    if (selectedPlatform) filtered = filtered.filter(p => p.platforms?.includes(selectedPlatform));
    return filtered;
  }, [posts, selectedPlatform]);

  const handleSchedule = async () => {
    if (!selectedPost || !scheduledTime) { toast.error('Please select a post and time'); return; }
    setScheduling(true);
    try { await onSchedule(selectedPost, scheduledTime); toast.success('Post scheduled successfully!'); onClose(); }
    catch (err) { toast.error(err.message || 'Failed to schedule post'); }
    finally { setScheduling(false); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 border border-white/20 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">✕</button>
        
        <h3 className="text-xl font-bold text-white mb-2">Quick Schedule</h3>
        <p className="text-gray-400 text-sm mb-4">Select a draft post for {selectedDate ? new Date(selectedDate).toLocaleDateString() : 'the selected date'}{selectedTime !== undefined && ` at ${selectedTime}:00`}</p>

        <div className="flex gap-2 mb-4 flex-wrap">
          <button onClick={() => setSelectedPlatform(null)} className={`px-3 py-1 rounded-lg text-xs border ${!selectedPlatform ? 'bg-purple-600 border-purple-500 text-white' : 'border-white/20 text-gray-400'}`}>All</button>
          {['facebook', 'instagram', 'linkedin', 'x', 'youtube', 'whatsapp'].map(p => (
            <button key={p} onClick={() => setSelectedPlatform(p)} className={`px-3 py-1 rounded-lg text-xs border capitalize ${selectedPlatform === p ? 'bg-purple-600 border-purple-500 text-white' : 'border-white/20 text-gray-400 hover:border-white/40'}`}>{p}</button>
          ))}
        </div>

        <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
          {filteredPosts.map(post => (
            <div key={post._id} onClick={() => setSelectedPost(post._id)} className={`p-3 rounded-xl border cursor-pointer transition-all ${selectedPost === post._id ? 'border-purple-500 bg-purple-500/20' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}>
              <p className="text-white text-sm truncate">{post.content}</p>
              <div className="flex gap-1 mt-2">{post.platforms?.map(p => <PlatformIcon key={p} platform={p} size="w-4 h-4" />)}</div>
            </div>
          ))}
          {filteredPosts.length === 0 && <p className="text-gray-500 text-center py-4">No draft posts available</p>}
        </div>

        <div className="mb-4">
          <label className="text-gray-400 text-sm block mb-2">Schedule Time</label>
          <input type="datetime-local" value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)} className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none" />
        </div>

        {selectedPost && (
          <div className="mb-4">
            <p className="text-gray-400 text-xs mb-2">Suggested optimal times:</p>
            <div className="flex gap-2 flex-wrap">
              {(selectedPlatform ? optimalTimes[selectedPlatform] : [9, 12, 15, 18, 20]).map(hour => (
                <button key={hour} onClick={() => { const date = new Date(scheduledTime); date.setHours(hour, 0, 0, 0); setScheduledTime(date.toISOString().slice(0, 16)); }} className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-xs hover:bg-green-500/30">{hour}:00</button>
              ))}
            </div>
          </div>
        )}

        <button onClick={handleSchedule} disabled={scheduling || !selectedPost} className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed">{scheduling ? 'Scheduling...' : 'Schedule Post'}</button>
      </motion.div>
    </div>
  );
};

// Main Content Calendar Component
export default function ContentCalendar({ onEditPost }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('week');
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedTime, setSelectedTime] = useState(undefined);
  const [showQuickSchedule, setShowQuickSchedule] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [draggedPost, setDraggedPost] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [calendarStats, setCalendarStats] = useState(null);
  const [filterPlatform, setFilterPlatform] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { accounts } = useSocialAccounts();

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try { const data = await getPosts({ status_filter: 'all' }); setPosts(data.posts || data || []); }
    catch (error) { console.error('Error fetching posts:', error); setPosts([]); }
    finally { setLoading(false); }
  }, []);

  const fetchCalendarStats = useCallback(async () => {
    try { const data = await getAnalyticsSummary(30); setCalendarStats(data); }
    catch (error) { console.error('Error fetching calendar stats:', error); }
  }, []);

  useEffect(() => { fetchPosts(); fetchCalendarStats(); }, [fetchPosts, fetchCalendarStats]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const filteredPosts = useMemo(() => {
    let filtered = posts;
    if (filterPlatform) filtered = filtered.filter(p => p.platforms?.includes(filterPlatform));
    if (searchQuery) filtered = filtered.filter(p => p.content?.toLowerCase().includes(searchQuery.toLowerCase()));
    return filtered;
  }, [posts, filterPlatform, searchQuery]);

  const getPostsForDate = useCallback((date) => {
    const dateStr = date.toDateString();
    return filteredPosts?.filter(post => {
      if (post.status === 'published' && post.created_at) return new Date(post.created_at).toDateString() === dateStr;
      else if (post.scheduled_time) return new Date(post.scheduled_time).toDateString() === dateStr;
      return false;
    }) || [];
  }, [filteredPosts]);

  const stats = useMemo(() => {
    const published = filteredPosts.filter(p => p.status === 'published').length;
    const scheduled = filteredPosts.filter(p => p.status === 'scheduled').length;
    const drafts = filteredPosts.filter(p => p.status === 'draft').length;
    const platforms = {};
    filteredPosts.forEach(p => { p.platforms?.forEach(plat => { platforms[plat] = (platforms[plat] || 0) + 1; }); });
    return { published, scheduled, drafts, platforms };
  }, [filteredPosts]);

  const handlePrev = () => {
    if (view === 'month') setCurrentDate(new Date(year, month - 1, 1));
    else if (view === 'week') { const d = new Date(currentDate); d.setDate(d.getDate() - 7); setCurrentDate(d); }
    else { const d = new Date(currentDate); d.setDate(d.getDate() - 1); setCurrentDate(d); }
  };

  const handleNext = () => {
    if (view === 'month') setCurrentDate(new Date(year, month + 1, 1));
    else if (view === 'week') { const d = new Date(currentDate); d.setDate(d.getDate() + 7); setCurrentDate(d); }
    else { const d = new Date(currentDate); d.setDate(d.getDate() + 1); setCurrentDate(d); }
  };

  const handleToday = () => setCurrentDate(new Date());

  const handleDayClick = (date, hour = undefined) => { setSelectedDay(date); setSelectedTime(hour); setShowQuickSchedule(true); };
  const handlePostClick = (post, e) => { e.stopPropagation(); setSelectedPost(post); };
  const handleDragStart = (post, e) => { setDraggedPost(post); e.dataTransfer.setData('text/plain', post._id); };
  const handleDragOver = (e) => e.preventDefault();

  const handleDrop = async (date, hour, e) => {
    e.preventDefault();
    if (!draggedPost) return;
    const newDate = new Date(date);
    newDate.setHours(hour !== undefined ? hour : 9, 0, 0, 0);
    try { await schedulePost(draggedPost, newDate.toISOString()); toast.success(`Post scheduled for ${newDate.toLocaleDateString()}`); fetchPosts(); }
    catch (err) { toast.error('Failed to schedule post'); }
    setDraggedPost(null);
  };

  const handleSchedulePost = async (postId, scheduledTime) => { await schedulePost(postId, scheduledTime); fetchPosts(); fetchCalendarStats(); };
  const handlePublishPost = async (postId) => { await publishPost(postId); fetchPosts(); fetchCalendarStats(); toast.success('Post published!'); };
  const handleDeletePost = async (postId) => { await deletePost(postId); fetchPosts(); fetchCalendarStats(); toast.success('Post deleted'); };
  const handleEditPost = (post) => { if (onEditPost) onEditPost(post); };
  const handleReschedule = async (postId, newTime) => { await schedulePost(postId, newTime); fetchPosts(); fetchCalendarStats(); toast.success('Post rescheduled!'); };

  // Month View
  const generateMonthView = () => {
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(<div key={`empty-${i}`} className="h-32 bg-black/20 border border-white/5" />);
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayPosts = getPostsForDate(date);
      const isToday = new Date().toDateString() === date.toDateString();
      const isSelected = selectedDay?.toDateString() === date.toDateString();
      const isPast = date < new Date().setHours(0, 0, 0, 0);
      days.push(
        <div key={day} onClick={() => handleDayClick(date)} onDragOver={handleDragOver} onDrop={(e) => handleDrop(date, undefined, e)} className={`h-32 p-2 border border-white/10 cursor-pointer transition-all hover:bg-white/5 ${isToday ? 'bg-purple-500/20' : isPast ? 'bg-black/20' : 'bg-black/40'} ${isSelected ? 'ring-2 ring-purple-500' : ''}`}>
          <div className={`text-sm font-medium mb-1 flex justify-between ${isToday ? 'text-purple-400' : isPast ? 'text-gray-600' : 'text-gray-400'}`}>
            <span>{day}</span>
            {dayPosts.length > 0 && <span className="text-xs text-gray-500">{dayPosts.length}</span>}
          </div>
          <div className="space-y-1 overflow-hidden">
            {dayPosts.slice(0, 4).map((post, idx) => (
              <div key={post._id || idx} draggable onDragStart={(e) => handleDragStart(post, e)} onClick={(e) => handlePostClick(post, e)} className={`text-xs p-1.5 rounded truncate cursor-move hover:scale-105 transition-transform ${post.status === 'published' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : post.status === 'scheduled' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'}`}>
                <span className="flex items-center gap-1">{post.platforms?.slice(0, 2).map(p => <PlatformIcon key={p} platform={p} size="w-3 h-3" />)}{post.content?.substring(0, 15)}...</span>
              </div>
            ))}
            {dayPosts.length > 4 && <div className="text-xs text-gray-500 text-center">+{dayPosts.length - 4} more</div>}
          </div>
        </div>
      );
    }
    return days;
  };

  // Week View - exactly like month view (just day cells)
  const generateWeekView = () => {
    const weekDays = getDaysInWeek(currentDate);
    return weekDays.map((date, idx) => {
      const isToday = new Date().toDateString() === date.toDateString();
      const dayPosts = getPostsForDate(date);
      const isPast = date < new Date().setHours(0, 0, 0, 0);
      return (
        <div key={idx} onClick={() => handleDayClick(date)} onDragOver={handleDragOver} onDrop={(e) => handleDrop(date, undefined, e)} className={`h-32 p-2 border border-white/10 cursor-pointer transition-all hover:bg-white/5 ${isToday ? 'bg-purple-500/20' : isPast ? 'bg-black/20' : 'bg-black/40'}`}>
          <div className={`text-sm font-medium mb-1 ${isToday ? 'text-purple-400' : isPast ? 'text-gray-600' : 'text-gray-400'}`}>{date.getDate()}</div>
          <div className="space-y-1 overflow-hidden">
            {dayPosts.slice(0, 3).map((post, pidx) => (
              <div key={post._id || pidx} draggable onDragStart={(e) => handleDragStart(post, e)} onClick={(e) => handlePostClick(post, e)} className={`text-xs p-1.5 rounded truncate cursor-move hover:scale-105 transition-transform ${post.status === 'published' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : post.status === 'scheduled' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'}`}>
                <span className="flex items-center gap-1">{post.platforms?.slice(0, 2).map(p => <PlatformIcon key={p} platform={p} size="w-3 h-3" />)}{post.content?.substring(0, 12)}...</span>
              </div>
            ))}
            {dayPosts.length > 3 && <div className="text-xs text-gray-500 text-center">+{dayPosts.length - 3} more</div>}
          </div>
        </div>
      );
    });
  };

  // Day View - like month view (single day takes full 7 columns)
  const generateDayView = () => {
    const dayPosts = getPostsForDate(currentDate);
    const isToday = new Date().toDateString() === currentDate.toDateString();
    const isPast = currentDate < new Date().setHours(0, 0, 0, 0);
    // For day view, we use all 7 columns for the single day
    return (
      <div className="col-span-7 grid grid-cols-7 h-96">
        <div onClick={() => handleDayClick(currentDate)} className="col-span-7 h-full p-4 border border-white/10 cursor-pointer transition-all hover:bg-white/5 bg-black">
          <div className={`text-lg font-medium mb-3 ${isPast ? 'text-gray-600' : 'text-gray-400'}`}>
            {DAYS[currentDate.getDay()]}, {MONTHS[currentDate.getMonth()]} {currentDate.getDate()}, {year}
          </div>
          {dayPosts.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {dayPosts.map((post, idx) => (
                <div key={post._id || idx} draggable onDragStart={(e) => handleDragStart(post, e)} onClick={(e) => handlePostClick(post, e)} className={`p-4 rounded-xl cursor-move ${post.status === 'published' ? 'bg-green-500/20 border border-green-500/30' : post.status === 'scheduled' ? 'bg-yellow-500/20 border border-yellow-500/30' : 'bg-gray-500/20 border border-gray-500/30'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">{post.platforms?.map(p => <PlatformIcon key={p} platform={p} size="w-5 h-5" />)}</div>
                    <span className={`text-xs px-2 py-1 rounded-full ${post.status === 'published' ? 'bg-green-500/30 text-green-300' : post.status === 'scheduled' ? 'bg-yellow-500/30 text-yellow-300' : 'bg-gray-500/30 text-gray-300'}`}>{post.status}</span>
                  </div>
                  <p className="text-white">{post.content}</p>
                  {post.media_url && <img src={post.media_url} alt="Media" className="mt-3 h-24 w-auto rounded-lg object-cover" />}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500 text-lg">No posts for this day - click to add</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const upcomingPosts = filteredPosts.filter(p => p.status === 'scheduled' && p.scheduled_time).sort((a, b) => new Date(a.scheduled_time) - new Date(b.scheduled_time)).slice(0, 5);
  const draftPosts = filteredPosts.filter(p => p.status === 'draft');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">📅 Content Calendar</h2>
          <p className="text-gray-400 text-sm">Drag and drop posts to reschedule • Click any day to schedule</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <input type="text" placeholder="Search posts..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 pr-4 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-sm focus:border-purple-500 focus:outline-none w-48" />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
          </div>
          <select value={filterPlatform || ''} onChange={(e) => setFilterPlatform(e.target.value || null)} className="px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white text-sm focus:border-purple-500 focus:outline-none">
            <option value="">All Platforms</option>
            {Object.keys(platformColors).map(p => <option key={p} value={p} className="capitalize">{p}</option>)}
          </select>
          <div className="bg-black/40 border border-white/10 rounded-xl p-1 flex">
            {['month', 'week', 'day'].map(v => (
              <button key={v} onClick={() => setView(v)} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${view === v ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}>{v}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-500/20 to-green-500/5 border border-green-500/20 rounded-xl p-4"><p className="text-green-400 text-2xl font-bold">{stats.published}</p><p className="text-gray-400 text-sm">Published</p></div>
        <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-500/5 border border-yellow-500/20 rounded-xl p-4"><p className="text-yellow-400 text-2xl font-bold">{stats.scheduled}</p><p className="text-gray-400 text-sm">Scheduled</p></div>
        <div className="bg-gradient-to-br from-gray-500/20 to-gray-500/5 border border-gray-500/20 rounded-xl p-4"><p className="text-gray-300 text-2xl font-bold">{stats.drafts}</p><p className="text-gray-400 text-sm">Drafts</p></div>
        <div className="bg-gradient-to-br from-purple-500/20 to-purple-500/5 border border-purple-500/20 rounded-xl p-4"><p className="text-purple-400 text-2xl font-bold">{filteredPosts.length}</p><p className="text-gray-400 text-sm">Total Posts</p></div>
      </div>

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button onClick={handlePrev} className="p-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-white">←</button>
          <button onClick={handleToday} className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all text-sm font-medium">Today</button>
          <button onClick={handleNext} className="p-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-white">→</button>
        </div>
        <h3 className="text-xl font-bold text-white">
          {view === 'month' && `${MONTHS[month]} ${year}`}
          {view === 'week' && `Week of ${getDaysInWeek(currentDate)[0].toLocaleDateString()}`}
          {view === 'day' && `${MONTHS[month]} ${currentDate.getDate()}, ${year}`}
        </h3>
        <div className="w-24" />
      </div>

      {/* Calendar Grid */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        {view === 'month' && <div className="grid grid-cols-7 bg-black/40">{DAYS_SHORT.map(day => <div key={day} className="p-3 text-center text-sm font-medium text-gray-400 border-b border-white/10">{day}</div>)}</div>}
        {view === 'week' && <div className="grid grid-cols-7 bg-black/40">{DAYS_SHORT.map(day => <div key={day} className="p-3 text-center text-sm font-medium text-gray-400 border-b border-white/10">{day}</div>)}</div>}
        {loading ? <div className="p-8 text-center text-gray-400">Loading calendar...</div> : (
          <div className="grid grid-cols-7">
            {view === 'month' && generateMonthView()}
            {view === 'week' && generateWeekView()}
            {view === 'day' && generateDayView()}
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <h3 className="text-lg font-bold text-white mb-4">📅 Upcoming Posts</h3>
          {upcomingPosts.length > 0 ? (
            <div className="space-y-3">
              {upcomingPosts.map(post => (
                <div key={post._id} onClick={() => setSelectedPost(post)} className="p-3 bg-black/40 border border-white/10 rounded-xl cursor-pointer hover:border-white/20 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex gap-1">{post.platforms?.map(p => <PlatformIcon key={p} platform={p} size="w-4 h-4" />)}</div>
                    <span className="text-yellow-400 text-xs">{new Date(post.scheduled_time).toLocaleDateString()} at {new Date(post.scheduled_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-gray-300 text-sm truncate">{post.content}</p>
                </div>
              ))}
            </div>
          ) : <p className="text-gray-500 text-center py-4">No upcoming posts scheduled</p>}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <h3 className="text-lg font-bold text-white mb-4">📝 Draft Posts</h3>
          {draftPosts.length > 0 ? (
            <div className="space-y-3">
              {draftPosts.map(post => (
                <div key={post._id} draggable onDragStart={(e) => handleDragStart(post, e)} onClick={() => setSelectedPost(post)} className="p-3 bg-black/40 border border-white/10 rounded-xl cursor-move hover:border-white/20 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex gap-1">{post.platforms?.map(p => <PlatformIcon key={p} platform={p} size="w-4 h-4" />)}</div>
                    <span className="text-gray-500 text-xs">Drag to calendar</span>
                  </div>
                  <p className="text-gray-300 text-sm truncate">{post.content}</p>
                </div>
              ))}
            </div>
          ) : <p className="text-gray-500 text-center py-4">No draft posts</p>}
        </div>
      </div>

      {/* Platform Stats */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
        <h3 className="text-lg font-bold text-white mb-4">📊 Posts by Platform</h3>
        <div className="flex flex-wrap gap-4">
          {Object.entries(stats.platforms).map(([platform, count]) => (
            <div key={platform} className={`px-4 py-2 rounded-xl border ${platformColors[platform]}`}><div className="flex items-center gap-2"><PlatformIcon platform={platform} size="w-5 h-5" /><span className="text-white font-medium">{count}</span></div></div>
          ))}
          {Object.keys(stats.platforms).length === 0 && <p className="text-gray-500">No posts yet</p>}
        </div>
      </div>

      <QuickScheduleModal isOpen={showQuickSchedule} onClose={() => setShowQuickSchedule(false)} onSchedule={handleSchedulePost} selectedDate={selectedDay} selectedTime={selectedTime} posts={posts} />
      <PostPreviewModal isOpen={!!selectedPost} onClose={() => setSelectedPost(null)} post={selectedPost} onPublish={handlePublishPost} onEdit={handleEditPost} onDelete={handleDeletePost} onReschedule={handleReschedule} />
    </div>
  );
}
