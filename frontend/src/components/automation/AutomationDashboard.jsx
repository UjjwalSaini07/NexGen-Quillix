"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAutomation, useSocialAccounts, useAutomationRules, useAnalytics, useAIGeneration, useAuth } from '@/components/hooks/useAutomation';
import ConnectAccountModal from './ConnectAccountModal';
import AuthModal from './AuthModal';
import { Orbitron, Exo_2 } from "next/font/google";
import Link from "next/link";
import CreateRuleModal from './CreateRuleModal';
import PostCreator from './PostCreator';
import { 
  EngagementLineChart, 
  EngagementAreaChart, 
  PlatformBarChart,
  EngagementRateChart,
  ImpressionsChart,
  ContentTypePieChart,
  MetricsComparisonChart,
  PostingHeatmap
} from './AnalyticsCharts';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'framer-motion';

const orbitron = Orbitron({ subsets: ["latin"], weight: ["400", "900"] });
const exo2 = Exo_2({ subsets: ["latin"], weight: ["300", "400", "600"] });

// Platform icons - Using public social logo images
const PlatformIcon = ({ platform, size = "w-8 h-8" }) => {
  const icons = {
    facebook: { 
      icon: <img src="/social/Facebook.png" alt="Facebook" className={size} />, 
      color: '' 
    },
    instagram: { 
      icon: <img src="/social/Instagram.png" alt="Instagram" className={size} />, 
      color: '' 
    },
    linkedin: { 
      icon: <img src="/social/LinkedIn.png" alt="LinkedIn" className={size} />, 
      color: '' 
    },
    x: { 
      icon: <img src="/social/X.png" alt="X" className={size} />, 
      color: '' 
    },
    youtube: { 
      icon: <img src="/social/Youtube.png" alt="YouTube" className={size} />, 
      color: '' 
    },
    whatsapp: { 
      icon: <img src="/social/whatsapp.png" alt="WhatsApp" className={size} />, 
      color: '' 
    },
  };
  
  const data = icons[platform] || { icon: <div className={`${size} bg-gray-500 rounded`} />, color: '' };
  return <span className={data.color}>{data.icon}</span>;
};

// Stats Card Component - Enhanced Glassmorphism
const StatCard = ({ title, value, icon, gradient, trend, trendValue }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ scale: 1.02 }}
    className={`relative overflow-hidden bg-gradient-to-br ${gradient} bg-opacity-10 backdrop-blur-2xl border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all duration-300 group`}
  >
    {/* Animated shine effect */}
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
    
    {/* Glow effect */}
    <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:blur-3xl transition-all duration-300" />
    
    <div className="relative flex items-start justify-between">
      <div>
        <p className="text-gray-400 text-sm font-medium mb-1">{title}</p>
        <p className={`text-4xl font-bold text-white ${orbitron.className}`}>{value}</p>
        {trend && (
          <p className={`text-sm mt-2 flex items-center gap-1 ${trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
            {trend === 'up' ? '↑' : '↓'} {trendValue}
          </p>
        )}
      </div>
      <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-3xl backdrop-blur-xl border border-white/10">
        {icon}
      </div>
    </div>
  </motion.div>
);

// Platform Account Card - Enhanced Glassmorphism
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
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-5 hover:border-white/25 transition-all group overflow-hidden relative"
    >
      {/* Gradient background glow */}
      <div className={`absolute inset-0 bg-gradient-to-br ${platformColors[account.platform] || 'from-gray-600 to-gray-700'} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
      
      {/* Animated border */}
      <div className="absolute inset-0 rounded-2xl border border-transparent group-hover:border-white/20 transition-colors duration-300" />
      
      <div className="relative flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${platformColors[account.platform] || 'from-gray-600 to-gray-700'} flex items-center justify-center text-white shadow-lg`}>
            <PlatformIcon platform={account.platform} size="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-lg capitalize">{account.platform}</h3>
            <p className="text-xs text-gray-400">{account.platform_username || 'Connected'}</p>
          </div>
        </div>
        <span className="flex items-center gap-1.5 text-green-400 text-sm">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
          Active
        </span>
      </div>
      <div className="relative flex items-center justify-between">
        <span className="text-xs text-gray-500">Connected {account.created_at ? new Date(account.created_at).toLocaleDateString() : 'recently'}</span>
        <button
          onClick={() => onDisconnect(account.platform)}
          className="text-xs text-red-400 hover:text-red-300 hover:bg-red-500/20 px-3 py-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100"
        >
          Disconnect
        </button>
      </div>
    </motion.div>
  );
};

// Post Card Component - Enhanced Glassmorphism
const PostCard = ({ post, onDelete, onPublish }) => {
  const [timeRemaining, setTimeRemaining] = useState('');
  
  const statusColors = {
    published: 'bg-green-500/20 text-green-400 border-green-500/30',
    scheduled: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    draft: 'bg-gray-700/50 text-gray-400 border-gray-600/30',
    failed: 'bg-red-500/20 text-red-400 border-red-500/30',
    partial_failure: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  };
  
  const statusIcons = {
    published: '✅',
    scheduled: '⏰',
    draft: '📝',
    failed: '❌',
    partial_failure: '⚠️',
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
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-5 hover:border-white/25 transition-all overflow-hidden relative group"
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative flex justify-between items-start mb-3">
        <div className="flex gap-2 flex-wrap">
          {post.platforms?.map((platform) => (
            <span key={platform} className="flex items-center gap-1 text-xs bg-white/10 px-2 py-1 rounded-lg text-gray-300 capitalize backdrop-blur-sm border border-white/5">
              <PlatformIcon platform={platform} size="w-3 h-3" />
              {platform}
            </span>
          ))}
        </div>
        <span className={`text-xs px-3 py-1 rounded-full border ${statusColors[post.status] || statusColors.draft}`}>
          {statusIcons[post.status] || ''} {post.status}
        </span>
      </div>
      <p className="text-gray-300 mb-4 line-clamp-2 relative">{post.content}</p>
      <div className="relative flex justify-between items-center text-sm">
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
              className="text-green-400 hover:text-green-300 hover:bg-green-500/20 px-3 py-1.5 rounded-lg transition-all"
            >
              Publish Now
            </button>
          )}
          {(post.status !== 'published') && (
            <button
              onClick={() => onDelete(post._id)}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/20 px-3 py-1.5 rounded-lg transition-all"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Automation Rule Card - Enhanced Glassmorphism
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
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-5 hover:border-white/25 transition-all overflow-hidden relative group"
    >
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600/30 to-blue-600/30 flex items-center justify-center text-2xl border border-white/10">
            {triggerIcons[rule.trigger] || '⚡'}
          </div>
          <div>
            <h3 className="font-semibold text-white text-lg">{rule.name}</h3>
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
          <div className="w-12 h-7 bg-gray-700/50 backdrop-blur-sm peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-green-500 peer-checked:to-emerald-500 shadow-lg"></div>
        </label>
      </div>
      <div className="relative flex items-center gap-4 text-sm text-gray-400 mb-4">
        <span className="flex items-center gap-1">
          <span className="text-xl">{actionIcons[rule.action] || '⚡'}</span>
          {rule.action.replace('_', ' ')}
        </span>
        {rule.execution_count > 0 && (
          <span className="text-gray-600">• {rule.execution_count} runs</span>
        )}
      </div>
      <button
        onClick={() => onDelete(rule._id)}
        className="w-full text-sm text-red-400 hover:text-red-300 hover:bg-red-500/20 py-2 rounded-lg transition-all backdrop-blur-sm"
      >
        Delete Rule
      </button>
    </motion.div>
  );
};

// Tab Navigation - Enhanced Glassmorphism
const TabNav = ({ tabs, activeTab, onChange }) => (
  <motion.div 
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-2xl p-1.5 flex gap-1"
  >
    {tabs.map((tab) => (
      <motion.button
        key={tab.id}
        onClick={() => onChange(tab.id)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
          activeTab === tab.id
            ? 'bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 text-white shadow-lg shadow-purple-500/30'
            : 'text-gray-400 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/10'
        }`}
      >
        <span className="text-xl">{tab.icon}</span>
        <span className="hidden sm:inline">{tab.label}</span>
        {activeTab === tab.id && (
          <motion.span
            layoutId="activeTab"
            className="absolute w-1 h-1 bg-white rounded-full"
          />
        )}
      </motion.button>
    ))}
  </motion.div>
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
  const { analytics, loading: analyticsLoading, fetchAnalytics, fetchPlatformStats, platformStats, fetchTimeSeriesAnalytics, fetchAudienceInsights, fetchPredictions, fetchEngagementMetrics, fetchGrowthMetrics, timeSeriesData, audienceInsights, predictions, engagementMetrics, growthMetrics } = useAnalytics();
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
    
    const checkScheduledPosts = async () => {
      // Skip if not authenticated
      if (!isAuthenticated) {
        return;
      }
      
      if (!isMounted) return;
      try {
        const result = await triggerScheduledPosts();
        
        // Show notifications when scheduled posts are processed
        if (result && result.results && result.results.length > 0) {
          // Get posts that were successfully published
          const published = result.results.filter(r => r.status === 'published');
          const failed = result.results.filter(r => r.status === 'partial_failure' || r.status === 'error');
          
          if (published.length > 0) {
            await Swal.fire({
              title: '✅ Scheduled Post Published!',
              text: `${published.length} scheduled post(s) published successfully to social media!`,
              icon: 'success',
              confirmButtonText: 'Great!',
              timer: 5000,
              timerProgressBar: true
            });
          }
          
          if (failed.length > 0) {
            await Swal.fire({
              title: '⚠️ Scheduled Post Failed',
              text: `${failed.length} scheduled post(s) failed to publish.`,
              icon: 'warning',
              confirmButtonText: 'OK'
            });
          }
        }
        
        // Refresh posts - fetch all statuses to update the UI properly
        if (isMounted) {
          // First, refresh the current filter to update statuses
          getPosts({ status_filter: postStatusFilter });
          
          // Also refresh all posts to ensure status changes are reflected
          // This handles the case where a scheduled post becomes published
          setTimeout(() => {
            if (isMounted) {
              getPosts({ status_filter: postStatusFilter });
            }
          }, 1500);
        }
      } catch (err) {
        console.error('Error checking scheduled posts:', err);
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
    setPostStatusFilter(status);
    if (isAuthenticated) {
      getPosts({ status_filter: status }).then(result => {
        console.log('Posts fetched:', result);
      });
    }
  };

  // Fetch data when tab changes or API connects
  useEffect(() => {
    if (apiStatus === 'connected' && isAuthenticated) {
      fetchUser();
    }
  }, [apiStatus, fetchUser, isAuthenticated]);

  useEffect(() => {
    if (apiStatus === 'connected' && isAuthenticated) {
      if (activeTab === 'accounts') fetchAccounts();
      if (activeTab === 'posts') getPosts({ status_filter: postStatusFilter });
      if (activeTab === 'automation') fetchRules();
      if (activeTab === 'analytics') {
        fetchAnalytics(dateRange);
        fetchPlatformStats(null, dateRange);
        fetchTimeSeriesAnalytics({ days: dateRange, granularity: 'daily' });
        fetchAudienceInsights({ days: dateRange });
        fetchPredictions({ days: dateRange });
        fetchEngagementMetrics({ days: dateRange });
        fetchGrowthMetrics({ days: dateRange });
      }
    }
  }, [activeTab, apiStatus, dateRange, fetchAccounts, fetchRules, fetchAnalytics, fetchPlatformStats, fetchTimeSeriesAnalytics, fetchAudienceInsights, fetchPredictions, fetchEngagementMetrics, fetchGrowthMetrics, getPosts, postStatusFilter]);

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
    const result = await Swal.fire({
      title: 'Disconnect Account',
      text: `Are you sure you want to disconnect ${platform}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, disconnect',
      cancelButtonText: 'Cancel',
      background: '#1f2937',
      color: '#fff',
    });
    if (result.isConfirmed) {
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
    const result = await Swal.fire({
      title: 'Delete Rule',
      text: 'Are you sure you want to delete this automation rule?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
      background: '#1f2937',
      color: '#fff',
    });
    if (result.isConfirmed) {
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
    const result = await Swal.fire({
      title: 'Delete Post',
      text: 'Are you sure you want to delete this post?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
      background: '#1f2937',
      color: '#fff',
    });
    if (result.isConfirmed) {
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
      {/* Enhanced Background Effects - Professional Glassmorphism */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black pointer-events-none"></div>
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[150px] pointer-events-none animate-pulse" style={{ animationDelay: '0.5s' }}></div>
      
      {/* Grid pattern overlay */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(120,0,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(120,0,255,0.02)_1px,transparent_1px)] pointer-events-none" style={{ backgroundSize: '60px 60px' }}></div>
      
      {/* Header */}
      <header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 bg-black/60 backdrop-blur-2xl border-b border-white/10 shadow-lg shadow-purple-500/5"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            <div className="flex items-center gap-3">
              <img src="/NexGenQuillixLogo.png" alt="NexGen Quillix Logo" className="w-10 h-10 rounded-xl" />
              <div>
                <h1 className={`text-white font-extrabold text-lg sm:text-xl tracking-wide hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-white transition duration-200 mb-2 sm:mb-0 sm:mr-4 ${orbitron.className}`} >
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
            {/* Welcome Section - Enhanced Glassmorphism */}
            <div className="bg-gradient-to-r from-purple-600/20 via-blue-600/10 to-cyan-500/10 border border-white/10 rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden">
              {/* Animated background elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
              
              <div className="relative z-10">
                <h2 className="text-4xl font-bold text-white mb-2">
                  Welcome back{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}! 👋
                </h2>
                <p className="text-gray-400 text-lg">Here's what's happening with your social media today.</p>
              </div>
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
                          post.status === 'scheduled' ? 'bg-yellow-500/20 text-yellow-400' :
                          post.status === 'partial_failure' ? 'bg-orange-500/20 text-orange-400' : 'bg-gray-700/50 text-gray-400'
                        }`}>
                          {post.status === 'partial_failure' ? 'Failed' : post.status}
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
              <button
                onClick={() => {
                  fetchAccounts();
                  toast.info('Refreshing accounts...');
                }}
                className="px-3 py-2 bg-white/10 text-gray-300 rounded-xl hover:bg-white/20 transition-all flex items-center gap-2"
                title="Refresh Accounts"
              >
                <span className="animate-spin">↻</span> Refresh
              </button>
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
                    facebook: { 
                      name: 'Facebook', 
                      icon: <img src="/social/Facebook.png" alt="Facebook" className="w-6 h-6" />,
                      desc: 'Connect your Facebook Page', 
                      color: 'from-blue-600 to-blue-700' 
                    },
                    instagram: { 
                      name: 'Instagram', 
                      icon: <img src="/social/Instagram.png" alt="Instagram" className="w-6 h-6" />,
                      desc: 'Connect your Instagram Business', 
                      color: 'from-pink-600 to-purple-600' 
                    },
                    linkedin: { 
                      name: 'LinkedIn', 
                      icon: <img src="/social/LinkedIn.png" alt="LinkedIn" className="w-6 h-6" />,
                      desc: 'Connect your LinkedIn Profile', 
                      color: 'from-blue-700 to-blue-800' 
                    },
                    x: { 
                      name: 'X (Twitter)', 
                      icon: <img src="/social/X.png" alt="X" className="w-6 h-6" />,
                      desc: 'Connect your X Account', 
                      color: 'from-gray-700 to-gray-900' 
                    },
                    youtube: { 
                      name: 'YouTube', 
                      icon: <img src="/social/Youtube.png" alt="YouTube" className="w-6 h-6" />,
                      desc: 'Connect your YouTube Channel', 
                      color: 'from-red-600 to-red-700' 
                    },
                    whatsapp: { 
                      name: 'WhatsApp', 
                      icon: <img src="/social/whatsapp.png" alt="WhatsApp" className="w-6 h-6" />,
                      desc: 'Connect WhatsApp Business', 
                      color: 'from-green-500 to-green-600' 
                    },
                  };
                  const info = platformInfo[platform];
                  
                  return (
                    <div key={platform} className={`bg-white/5 border border-white/10 rounded-2xl p-5 ${isConnected ? 'opacity-50' : ''}`}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${info.color} flex items-center justify-center text-white p-1.5`}>
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
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    getPosts({ status_filter: postStatusFilter });
                    toast.info('Refreshing posts...');
                  }}
                  className="px-3 py-2 bg-white/10 text-gray-300 rounded-xl hover:bg-white/20 transition-all flex items-center gap-2"
                  title="Refresh Posts"
                >
                  <span className="animate-spin">↻</span> Refresh
                </button>
                <button
                  onClick={() => setShowPostCreator(true)}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <span>✨</span> Create Post
                </button>
              </div>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {['all', 'draft', 'scheduled', 'published', 'partial_failure'].map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusFilterChange(status)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap ${
                    postStatusFilter === status
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {status === 'partial_failure' ? 'Failed' : status.charAt(0).toUpperCase() + status.slice(1)}
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
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    fetchRules();
                    toast.info('Refreshing rules...');
                  }}
                  className="px-3 py-2 bg-white/10 text-gray-300 rounded-xl hover:bg-white/20 transition-all flex items-center gap-2"
                  title="Refresh Rules"
                >
                  <span className="animate-spin">↻</span> Refresh
                </button>
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
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    fetchAnalytics(dateRange);
                    fetchPlatformStats(null, dateRange);
                    fetchTimeSeriesAnalytics({ days: dateRange, granularity: 'daily' });
                    fetchAudienceInsights({ days: dateRange });
                    fetchPredictions({ days: dateRange });
                    fetchEngagementMetrics({ days: dateRange });
                    fetchGrowthMetrics({ days: dateRange });
                    toast.info('Refreshing analytics...');
                  }}
                  className="px-3 py-2 bg-white/10 text-gray-300 rounded-xl hover:bg-white/20 transition-all flex items-center gap-2"
                  title="Refresh Analytics"
                >
                  <span className="animate-spin">↻</span> Refresh
                </button>
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

                {/* Predictive Insights */}
                {predictions && predictions.trend_direction && (
                  <div className={`p-6 rounded-2xl border mb-6 ${
                    predictions.trend_direction === 'up' ? 'bg-green-500/10 border-green-500/30' :
                    predictions.trend_direction === 'down' ? 'bg-red-500/10 border-red-500/30' :
                    'bg-blue-500/10 border-blue-500/30'
                  }`}>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{
                        predictions.trend_direction === 'up' ? '📈' :
                        predictions.trend_direction === 'down' ? '📉' : '➡️'
                      }</span>
                      <h3 className="text-lg font-semibold text-white">Trend: {predictions.trend_direction.toUpperCase()}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                        predictions.overall_change > 0 ? 'bg-green-500/30 text-green-400' :
                        predictions.overall_change < 0 ? 'bg-red-500/30 text-red-400' :
                        'bg-gray-500/30 text-gray-400'
                      }`}>
                        {predictions.overall_change > 0 ? '+' : ''}{predictions.overall_change}%
                      </span>
                    </div>
                    <p className="text-gray-300">{predictions.prediction}</p>
                    <div className="grid grid-cols-4 gap-4 mt-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-white">{predictions.recent_period?.likes || 0}</p>
                        <p className="text-xs text-gray-400">Likes</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-white">{predictions.recent_period?.comments || 0}</p>
                        <p className="text-xs text-gray-400">Comments</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-white">{predictions.recent_period?.shares || 0}</p>
                        <p className="text-xs text-gray-400">Shares</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-white">{(predictions.recent_period?.impressions || 0).toLocaleString()}</p>
                        <p className="text-xs text-gray-400">Impressions</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Time Series Chart (Simplified Display) */}
                {timeSeriesData?.time_series && timeSeriesData.time_series.length > 0 && (
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
                    <h3 className="text-lg font-semibold text-white mb-4">📊 Engagement Over Time</h3>
                    <div className="overflow-x-auto">
                      <div className="flex gap-2 pb-2">
                        {timeSeriesData.time_series.slice(-14).map((item, idx) => (
                          <div key={idx} className="flex-shrink-0 w-16 text-center">
                            <div className="flex flex-col justify-end h-32 bg-gray-800 rounded-lg overflow-hidden">
                              <div 
                                className="bg-gradient-to-t from-purple-600 to-pink-500 w-full"
                                style={{ height: `${Math.min(100, (item.engagement / Math.max(...timeSeriesData.time_series.map(t => t.engagement || 1))) * 100)}%` }}
                              />
                            </div>
                            <p className="text-xs text-gray-400 mt-1">{item.date?.slice(5) || ''}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-4 mt-4 text-xs text-gray-400">
                      <span>🟣 Likes</span>
                      <span>💬 Comments</span>
                      <span>🔄 Shares</span>
                    </div>
                  </div>
                )}

                {/* Advanced Charts Section - Always show with demo data fallback */}
                {(() => {
                  // Generate demo data if no real data available
                  const generateDemoData = () => Array.from({ length: 14 }, (_, i) => {
                    const date = new Date();
                    date.setDate(date.getDate() - (13 - i));
                    return {
                      date: date.toISOString().split('T')[0],
                      likes: Math.floor(Math.random() * 500) + 100,
                      comments: Math.floor(Math.random() * 100) + 20,
                      shares: Math.floor(Math.random() * 50) + 10,
                      impressions: Math.floor(Math.random() * 5000) + 1000,
                      reach: Math.floor(Math.random() * 3000) + 500,
                      engagement: Math.floor(Math.random() * 600) + 100,
                      engagement_rate: parseFloat((Math.random() * 5 + 1).toFixed(2))
                    };
                  });
                  
                  const demoPlatformData = [
                    { platform: 'facebook', likes: 1250, comments: 320, shares: 180, impressions: 15000, engagement: 1750 },
                    { platform: 'instagram', likes: 2100, comments: 450, shares: 220, impressions: 22000, engagement: 2770 },
                    { platform: 'linkedin', likes: 890, comments: 180, shares: 95, impressions: 8500, engagement: 1165 },
                    { platform: 'x', likes: 560, comments: 120, shares: 85, impressions: 6500, engagement: 765 }
                  ];
                  
                  const chartData = (engagementMetrics?.metrics && engagementMetrics.metrics.length > 0) 
                    ? engagementMetrics.metrics : generateDemoData();
                  const platformData = (platformStats?.platforms && platformStats.platforms.length > 0)
                    ? platformStats.platforms.map(p => ({
                        platform: p.platform, likes: p.likes || 0, comments: p.comments || 0,
                        shares: p.shares || 0, impressions: p.impressions || 0,
                        engagement: (p.likes || 0) + (p.comments || 0) + (p.shares || 0)
                      })) : demoPlatformData;
                  const hasRealData = (engagementMetrics?.metrics && engagementMetrics.metrics.length > 0);
                  
                  return (
                    <>
                      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 mb-4 text-sm text-yellow-200">
                        {hasRealData ? '📊 Showing real analytics data' : '📊 Showing demo data - Publish posts to see real analytics'}
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        <EngagementLineChart data={chartData} title="📈 Engagement Metrics" />
                        <EngagementAreaChart data={chartData} title="📊 Engagement Trends" />
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        <PlatformBarChart data={platformData} title="🏆 Platform Performance" />
                        <ImpressionsChart data={chartData} title="👁️ Impressions & Reach" />
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        <EngagementRateChart data={chartData} title="📊 Engagement Rate %" />
                        <EngagementAreaChart data={chartData} title="🚀 Growth Trends" />
                      </div>
                      <MetricsComparisonChart data={platformData} title="📊 Platform Comparison" />
                    </>
                  );
                })()}

                {/* Audience Insights */}
                {audienceInsights && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Best Posting Times */}
                    {audienceInsights.best_posting_times?.length > 0 && (
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">⏰ Best Posting Times</h3>
                        <div className="space-y-2">
                          {audienceInsights.best_posting_times.slice(0, 5).map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center">
                              <span className="text-gray-300">{item.hour}:00</span>
                              <div className="flex-1 mx-3 h-2 bg-gray-700 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                                  style={{ width: `${Math.min(100, (item.engagement / Math.max(...audienceInsights.best_posting_times.map(t => t.engagement || 1))) * 100)}%` }}
                                />
                              </div>
                              <span className="text-white font-medium">{item.engagement}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Best Posting Days */}
                    {audienceInsights.best_posting_days?.length > 0 && (
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">📅 Best Posting Days</h3>
                        <div className="space-y-2">
                          {audienceInsights.best_posting_days.slice(0, 7).map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center">
                              <span className="text-gray-300">{item.day}</span>
                              <div className="flex-1 mx-3 h-2 bg-gray-700 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                                  style={{ width: `${Math.min(100, (item.engagement / Math.max(...audienceInsights.best_posting_days.map(t => t.engagement || 1))) * 100)}%` }}
                                />
                              </div>
                              <span className="text-white font-medium">{item.engagement}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Content Type Performance */}
                    {audienceInsights.content_type_performance?.length > 0 && (
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">📝 Content Performance</h3>
                        <div className="space-y-3">
                          {audienceInsights.content_type_performance.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center p-3 bg-black/20 rounded-lg">
                              <div>
                                <span className="text-white font-medium capitalize">{item.type}</span>
                                <p className="text-xs text-gray-400">{item.posts} posts</p>
                              </div>
                              <div className="text-right">
                                <p className="text-white font-bold">{item.engagement.toLocaleString()}</p>
                                <p className="text-xs text-gray-400">engagement</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Growth Metrics Summary - Always show */}
                {(() => {
                  const demoGrowth = {
                    growth_rate: 12.5,
                    total_impressions: 52000,
                    total_reach: 35000
                  };
                  const growth = growthMetrics || demoGrowth;
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">🚀</span>
                          <h4 className="text-white font-medium">Growth Rate</h4>
                        </div>
                        <p className={`text-3xl font-bold ${growth.growth_rate >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {growth.growth_rate >= 0 ? '+' : ''}{growth.growth_rate}%
                        </p>
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">👁️</span>
                          <h4 className="text-white font-medium">Total Impressions</h4>
                        </div>
                        <p className="text-3xl font-bold text-white">
                          {(growth.total_impressions || 0).toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">👥</span>
                          <h4 className="text-white font-medium">Total Reach</h4>
                        </div>
                        <p className="text-3xl font-bold text-white">
                          {(growth.total_reach || 0).toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">📅</span>
                          <h4 className="text-white font-medium">Period</h4>
                        </div>
                        <p className="text-3xl font-bold text-white">
                          {dateRange} days
                        </p>
                      </div>
                    </div>
                  );
                })()}
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
            <PostCreator onClose={() => { setShowPostCreator(false); getPosts({ status_filter: postStatusFilter }); }} />
          </div>
        </div>
      )}
    </div>
  );
}
