"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useAutomation, useSocialAccounts, useAutomationRules, useAnalytics, useAIGeneration, useAuth } from '@/components/hooks/useAutomation';
import ConnectAccountModal from './ConnectAccountModal';
import AuthModal from './AuthModal';
import CreateRuleModal from './CreateRuleModal';
import PostCreator from './PostCreator';
import { toast } from 'react-toastify';

// Platform icons with colors
const PlatformIcon = ({ platform, size = "w-8 h-8" }) => {
  const icons = {
    facebook: { icon: (
      <svg className={size} fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ), color: 'text-blue-500' },
    instagram: { icon: (
      <svg className={size} fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    ), color: 'text-pink-500' },
    linkedin: { icon: (
      <svg className={size} fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ), color: 'text-blue-600' },
    x: { icon: (
      <svg className={size} fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ), color: 'text-gray-300' },
    youtube: { icon: (
      <svg className={size} fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    ), color: 'text-red-500' },
    whatsapp: { icon: (
      <svg className={size} fill="currentColor" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085-.719 2 1.758.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    ), color: 'text-green-500' },
  };
  
  const data = icons[platform] || { icon: <div className={`${size} bg-gray-500 rounded`} />, color: 'text-gray-400' };
  return <span className={data.color}>{data.icon}</span>;
};

// Stats Card Component
const StatCard = ({ title, value, icon, gradient, trend, trendValue }) => (
  <div className={`relative overflow-hidden bg-gradient-to-br ${gradient} bg-opacity-20 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:scale-[1.02] transition-transform duration-300`}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-gray-400 text-sm font-medium mb-1">{title}</p>
        <p className="text-3xl font-bold text-white">{value}</p>
        {trend && (
          <p className={`text-sm mt-2 flex items-center gap-1 ${trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
            {trend === 'up' ? '↑' : '↓'} {trendValue}
          </p>
        )}
      </div>
      <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-2xl">
        {icon}
      </div>
    </div>
    <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-white/5 rounded-full blur-xl" />
  </div>
);

// Platform Account Card
const AccountCard = ({ account, onDisconnect }) => {
  const platformColors = {
    facebook: 'from-blue-600 to-blue-700',
    instagram: 'from-pink-600 to-purple-600',
    linkedin: 'from-blue-700 to-blue-800',
    x: 'from-gray-700 to-gray-900',
    youtube: 'from-red-600 to-red-700',
    whatsapp: 'from-green-500 to-green-600',
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all group">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${platformColors[account.platform] || 'from-gray-600 to-gray-700'} flex items-center justify-center text-white`}>
            <PlatformIcon platform={account.platform} size="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-white capitalize">{account.platform}</h3>
            <p className="text-xs text-gray-400">{account.platform_username || 'Connected'}</p>
          </div>
        </div>
        <span className="flex items-center gap-1.5 text-green-400 text-sm">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
          Active
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">Connected {account.created_at ? new Date(account.created_at).toLocaleDateString() : 'recently'}</span>
        <button
          onClick={() => onDisconnect(account.platform)}
          className="text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100"
        >
          Disconnect
        </button>
      </div>
    </div>
  );
};

// Post Card Component
const PostCard = ({ post, onDelete, onPublish }) => {
  const [timeRemaining, setTimeRemaining] = useState('');
  
  const statusColors = {
    published: 'bg-green-500/20 text-green-400 border-green-500/30',
    scheduled: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    draft: 'bg-gray-700/50 text-gray-400 border-gray-600/30',
    failed: 'bg-red-500/20 text-red-400 border-red-500/30',
  };
  
  const statusIcons = {
    published: '✅',
    scheduled: '⏰',
    draft: '📝',
    failed: '❌',
  };
  
  // Calculate time remaining for scheduled posts
  useEffect(() => {
    if (post.status !== 'scheduled' || !post.scheduled_time) {
      setTimeRemaining('');
      return;
    }
    
    const calculateTimeRemaining = () => {
      const now = new Date();
      const scheduled = new Date(post.scheduled_time);
      const diff = scheduled - now;
      
      if (diff <= 0) {
        setTimeRemaining('Publishing...');
        return;
      }
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      if (days > 0) {
        setTimeRemaining(`${days}d ${hours}h`);
      } else if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m`);
      } else if (minutes > 0) {
        setTimeRemaining(`${minutes}m ${seconds}s`);
      } else {
        setTimeRemaining(`${seconds}s`);
      }
    };
    
    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);
    
    return () => clearInterval(interval);
  }, [post.status, post.scheduled_time]);

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all">
      <div className="flex justify-between items-start mb-3">
        <div className="flex gap-2 flex-wrap">
          {post.platforms?.map((platform) => (
            <span key={platform} className="flex items-center gap-1 text-xs bg-white/10 px-2 py-1 rounded-lg text-gray-300 capitalize">
              <PlatformIcon platform={platform} size="w-3 h-3" />
              {platform}
            </span>
          ))}
        </div>
        <span className={`text-xs px-3 py-1 rounded-full border ${statusColors[post.status] || statusColors.draft}`}>
          {statusIcons[post.status] || ''} {post.status}
        </span>
      </div>
      <p className="text-gray-300 mb-4 line-clamp-2">{post.content}</p>
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-500">
          {post.status === 'scheduled' && post.scheduled_time 
            ? timeRemaining 
              ? `⏰ ${timeRemaining} - ${new Date(post.scheduled_time).toLocaleString()}`
              : `📅 Scheduled: ${new Date(post.scheduled_time).toLocaleString()}`
            : new Date(post.created_at).toLocaleDateString()}
        </span>
        <div className="flex gap-2">
          {(post.status === 'draft' || post.status === 'scheduled') && (
            <button
              onClick={() => onPublish(post._id)}
              className="text-green-400 hover:text-green-300 hover:bg-green-500/10 px-3 py-1.5 rounded-lg transition-all"
            >
              Publish Now
            </button>
          )}
          {(post.status !== 'published') && (
            <button
              onClick={() => onDelete(post._id)}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-all"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Automation Rule Card
const RuleCard = ({ rule, onToggle, onDelete }) => {
  const triggerIcons = {
    new_follower: '👤', new_comment: '💭', mention: '@', scheduled: '⏰',
    new_post: '📝', new_like: '❤️', new_share: '🔄', new_message: '✉️',
  };
  
  const actionIcons = {
    auto_reply: '🤖', auto_like: '👍', auto_follow_back: '👥', publish_post: '📤',
    send_dm: '📩', send_email: '📧', webhook: '🔗', schedule_post: '📅',
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600/20 to-blue-600/20 flex items-center justify-center text-xl">
            {triggerIcons[rule.trigger] || '⚡'}
          </div>
          <div>
            <h3 className="font-semibold text-white">{rule.name}</h3>
            <p className="text-xs text-gray-400 capitalize">{rule.platform} • {rule.trigger.replace('_', ' ')}</p>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={rule.is_active !== false}
            onChange={() => onToggle(rule._id)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-green-500 peer-checked:to-emerald-500"></div>
        </label>
      </div>
      <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
        <span className="flex items-center gap-1">
          <span className="text-lg">{actionIcons[rule.action] || '⚡'}</span>
          {rule.action.replace('_', ' ')}
        </span>
        {rule.execution_count > 0 && (
          <span className="text-gray-600">• {rule.execution_count} runs</span>
        )}
      </div>
      <button
        onClick={() => onDelete(rule._id)}
        className="w-full text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 py-2 rounded-lg transition-all"
      >
        Delete Rule
      </button>
    </div>
  );
};

// Tab Navigation
const TabNav = ({ tabs, activeTab, onChange }) => (
  <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-1.5 flex gap-1">
    {tabs.map((tab) => (
      <button
        key={tab.id}
        onClick={() => onChange(tab.id)}
        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
          activeTab === tab.id
            ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/25'
            : 'text-gray-400 hover:text-white hover:bg-white/10'
        }`}
      >
        <span className="text-lg">{tab.icon}</span>
        <span className="hidden sm:inline">{tab.label}</span>
      </button>
    ))}
  </div>
);

// Main Dashboard Component
export default function AutomationDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [apiStatus, setApiStatus] = useState('checking');
  const [connectionStage, setConnectionStage] = useState(0);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [dateRange, setDateRange] = useState(30);

  // Hooks
  const { checkHealth, posts, loading: postsLoading, deletePost, publishPost, getPosts, fetchPosts, triggerScheduledPosts } = useAutomation();
  const { accounts, fetchAccounts, connect, disconnect } = useSocialAccounts();
  const { rules, loading: rulesLoading, fetchRules, createRule, remove: removeRule, toggleRule } = useAutomationRules();
  const { analytics, loading: analyticsLoading, fetchAnalytics, fetchPlatformStats, platformStats } = useAnalytics();
  const { user: profile, fetchUser, isAuthenticated, logout } = useAuth();

  // Auth modal - use useEffect to sync with isAuthenticated
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // Sync auth modal with authentication state
  useEffect(() => {
    setShowAuthModal(!isAuthenticated);
  }, [isAuthenticated]);
  const [showCreateRuleModal, setShowCreateRuleModal] = useState(false);
  const [showPostCreator, setShowPostCreator] = useState(false);
  const [creatingRule, setCreatingRule] = useState(false);

  // Check API health on mount
  useEffect(() => {
    checkHealth()
      .then(() => setApiStatus('connected'))
      .catch(() => setApiStatus('disconnected'));
  }, [checkHealth]);

  // Filter state for posts
  const [postStatusFilter, setPostStatusFilter] = useState('all');

  // Check and publish scheduled posts every minute
  useEffect(() => {
    let isMounted = true;
    let hasRunOnce = false; // Track if we've run once
    
    const checkScheduledPosts = async () => {
      if (!isMounted) return;
      try {
        const result = await triggerScheduledPosts();
        console.log('Scheduled posts check result:', result);
        
        // Only show notifications after initial load (not on first mount)
        if (hasRunOnce && result?.results?.length > 0) {
          const publishedCount = result.results.filter(r => r.success).length;
          if (publishedCount > 0) {
            toast.success(`🎉 ${publishedCount} scheduled post(s) published successfully!`);
          }
        }
        hasRunOnce = true;
        
        // Only refresh if component is still mounted and on posts tab
        if (isMounted && activeTab === 'posts') {
          getPosts({ status_filter: postStatusFilter });
        }
      } catch (err) {
        console.error('Error checking scheduled posts:', err);
        hasRunOnce = true; // Mark as run even on error
      }
    };
    
    // Wait a bit before first check to not interfere with initial load
    const initialTimeout = setTimeout(() => {
      checkScheduledPosts();
    }, 3000);
    
    // Then check every minute
    const interval = setInterval(checkScheduledPosts, 60000);
    
    return () => {
      isMounted = false;
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [triggerScheduledPosts, getPosts, activeTab, postStatusFilter]);

  // Cycle through connection stages for animation
  useEffect(() => {
    if (apiStatus === 'checking') {
      const interval = setInterval(() => {
        setConnectionStage(prev => (prev + 1) % 6);
      }, 800);
      return () => clearInterval(interval);
    }
  }, [apiStatus]);

  // Handle status filter change
  const handleStatusFilterChange = (status) => {
    console.log('Filter changed to:', status);
    setPostStatusFilter(status);
    getPosts({ status_filter: status }).then(result => {
      console.log('Posts fetched:', result);
    });
  };

  // Fetch data when tab changes or API connects
  useEffect(() => {
    if (apiStatus === 'connected') {
      fetchUser();
    }
  }, [apiStatus, fetchUser]);

  useEffect(() => {
    if (apiStatus === 'connected') {
      if (activeTab === 'accounts') fetchAccounts();
      if (activeTab === 'posts') getPosts({ status_filter: postStatusFilter });
      if (activeTab === 'automation') fetchRules();
      if (activeTab === 'analytics') {
        fetchAnalytics(dateRange);
        fetchPlatformStats(null, dateRange);
      }
    }
  }, [activeTab, apiStatus, dateRange, fetchAccounts, fetchRules, fetchAnalytics, fetchPlatformStats, getPosts, postStatusFilter]);

  // Tab definitions
  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'accounts', label: 'Accounts', icon: '🔗' },
    { id: 'posts', label: 'Posts', icon: '📝' },
    { id: 'automation', label: 'Automation', icon: '🤖' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
  ];

  // Handlers
  const handleConnect = (platform) => {
    console.log('Opening connect modal for platform:', platform);
    setSelectedPlatform(platform);
    setShowConnectModal(true);
  };

  const handleConnectWithCredentials = async (platform, credentials) => {
    console.log('Connecting platform with credentials:', platform);
    try {
      await connect(platform, credentials);
      console.log('Platform connected successfully:', platform);
      toast.success(`${platform} account connected successfully!`);
      setShowConnectModal(false);
      setSelectedPlatform(null);
      fetchAccounts();
    } catch (err) {
      console.error('Failed to connect platform:', err);
      toast.error(err.message || `Failed to connect ${platform} account`);
    }
  };

  const handleDisconnect = async (platform) => {
    console.log('Attempting to disconnect platform:', platform);
    if (confirm(`Disconnect ${platform}?`)) {
      try {
        await disconnect(platform);
        console.log('Platform disconnected successfully:', platform);
        toast.success(`${platform} account disconnected`);
        fetchAccounts();
      } catch (err) {
        console.error('Failed to disconnect platform:', err);
        toast.error(err.message || `Failed to disconnect ${platform}`);
      }
    }
  };

  const handleCreateRule = async (ruleData) => {
    console.log('Creating automation rule:', ruleData.name);
    setCreatingRule(true);
    try {
      await createRule(ruleData);
      console.log('Automation rule created successfully:', ruleData.name);
      toast.success('Automation rule created successfully!');
      setShowCreateRuleModal(false);
      fetchRules();
    } catch (err) {
      console.error('Failed to create rule:', err);
      toast.error(err.message || 'Failed to create automation rule');
    } finally {
      setCreatingRule(false);
    }
  };

  const handleToggleRule = async (ruleId) => {
    console.log('Toggling rule:', ruleId);
    try {
      await toggleRule(ruleId);
      toast.success('Rule updated successfully');
      fetchRules();
    } catch (err) {
      console.error('Failed to toggle rule:', err);
      toast.error(err.message || 'Failed to update rule');
    }
  };

  const handleDeleteRule = async (ruleId) => {
    console.log('Deleting rule:', ruleId);
    if (confirm('Delete this rule?')) {
      try {
        await removeRule(ruleId);
        console.log('Rule deleted successfully');
        toast.success('Rule deleted successfully');
        fetchRules();
      } catch (err) {
        console.error('Failed to delete rule:', err);
        toast.error(err.message || 'Failed to delete rule');
      }
    }
  };

  const handleDeletePost = async (postId) => {
    console.log('Deleting post:', postId);
    if (confirm('Delete this post?')) {
      try {
        await deletePost(postId);
        console.log('Post deleted successfully');
        toast.success('Post deleted successfully');
        // Use getPosts to refetch with current filter
        getPosts({ status_filter: postStatusFilter });
      } catch (err) {
        console.error('Failed to delete post:', err);
        toast.error(err.message || 'Failed to delete post');
      }
    }
  };

  const handlePublishPost = async (postId) => {
    console.log('Publishing post:', postId);
    try {
      const result = await publishPost(postId);
      console.log('Post published result:', result);
      
      // Show appropriate message based on result
      if (result?.results) {
        const successCount = result.results.filter(r => r.status === 'success').length;
        const failCount = result.results.filter(r => r.status === 'error').length;
        
        if (failCount > 0 && successCount > 0) {
          toast.warning(`Posted to ${successCount} platform(s). Failed: ${failCount}`);
        } else if (failCount > 0) {
          toast.error('Failed to publish post');
        } else {
          toast.success('Post published successfully!');
        }
      } else {
        toast.success('Post published successfully!');
      }
      
      // Use getPosts to refetch with current filter
      getPosts({ status_filter: postStatusFilter });
    } catch (err) {
      console.error('Failed to publish post:', err);
      toast.error(err.message || 'Failed to publish post');
    }
  };

  // Loading state - Enhanced Cyberpunk Style with MCP Connection
  if (apiStatus === 'checking') {
    const connectionStages = [
      { text: 'INITIALIZING SYSTEM CORE...', sub: 'Loading neural pathways' },
      { text: 'ESTABLISHING MCP LINK...', sub: 'Connecting to automation server' },
      { text: 'VERIFYING PROTOCOLS...', sub: 'Authenticating connection' },
      { text: 'SYNCING DATA STREAMS...', sub: 'Retrieving account information' },
      { text: 'ACTIVATING NEURAL GRID...', sub: 'Preparing automation modules' },
      { text: 'ALMOST READY...', sub: 'Finalizing connection' },
    ];
    
    const currentStage = connectionStages[connectionStage];
    
    return (
      <div className="min-h-screen bg-black flex items-center justify-center overflow-hidden relative">
        {/* Cyberpunk Background Grid */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(120,0,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(120,0,255,0.03)_1px,transparent_1px)]" style={{ backgroundSize: '50px 50px' }}></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/5 to-transparent"></div>
        </div>
        
        {/* Animated Glow Orbs */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-600/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-blue-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-600/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        
        <div className="relative z-10 flex flex-col items-center gap-8">
          {/* Main Loader - Enhanced Version */}
          <div className="relative w-40 h-40">
            {/* Outer Ring with dots */}
            <div className="absolute inset-0 border-2 border-purple-500/40 rounded-full animate-[spin_4s_linear_infinite]">
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-purple-400 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.8)]"></div>
            </div>
            {/* Middle Ring */}
            <div className="absolute inset-3 border-2 border-blue-500/50 rounded-full animate-[spin_3s_linear_infinite_reverse]">
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-blue-400 rounded-full shadow-[0_0_10px_rgba(96,165,250,0.8)]"></div>
            </div>
            {/* Inner Ring */}
            <div className="absolute inset-6 border-2 border-cyan-500/60 rounded-full animate-[spin_2s_linear_infinite]">
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)]"></div>
            </div>
            {/* Core */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 rounded-full animate-pulse shadow-[0_0_40px_rgba(139,92,246,0.6),0_0_60px_rgba(59,130,246,0.4)]"></div>
            </div>
            {/* Center Dot */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-full animate-ping"></div>
            </div>
          </div>
          
          {/* MCP Badge */}
          <div className="flex items-center gap-2 px-4 py-1.5 bg-purple-900/30 border border-purple-500/30 rounded-full">
            <span className="text-xs font-mono text-purple-400">MCP SERVER</span>
            <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse"></span>
          </div>
          
          {/* Dynamic Connection Status */}
          <div className="flex flex-col items-center gap-2 min-h-[80px]">
            <p className="text-xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 animate-pulse">
              {connectionStages[connectionStage].text}
            </p>
            <p className="text-sm text-gray-500 font-mono">{connectionStages[connectionStage].sub}</p>
          </div>
           
          {/* Progress Stages */}
          <div className="flex items-center gap-2">
            {[0, 1, 2, 3, 4, 5].map((stage) => (
              <div 
                key={stage}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  stage <= connectionStage 
                    ? 'bg-gradient-to-r from-purple-500 to-cyan-500 shadow-[0_0_10px_rgba(139,92,246,0.8)]' 
                    : 'bg-gray-700'
                }`}
              />
            ))}
          </div>
          
          {/* Terminal-style Log */}
          <div className="w-80 p-4 bg-black/60 border border-purple-500/20 rounded-xl font-mono text-xs">
            <div className="flex items-center gap-2 mb-2 text-purple-400">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              <span>SYSTEM LOG</span>
            </div>
            <div className="text-gray-400 space-y-1">
              <p><span className="text-green-500">✓</span> Core modules initialized</p>
              <p><span className={connectionStage >= 1 ? 'text-green-500' : 'text-gray-600'}>✓</span> MCP protocol handshake</p>
              <p><span className={connectionStage >= 2 ? 'text-green-500' : 'text-gray-600'}>✓</span> Security verification</p>
              <p><span className={connectionStage >= 3 ? 'text-green-500' : 'text-gray-600'}>✓</span> Data stream sync</p>
              <p><span className={connectionStage >= 4 ? 'text-green-500' : 'text-gray-600'}>✓</span> Neural grid activation</p>
            </div>
          </div>
          
          {/* System Status - Enhanced */}
          <div className="flex items-center gap-4 text-xs font-mono text-gray-500">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-green-400">ONLINE</span>
            </span>
            <span className="text-gray-700">|</span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse"></span>
              <span className="text-cyan-400">ENCRYPTED</span>
            </span>
            <span className="text-gray-700">|</span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse"></span>
              <span className="text-purple-400">MCP v2.0</span>
            </span>
          </div>
        </div>
        
        {/* Scanline Effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent animate-[scan_3s_linear_infinite]" style={{ transform: 'translateY(-100%)', animation: 'scan 3s linear infinite' }}></div>
        </div>
      </div>
    );
  }

  // Disconnected state - Cyberpunk Style
  if (apiStatus === 'disconnected') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,0,0,0.03)_1px,transparent_1px)]" style={{ backgroundSize: '50px 50px' }}></div>
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-600/10 rounded-full blur-[100px]"></div>
        </div>
        
        <div className="relative z-10 text-center p-10 bg-gradient-to-br from-gray-900 via-red-950/20 to-gray-900 border border-red-500/30 backdrop-blur-xl rounded-3xl max-w-lg shadow-[0_0_50px_rgba(239,68,68,0.2)]">
          {/* Animated Warning Icon */}
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 border-2 border-red-500/50 rounded-full animate-ping"></div>
            <div className="absolute inset-2 border-2 border-red-500/30 rounded-full animate-pulse"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.6)]">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-orange-400 to-red-400 mb-3">
            SYSTEM OFFLINE
          </h2>
          <p className="text-gray-400 mb-6">The automation server is not responding. Initialize the connection to continue.</p>
          
          {/* Command Box */}
          <div className="bg-black/60 border border-red-500/20 text-red-400 px-6 py-4 rounded-xl font-mono text-sm mb-4">
            <span className="text-gray-500">$</span> cd automation && uvicorn app.main:app --port 8000
          </div>
          
          {/* Retry Button */}
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl font-medium hover:from-red-700 hover:to-orange-700 transition-all shadow-[0_0_20px_rgba(239,68,68,0.4)]"
          >
            RETRY CONNECTION
          </button>
          
          {/* Status Indicators */}
          <div className="flex items-center justify-center gap-4 mt-6 text-xs font-mono text-gray-600">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              <span className="text-red-500">CONNECTION LOST</span>
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black pointer-events-none"></div>
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
      
      {/* Header */}
      <header className="relative z-10 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">⚡</span>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  NexGen Quillix
                </h1>
                <p className="text-xs text-gray-500 -mt-0.5">Automation Platform</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Connection Status */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/30 rounded-full">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span className="text-green-400 text-sm">Live</span>
              </div>
              
              {/* User Menu */}
              {profile ? (
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm text-white font-medium">{profile.full_name || profile.username}</p>
                    <p className="text-xs text-gray-500">{profile.email}</p>
                  </div>
                  <button
                    onClick={async () => { 
                      console.log('User logging out');
                      await logout(); 
                      toast.info('You have been logged out');
                      setShowAuthModal(true); 
                    }}
                    className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-blue-700 transition-all"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <TabNav tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      </div>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-purple-600/20 via-blue-600/10 to-transparent border border-white/10 rounded-3xl p-8">
              <h2 className="text-3xl font-bold text-white mb-2">
                Welcome back{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}! 👋
              </h2>
              <p className="text-gray-400 text-lg">Here's what's happening with your social media today.</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard 
                title="Connected Accounts" 
                value={accounts.length} 
                icon="🔗" 
                gradient="from-purple-600 to-pink-600" 
              />
              <StatCard 
                title="Total Posts" 
                value={posts?.length || 0} 
                icon="📝" 
                gradient="from-blue-600 to-cyan-600" 
              />
              <StatCard 
                title="Active Rules" 
                value={rules.filter(r => r.is_active !== false).length} 
                icon="🤖" 
                gradient="from-green-600 to-emerald-600" 
              />
              <StatCard 
                title="Total Engagements" 
                value={(analytics?.total_likes || 0) + (analytics?.total_comments || 0) + (analytics?.total_shares || 0)} 
                icon="💬" 
                gradient="from-orange-600 to-red-600" 
              />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => setActiveTab('accounts')}
                className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:border-purple-500/50 transition-all group text-left"
              >
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                  ➕
                </div>
                <h3 className="text-white font-semibold mb-1">Connect Account</h3>
                <p className="text-gray-400 text-sm">Link a new social platform</p>
              </button>
              
              <button
                onClick={() => setActiveTab('posts')}
                className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:border-blue-500/50 transition-all group text-left"
              >
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                  ✨
                </div>
                <h3 className="text-white font-semibold mb-1">AI Generate</h3>
                <p className="text-gray-400 text-sm">Create content with AI</p>
              </button>
              
              <button
                onClick={() => setActiveTab('automation')}
                className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:border-green-500/50 transition-all group text-left"
              >
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                  ⚡
                </div>
                <h3 className="text-white font-semibold mb-1">New Automation</h3>
                <p className="text-gray-400 text-sm">Set up a new rule</p>
              </button>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Posts */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Recent Posts</h3>
                  <button onClick={() => setActiveTab('posts')} className="text-purple-400 hover:text-purple-300 text-sm">View All →</button>
                </div>
                {postsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : posts?.length > 0 ? (
                  <div className="space-y-3">
                    {posts.slice(0, 3).map((post) => (
                      <div key={post._id} className="flex items-center gap-3 p-3 bg-black/30 rounded-xl">
                        <div className="flex gap-1">
                          {post.platforms?.slice(0, 2).map((p) => (
                            <PlatformIcon key={p} platform={p} size="w-4 h-4" />
                          ))}
                        </div>
                        <p className="flex-1 text-gray-300 text-sm truncate">{post.content}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          post.status === 'published' ? 'bg-green-500/20 text-green-400' : 
                          post.status === 'scheduled' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-700/50 text-gray-400'
                        }`}>
                          {post.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No posts yet. Create your first post!</p>
                  </div>
                )}
              </div>

              {/* Platform Overview */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Connected Platforms</h3>
                  <button onClick={() => setActiveTab('accounts')} className="text-purple-400 hover:text-purple-300 text-sm">Manage →</button>
                </div>
                {accounts.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {accounts.map((acc) => (
                      <div key={acc.platform} className="flex items-center gap-3 p-3 bg-black/30 rounded-xl">
                        <PlatformIcon platform={acc.platform} size="w-6 h-6" />
                        <span className="text-white capitalize">{acc.platform}</span>
                        <span className="w-2 h-2 bg-green-400 rounded-full ml-auto"></span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No accounts connected yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Accounts Tab */}
        {activeTab === 'accounts' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Connected Accounts</h2>
                <p className="text-gray-400">Manage your social media connections</p>
              </div>
            </div>

            {accounts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {accounts.map((account) => (
                  <AccountCard key={account._id} account={account} onDisconnect={handleDisconnect} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white/5 border border-white/10 rounded-2xl">
                <div className="w-20 h-20 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
                  🔗
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No Accounts Connected</h3>
                <p className="text-gray-400 mb-6">Connect your social media accounts to get started</p>
              </div>
            )}

            {/* Available Platforms */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Available Platforms</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {['facebook', 'instagram', 'linkedin', 'x', 'youtube', 'whatsapp'].map((platform) => {
                  const isConnected = accounts.some(a => a.platform === platform);
                  const platformInfo = {
                    facebook: { name: 'Facebook', icon: '📘', desc: 'Connect your Facebook Page', color: 'from-blue-600 to-blue-700' },
                    instagram: { name: 'Instagram', icon: '📸', desc: 'Connect your Instagram Business', color: 'from-pink-600 to-purple-600' },
                    linkedin: { name: 'LinkedIn', icon: '💼', desc: 'Connect your LinkedIn Profile', color: 'from-blue-700 to-blue-800' },
                    x: { name: 'X (Twitter)', icon: '🐦', desc: 'Connect your X Account', color: 'from-gray-700 to-gray-900' },
                    youtube: { name: 'YouTube', icon: '▶️', desc: 'Connect your YouTube Channel', color: 'from-red-600 to-red-700' },
                    whatsapp: { name: 'WhatsApp', icon: '💬', desc: 'Connect WhatsApp Business', color: 'from-green-500 to-green-600' },
                  };
                  const info = platformInfo[platform];
                  
                  return (
                    <div key={platform} className={`bg-white/5 border border-white/10 rounded-2xl p-5 ${isConnected ? 'opacity-50' : ''}`}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${info.color} flex items-center justify-center text-xl`}>
                          {info.icon}
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">{info.name}</h4>
                          <p className="text-xs text-gray-400">{info.desc}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => !isConnected && handleConnect(platform)}
                        disabled={isConnected}
                        className={`w-full py-2.5 rounded-xl font-medium transition-all ${
                          isConnected
                            ? 'bg-green-500/20 text-green-400 cursor-default'
                            : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg'
                        }`}
                      >
                        {isConnected ? '✓ Connected' : 'Connect'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Posts Tab */}
        {activeTab === 'posts' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Posts</h2>
                <p className="text-gray-400">Manage your content across platforms</p>
              </div>
              <button
                onClick={() => setShowPostCreator(true)}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center gap-2"
              >
                <span>✨</span> Create Post
              </button>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {['all', 'draft', 'scheduled', 'published'].map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusFilterChange(status)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap ${
                    postStatusFilter === status
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                  {status === 'all' && ` (${posts?.length || 0})`}
                </button>
              ))}
            </div>

            {postsLoading ? (
              <div className="flex justify-center py-16">
                <div className="w-10 h-10 border-3 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : posts?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {posts.map((post) => (
                  <PostCard key={post._id} post={post} onDelete={handleDeletePost} onPublish={handlePublishPost} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white/5 border border-white/10 rounded-2xl">
                <div className="w-20 h-20 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
                  📝
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No Posts Yet</h3>
                <p className="text-gray-400 mb-6">Create your first post to see it here</p>
                <button
                  onClick={() => setShowPostCreator(true)}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                >
                  Create Post →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Automation Tab */}
        {activeTab === 'automation' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Automation Rules</h2>
                <p className="text-gray-400">Create rules to automate your social media</p>
              </div>
              <button
                onClick={() => setShowCreateRuleModal(true)}
                disabled={accounts.length === 0}
                className={`px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2 ${
                  accounts.length === 0
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg'
                }`}
              >
                <span>+</span> New Rule
              </button>
            </div>

            {accounts.length === 0 && (
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-yellow-400 text-center">
                Connect an account first to create automation rules
              </div>
            )}

            {rulesLoading ? (
              <div className="flex justify-center py-16">
                <div className="w-10 h-10 border-3 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : rules.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {rules.map((rule) => (
                  <RuleCard key={rule._id} rule={rule} onToggle={handleToggleRule} onDelete={handleDeleteRule} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white/5 border border-white/10 rounded-2xl">
                <div className="w-20 h-20 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
                  🤖
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No Automation Rules</h3>
                <p className="text-gray-400 mb-6">Create rules to automate your social media activity</p>
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Analytics</h2>
                <p className="text-gray-400">Track your social media performance</p>
              </div>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(Number(e.target.value))}
                className="bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2 focus:outline-none focus:border-purple-500"
              >
                <option value={7} className="text-black">Last 7 days</option>
                <option value={30} className="text-black">Last 30 days</option>
                <option value={90} className="text-black">Last 90 days</option>
              </select>
            </div>

            {analyticsLoading ? (
              <div className="flex justify-center py-16">
                <div className="w-10 h-10 border-3 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <>
                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard title="Total Posts" value={analytics?.total_posts || 0} icon="📝" gradient="from-purple-600 to-pink-600" />
                  <StatCard title="Published" value={analytics?.published_posts || 0} icon="✅" gradient="from-green-600 to-emerald-600" />
                  <StatCard title="Scheduled" value={analytics?.scheduled_posts || 0} icon="📅" gradient="from-blue-600 to-cyan-600" />
                  <StatCard title="Engagement Rate" value={`${analytics?.avg_engagement_rate || 0}%`} icon="📈" gradient="from-orange-600 to-red-600" />
                </div>

                {/* Engagement Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard title="Total Likes" value={analytics?.total_likes?.toLocaleString() || 0} icon="❤️" gradient="from-pink-600 to-rose-600" />
                  <StatCard title="Total Comments" value={analytics?.total_comments?.toLocaleString() || 0} icon="💬" gradient="from-blue-600 to-indigo-600" />
                  <StatCard title="Total Shares" value={analytics?.total_shares?.toLocaleString() || 0} icon="🔄" gradient="from-purple-600 to-violet-600" />
                  <StatCard title="Impressions" value={analytics?.total_impressions?.toLocaleString() || 0} icon="👁️" gradient="from-cyan-600 to-blue-600" />
                </div>

                {/* Platform Breakdown */}
                {analytics?.platform_breakdown && Object.keys(analytics.platform_breakdown).length > 0 && (
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Platform Performance</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                      {Object.entries(analytics.platform_breakdown).map(([platform, stats]) => (
                        <div key={platform} className="bg-black/30 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <PlatformIcon platform={platform} size="w-5 h-5" />
                            <span className="text-white capitalize text-sm">{platform}</span>
                          </div>
                          <div className="space-y-1 text-xs text-gray-400">
                            <p className="flex justify-between"><span>Likes:</span> <span className="text-white">{stats.likes || 0}</span></p>
                            <p className="flex justify-between"><span>Comments:</span> <span className="text-white">{stats.comments || 0}</span></p>
                            <p className="flex justify-between"><span>Shares:</span> <span className="text-white">{stats.shares || 0}</span></p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {(!analytics || analytics.total_posts === 0) && (
                  <div className="text-center py-16 bg-white/5 border border-white/10 rounded-2xl">
                    <div className="w-20 h-20 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
                      📊
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">No Analytics Yet</h3>
                    <p className="text-gray-400">Publish posts and connect accounts to see your analytics</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      {showConnectModal && selectedPlatform && (
        <ConnectAccountModal
          platform={selectedPlatform}
          onClose={() => { setShowConnectModal(false); setSelectedPlatform(null); }}
          onConnect={handleConnectWithCredentials}
        />
      )}

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={() => { fetchUser(); }}
      />

      {showCreateRuleModal && (
        <CreateRuleModal
          onClose={() => setShowCreateRuleModal(false)}
          onSubmit={handleCreateRule}
          accounts={accounts}
          isLoading={creatingRule}
        />
      )}

      {showPostCreator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowPostCreator(false)} />
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-900 rounded-2xl border border-white/10">
            <button
              onClick={() => setShowPostCreator(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white z-10"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <PostCreator />
          </div>
        </div>
      )}
    </div>
  );
}
