"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useAutomation, useSocialAccounts } from '@/components/hooks/useAutomation';
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

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Quick Schedule Modal
const QuickScheduleModal = ({ isOpen, onClose, onSchedule, selectedDate, posts }) => {
  const [selectedPost, setSelectedPost] = useState(null);
  const [scheduledTime, setScheduledTime] = useState('');
  const [scheduling, setScheduling] = useState(false);

  useEffect(() => {
    if (selectedDate) {
      const date = new Date(selectedDate);
      date.setHours(9, 0, 0, 0);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      setScheduledTime(`${year}-${month}-${day}T${hours}:${minutes}`);
    }
  }, [selectedDate]);

  const handleSchedule = async () => {
    if (!selectedPost || !scheduledTime) {
      toast.error('Please select a post and time');
      return;
    }
    setScheduling(true);
    try {
      await onSchedule(selectedPost, scheduledTime);
      toast.success('Post scheduled successfully!');
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to schedule post');
    } finally {
      setScheduling(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 border border-white/20 rounded-2xl p-6 w-full max-w-md shadow-2xl"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          ✕
        </button>
        
        <h3 className="text-xl font-bold text-white mb-4">Quick Schedule</h3>
        <p className="text-gray-400 text-sm mb-4">
          Select a draft post to schedule for {selectedDate ? new Date(selectedDate).toLocaleDateString() : ''}
        </p>

        <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
          {posts?.filter(p => p.status === 'draft').map(post => (
            <div
              key={post._id}
              onClick={() => setSelectedPost(post._id)}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                selectedPost === post._id 
                  ? 'border-purple-500 bg-purple-500/20' 
                  : 'border-white/10 bg-white/5 hover:bg-white/10'
              }`}
            >
              <p className="text-white text-sm truncate">{post.content}</p>
              <div className="flex gap-1 mt-2">
                {post.platforms?.map(p => (
                  <PlatformIcon key={p} platform={p} size="w-4 h-4" />
                ))}
              </div>
            </div>
          ))}
          {(!posts || posts.filter(p => p.status === 'draft').length === 0) && (
            <p className="text-gray-500 text-center py-4">No draft posts available</p>
          )}
        </div>

        <div className="mb-4">
          <label className="text-gray-400 text-sm block mb-2">Schedule Time</label>
          <input
            type="datetime-local"
            value={scheduledTime}
            onChange={(e) => setScheduledTime(e.target.value)}
            className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
          />
        </div>

        <button
          onClick={handleSchedule}
          disabled={scheduling || !selectedPost}
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {scheduling ? 'Scheduling...' : 'Schedule Post'}
        </button>
      </motion.div>
    </div>
  );
};

// Post Detail Modal
const PostDetailModal = ({ isOpen, onClose, post, onPublish, onDelete }) => {
  if (!isOpen || !post) return null;

  const statusColors = {
    published: 'bg-green-500/20 text-green-400 border-green-500/30',
    scheduled: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    draft: 'bg-gray-700/50 text-gray-400 border-gray-600/30',
    failed: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 border border-white/20 rounded-2xl p-6 w-full max-w-lg shadow-2xl"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          ✕
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className={`px-3 py-1 rounded-full border text-sm ${statusColors[post.status] || statusColors.draft}`}>
            {post.status}
          </div>
          {post.scheduled_time && (
            <span className="text-gray-400 text-sm">
              📅 {new Date(post.scheduled_time).toLocaleString()}
            </span>
          )}
        </div>

        <div className="flex gap-2 mb-4">
          {post.platforms?.map(p => (
            <div key={p} className={`px-2 py-1 rounded-lg border ${platformColors[p]}`}>
              <PlatformIcon platform={p} size="w-4 h-4" />
            </div>
          ))}
        </div>

        <p className="text-white mb-6">{post.content}</p>

        {post.media_url && (
          <div className="mb-4">
            <img src={post.media_url} alt="Media" className="max-h-48 rounded-xl" />
          </div>
        )}

        <div className="flex gap-3">
          {(post.status === 'draft' || post.status === 'scheduled') && (
            <button
              onClick={() => { onPublish(post._id); onClose(); }}
              className="flex-1 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all"
            >
              Publish Now
            </button>
          )}
          <button
            onClick={() => { onDelete(post._id); onClose(); }}
            className="flex-1 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all"
          >
            Delete
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// Main Content Calendar Component
export default function ContentCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month'); // month, week, day
  const [selectedDay, setSelectedDay] = useState(null);
  const [showQuickSchedule, setShowQuickSchedule] = useState(false);
  const [selectedPostForSchedule, setSelectedPostForSchedule] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [draggedPost, setDraggedPost] = useState(null);

  const { posts, loading, getPosts, publishPost, deletePost, schedulePost } = useAutomation();
  const { accounts } = useSocialAccounts();

  // Fetch posts on mount
  useEffect(() => {
    getPosts({ status_filter: 'all' });
  }, [getPosts]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  // Group posts by date
  const getPostsForDate = useCallback((day) => {
    return posts?.filter(post => {
      if (post.status === 'published') {
        const postDate = new Date(post.created_at).toDateString();
        return postDate === new Date(year, month, day).toDateString();
      } else if (post.scheduled_time) {
        const scheduleDate = new Date(post.scheduled_time).toDateString();
        return scheduleDate === new Date(year, month, day).toDateString();
      }
      return false;
    }) || [];
  }, [posts, year, month]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleDayClick = (day) => {
    setSelectedDay(new Date(year, month, day));
    setShowQuickSchedule(true);
  };

  const handlePostClick = (post, e) => {
    e.stopPropagation();
    setSelectedPost(post);
  };

  const handleDragStart = (post, e) => {
    setDraggedPost(post);
    e.dataTransfer.setData('text/plain', post._id);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (day, e) => {
    e.preventDefault();
    if (!draggedPost) return;

    const newDate = new Date(year, month, day);
    newDate.setHours(9, 0, 0, 0);
    
    try {
      await schedulePost(draggedPost, newDate.toISOString());
      toast.success(`Post rescheduled to ${newDate.toLocaleDateString()}`);
      getPosts({ status_filter: 'all' });
    } catch (err) {
      toast.error('Failed to reschedule post');
    }
    
    setDraggedPost(null);
  };

  const handleSchedulePost = async (postId, scheduledTime) => {
    await schedulePost(postId, scheduledTime);
    getPosts({ status_filter: 'all' });
  };

  const handlePublishPost = async (postId) => {
    await publishPost(postId);
    getPosts({ status_filter: 'all' });
    toast.success('Post published!');
  };

  const handleDeletePost = async (postId) => {
    await deletePost(postId);
    getPosts({ status_filter: 'all' });
    toast.success('Post deleted');
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const days = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 bg-black/20 border border-white/5" />);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayPosts = getPostsForDate(day);
      const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
      const isSelected = selectedDay?.getDate() === day;

      days.push(
        <div
          key={day}
          onClick={() => handleDayClick(day)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(day, e)}
          className={`h-24 p-1 border border-white/10 cursor-pointer transition-all hover:bg-white/5 ${
            isToday ? 'bg-purple-500/20' : 'bg-black/40'
          } ${isSelected ? 'ring-2 ring-purple-500' : ''}`}
        >
          <div className={`text-sm font-medium mb-1 ${
            isToday ? 'text-purple-400' : 'text-gray-400'
          }`}>
            {day}
          </div>
          <div className="space-y-1 overflow-hidden">
            {dayPosts.slice(0, 3).map((post, idx) => (
              <div
                key={post._id || idx}
                draggable
                onDragStart={(e) => handleDragStart(post, e)}
                onClick={(e) => handlePostClick(post, e)}
                className={`text-xs p-1 rounded truncate cursor-move hover:scale-105 transition-transform ${
                  post.status === 'published' 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : post.status === 'scheduled'
                    ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                    : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                }`}
              >
                <span className="flex items-center gap-1">
                  {post.platforms?.slice(0, 2).map(p => (
                    <PlatformIcon key={p} platform={p} size="w-3 h-3" />
                  ))}
                  {post.content?.substring(0, 15)}...
                </span>
              </div>
            ))}
            {dayPosts.length > 3 && (
              <div className="text-xs text-gray-500 text-center">
                +{dayPosts.length - 3} more
              </div>
            )}
          </div>
        </div>
      );
    }
    
    return days;
  };

  // Upcoming posts (scheduled)
  const upcomingPosts = posts?.filter(p => p.status === 'scheduled' && p.scheduled_time)
    .sort((a, b) => new Date(a.scheduled_time) - new Date(b.scheduled_time))
    .slice(0, 5) || [];

  // Draft posts
  const draftPosts = posts?.filter(p => p.status === 'draft') || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Content Calendar</h2>
          <p className="text-gray-400 text-sm">Drag and drop to reschedule posts</p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="bg-black/40 border border-white/10 rounded-xl p-1 flex">
            {['month', 'week', 'day'].map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${
                  view === v 
                    ? 'bg-purple-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrevMonth}
          className="p-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all"
        >
          ←
        </button>
        <h3 className="text-xl font-bold text-white">
          {MONTHS[month]} {year}
        </h3>
        <button
          onClick={handleNextMonth}
          className="p-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all"
        >
          →
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        {/* Day Headers */}
        <div className="grid grid-cols-7 bg-black/40">
          {DAYS.map(day => (
            <div key={day} className="p-3 text-center text-sm font-medium text-gray-400 border-b border-white/10">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {generateCalendarDays()}
        </div>
      </div>

      {/* Sidebar - Upcoming & Drafts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Posts */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <h3 className="text-lg font-bold text-white mb-4">📅 Upcoming Posts</h3>
          {upcomingPosts.length > 0 ? (
            <div className="space-y-3">
              {upcomingPosts.map(post => (
                <div
                  key={post._id}
                  onClick={() => setSelectedPost(post)}
                  className="p-3 bg-black/40 border border-white/10 rounded-xl cursor-pointer hover:border-white/20 transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex gap-1">
                      {post.platforms?.map(p => (
                        <PlatformIcon key={p} platform={p} size="w-4 h-4" />
                      ))}
                    </div>
                    <span className="text-yellow-400 text-xs">
                      {new Date(post.scheduled_time).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm truncate">{post.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No upcoming posts scheduled</p>
          )}
        </div>

        {/* Draft Posts */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <h3 className="text-lg font-bold text-white mb-4">📝 Draft Posts</h3>
          {draftPosts.length > 0 ? (
            <div className="space-y-3">
              {draftPosts.map(post => (
                <div
                  key={post._id}
                  draggable
                  onDragStart={(e) => handleDragStart(post, e)}
                  onClick={() => setSelectedPost(post)}
                  className="p-3 bg-black/40 border border-white/10 rounded-xl cursor-move hover:border-white/20 transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex gap-1">
                      {post.platforms?.map(p => (
                        <PlatformIcon key={p} platform={p} size="w-4 h-4" />
                      ))}
                    </div>
                    <span className="text-gray-500 text-xs">Drag to calendar</span>
                  </div>
                  <p className="text-gray-300 text-sm truncate">{post.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No draft posts</p>
          )}
        </div>
      </div>

      {/* Modals */}
      <QuickScheduleModal
        isOpen={showQuickSchedule}
        onClose={() => setShowQuickSchedule(false)}
        onSchedule={handleSchedulePost}
        selectedDate={selectedDay}
        posts={posts}
      />

      <PostDetailModal
        isOpen={!!selectedPost}
        onClose={() => setSelectedPost(null)}
        post={selectedPost}
        onPublish={handlePublishPost}
        onDelete={handleDeletePost}
      />
    </div>
  );
}
