"use client";

import React, { useState, useEffect, useCallback } from 'react';
import * as api from '@/lib/dynamic-automation-api';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

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

// Quick Reply Modal
const QuickReplyModal = ({ isOpen, onClose, onSend, engagement, sending }) => {
  const [reply, setReply] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  useEffect(() => {
    if (!isOpen) setReply('');
  }, [isOpen]);

  const handleSend = async () => {
    if (!reply.trim()) {
      toast.error('Please enter a reply');
      return;
    }
    setSendingReply(true);
    try {
      await onSend(engagement._id, reply);
      toast.success('Reply sent!');
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to send reply');
    } finally {
      setSendingReply(false);
    }
  };

  if (!isOpen) return null;

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

        <h3 className="text-xl font-bold text-white mb-4">Quick Reply</h3>
        
        {/* Original Message */}
        <div className="bg-black/40 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <PlatformIcon platform={engagement?.platform} size="w-5 h-5" />
            <span className="text-gray-400 text-sm">From {engagement?.user?.name || engagement?.user?.username}</span>
          </div>
          <p className="text-white">{engagement?.content}</p>
        </div>

        {/* Reply Input */}
        <textarea
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder="Type your reply..."
          rows={4}
          className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none resize-none mb-4"
        />

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={sendingReply || !reply.trim()}
            className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50"
          >
            {sendingReply ? 'Sending...' : 'Send Reply'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// Engagement Detail Modal
const EngagementDetailModal = ({ isOpen, onClose, engagement, onReply, onMarkRead, onArchive }) => {
  if (!isOpen || !engagement) return null;

  const typeIcons = {
    comment: '💬',
    message: '💌',
    mention: '@',
    reaction: '❤️',
  };

  const statusColors = {
    unread: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    read: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    replied: 'bg-green-500/20 text-green-400 border-green-500/30',
    archived: 'bg-gray-700/50 text-gray-400 border-gray-600/30',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 border border-white/20 rounded-2xl p-6 w-full max-w-xl shadow-2xl"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          ✕
        </button>

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full ${platformColors[engagement.platform]} flex items-center justify-center text-2xl`}>
              <PlatformIcon platform={engagement.platform} size="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{engagement.user?.name || engagement.user?.username}</h3>
              <p className="text-gray-400 text-sm">@{engagement.user?.username}</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full border text-sm ${statusColors[engagement.status] || statusColors.unread}`}>
            {engagement.status || 'unread'}
          </span>
        </div>

        {/* Type & Time */}
        <div className="flex items-center gap-4 mb-4 text-sm">
          <span className="text-gray-400">
            {typeIcons[engagement.type]} {engagement.type}
          </span>
          <span className="text-gray-500">
            {new Date(engagement.created_at).toLocaleString()}
          </span>
        </div>

        {/* Content */}
        <div className="bg-black/40 rounded-xl p-4 mb-4">
          <p className="text-white whitespace-pre-wrap">{engagement.content}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => { onReply(engagement); onClose(); }}
            className="flex-1 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all"
          >
            💬 Reply
          </button>
          {engagement.status !== 'read' && (
            <button
              onClick={() => { onMarkRead(engagement._id); onClose(); }}
              className="flex-1 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all"
            >
              ✓ Mark Read
            </button>
          )}
          <button
            onClick={() => { onArchive(engagement._id); onClose(); }}
            className="flex-1 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all"
          >
            📦 Archive
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// Main Engagement Hub Component
export default function EngagementHub() {
  const [activeTab, setActiveTab] = useState('all'); // all, comments, messages, mentions
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [engagements, setEngagements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEngagement, setSelectedEngagement] = useState(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    comments: 0,
    messages: 0,
    mentions: 0,
  });

  // Fetch engagement data from API
  const fetchEngagement = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const options = {
        limit: 100,
      };
      
      if (activeTab === 'comments') options.type = 'comment';
      else if (activeTab === 'messages') options.type = 'message';
      else if (activeTab === 'mentions') options.type = 'mention';
      
      if (selectedPlatform !== 'all') options.platform = selectedPlatform;

      const result = await api.getEngagement(options);
      
      if (result.engagements) {
        setEngagements(result.engagements);
        
        // Calculate stats
        const allEngagements = result.engagements;
        setStats({
          total: allEngagements.length,
          unread: allEngagements.filter(e => e.status === 'unread').length,
          comments: allEngagements.filter(e => e.type === 'comment').length,
          messages: allEngagements.filter(e => e.type === 'message').length,
          mentions: allEngagements.filter(e => e.type === 'mention').length,
        });
      } else {
        setEngagements([]);
      }
    } catch (err) {
      console.error('Failed to fetch engagement:', err);
      setError(err.message);
      // Use empty array on error
      setEngagements([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, selectedPlatform]);

  // Fetch on mount and when filters change
  useEffect(() => {
    fetchEngagement();
  }, [fetchEngagement]);

  const handleReply = (engagement) => {
    setSelectedEngagement(engagement);
    setShowReplyModal(true);
  };

  const handleSendReply = async (engagementId, reply) => {
    await api.replyToEngagement(engagementId, reply);
    // Update local state
    setEngagements(prev => prev.map(e => 
      e._id === engagementId ? { ...e, status: 'replied', reply } : e
    ));
    // Update stats
    setStats(prev => ({
      ...prev,
      unread: prev.unread > 0 ? prev.unread - 1 : 0,
    }));
    toast.success('Reply sent!');
  };

  const handleMarkRead = async (engagementId) => {
    await api.markEngagementRead(engagementId);
    setEngagements(prev => prev.map(e => 
      e._id === engagementId ? { ...e, status: 'read' } : e
    ));
    setStats(prev => ({
      ...prev,
      unread: prev.unread > 0 ? prev.unread - 1 : 0,
    }));
  };

  const handleArchive = async (engagementId) => {
    await api.archiveEngagement(engagementId);
    setEngagements(prev => prev.filter(e => e._id !== engagementId));
    setStats(prev => ({
      ...prev,
      total: prev.total - 1,
    }));
    toast.success('Engagement archived');
  };

  // Filter engagements by search
  const filteredEngagements = engagements.filter(e => {
    const matchesSearch = !searchQuery || 
      e.user?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.content?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const typeIcons = {
    comment: '💬',
    message: '💌',
    mention: '@',
  };

  const typeLabels = {
    comment: 'Comments',
    message: 'Messages',
    mention: 'Mentions',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Engagement Hub</h2>
          <p className="text-gray-400 text-sm">Manage comments, messages, and mentions</p>
        </div>

        {/* Search and Refresh */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search engagements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full lg:w-64 bg-black/40 border border-white/20 rounded-xl pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
          </div>
          <button
            onClick={fetchEngagement}
            disabled={loading}
            className="px-4 py-2 bg-white/10 text-gray-300 rounded-xl hover:bg-white/20 transition-all disabled:opacity-50"
          >
            {loading ? '↻' : '↻'} Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="text-2xl font-bold text-white">{stats.total}</div>
          <div className="text-sm text-gray-400">Total</div>
        </div>
        <div className="bg-purple-500/20 border border-purple-500/30 rounded-xl p-4">
          <div className="text-2xl font-bold text-purple-400">{stats.unread}</div>
          <div className="text-sm text-purple-300">Unread</div>
        </div>
        <div className="bg-pink-500/20 border border-pink-500/30 rounded-xl p-4">
          <div className="text-2xl font-bold text-pink-400">{stats.comments}</div>
          <div className="text-sm text-pink-300">Comments</div>
        </div>
        <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-4">
          <div className="text-2xl font-bold text-blue-400">{stats.messages}</div>
          <div className="text-sm text-blue-300">Messages</div>
        </div>
        <div className="bg-cyan-500/20 border border-cyan-500/30 rounded-xl p-4">
          <div className="text-2xl font-bold text-cyan-400">{stats.mentions}</div>
          <div className="text-sm text-cyan-300">Mentions</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Type Tabs */}
        <div className="bg-black/40 border border-white/10 rounded-xl p-1 flex flex-wrap">
          {['all', 'comments', 'messages', 'mentions'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                activeTab === tab 
                  ? 'bg-purple-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab !== 'all' && <span>{typeIcons[tab.replace('s', '')]}</span>}
              {tab === 'all' ? 'All' : typeLabels[tab.replace('s', '')]}
            </button>
          ))}
        </div>

        {/* Platform Filter */}
        <div className="bg-black/40 border border-white/10 rounded-xl p-1 flex flex-wrap">
          <button
            onClick={() => setSelectedPlatform('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedPlatform === 'all' 
                ? 'bg-white text-black' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            All Platforms
          </button>
          {['facebook', 'instagram', 'linkedin', 'x'].map(platform => (
            <button
              key={platform}
              onClick={() => setSelectedPlatform(platform)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedPlatform === platform 
                  ? 'bg-white text-black' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <PlatformIcon platform={platform} size="w-4 h-4" />
            </button>
          ))}
        </div>
      </div>

      {/* Engagement List */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-3 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">⚠️</div>
            <p className="text-gray-400">{error}</p>
            <button
              onClick={fetchEngagement}
              className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-xl"
            >
              Try Again
            </button>
          </div>
        ) : filteredEngagements.length > 0 ? (
          filteredEngagements.map(engagement => (
            <motion.div
              key={engagement._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setSelectedEngagement(engagement)}
              className={`p-4 bg-white/5 border rounded-2xl cursor-pointer transition-all hover:scale-[1.01] ${
                engagement.status === 'unread' 
                  ? 'border-purple-500/30 bg-purple-500/5' 
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Platform Icon */}
                <div className={`w-12 h-12 rounded-xl ${platformColors[engagement.platform]} flex items-center justify-center shrink-0`}>
                  <PlatformIcon platform={engagement.platform} size="w-6 h-6" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">{engagement.user?.name}</span>
                      <span className="text-gray-500">@{engagement.user?.username}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {engagement.status === 'unread' && (
                        <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                      )}
                      <span className="text-gray-500 text-sm">
                        {engagement.created_at ? new Date(engagement.created_at).toLocaleString() : 'Unknown'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-gray-400 text-sm">{typeIcons[engagement.type]}</span>
                    <span className="text-gray-500 text-sm capitalize">{engagement.type}</span>
                  </div>

                  <p className="text-gray-300 line-clamp-2">{engagement.content}</p>
                </div>

                {/* Quick Actions */}
                <div className="flex flex-col gap-2 shrink-0">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleReply(engagement); }}
                    className="px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-all"
                  >
                    Reply
                  </button>
                  {engagement.status !== 'read' && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleMarkRead(engagement._id); }}
                      className="px-3 py-1.5 bg-white/10 text-gray-400 text-sm rounded-lg hover:bg-white/20 transition-all"
                    >
                      Mark Read
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📭</div>
            <p className="text-gray-400">No engagements found</p>
          </div>
        )}
      </div>

      {/* Modals */}
      <EngagementDetailModal
        isOpen={!!selectedEngagement && !showReplyModal}
        onClose={() => setSelectedEngagement(null)}
        engagement={selectedEngagement}
        onReply={handleReply}
        onMarkRead={handleMarkRead}
        onArchive={handleArchive}
      />

      <QuickReplyModal
        isOpen={showReplyModal}
        onClose={() => setShowReplyModal(false)}
        onSend={handleSendReply}
        engagement={selectedEngagement}
      />
    </div>
  );
}
