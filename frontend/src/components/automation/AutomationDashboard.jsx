"use client";

import React, { useState, useEffect } from 'react';
import { useAutomation, useSocialAccounts, useAutomationRules, usePosts, useAnalytics, useAIGeneration } from '@/components/hooks/useAutomation';
import ConnectAccountModal from './ConnectAccountModal';

// Platform icons
const PlatformIcon = ({ platform, size = "w-8 h-8" }) => {
  const icons = {
    facebook: (
      <svg className={size} fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
    instagram: (
      <svg className={size} fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    ),
    linkedin: (
      <svg className={size} fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
    x: (
      <svg className={size} fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
    youtube: (
      <svg className={size} fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    ),
    whatsapp: (
      <svg className={size} fill="currentColor" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085-.719 2 1.758.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    ),
  };
  
  return <span className={icons[platform] ? "" : "text-gray-400"}>{icons[platform] || <div className={`${size} bg-gray-500 rounded`} />}</span>;
};

// Collapsible Card Component
const CollapsibleCard = ({ title, icon, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-purple-400">{icon}</span>
          <h3 className="text-white font-semibold">{title}</h3>
        </div>
        <svg 
          className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div className={`transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="p-4 pt-0 border-t border-white/10">
          {children}
        </div>
      </div>
    </div>
  );
};

// Navbar Component
const Navbar = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'accounts', label: 'Accounts', icon: '🔗' },
    { id: 'posts', label: 'Posts', icon: '📝' },
    { id: 'automation', label: 'Automation', icon: '🤖' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
  ];

  return (
    <div className="bg-black/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-1 py-3 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/25'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Platform Card with detailed info
const PlatformCard = ({ platform, connected, onConnect, onDisconnect }) => {
  const [showDetails, setShowDetails] = useState(false);
  
  const platformInfo = {
    facebook: {
      color: 'from-blue-600 to-blue-700',
      bgColor: 'bg-blue-500/20',
      textColor: 'text-blue-400',
      description: 'Post to your Facebook Page',
      features: ['Post to Page', 'Read Insights', 'Manage Comments'],
      steps: ['Go to developers.facebook.com', 'Create an App', 'Get Access Token'],
    },
    instagram: {
      color: 'from-pink-600 to-purple-600',
      bgColor: 'bg-pink-500/20',
      textColor: 'text-pink-400',
      description: 'Connect your Instagram Business account',
      features: ['Post Images/Videos', 'Story Posts', 'Insights'],
      steps: ['Create Facebook Developer Account', 'Add Instagram Basic Display', 'Generate Token'],
    },
    linkedin: {
      color: 'from-blue-700 to-blue-800',
      bgColor: 'bg-blue-500/20',
      textColor: 'text-blue-400',
      description: 'Share posts as yourself or company',
      features: ['Post Updates', 'Share Articles', 'Network Updates'],
      steps: ['Go to developer.linkedin.com', 'Create App', 'Get OAuth Token'],
    },
    x: {
      color: 'from-gray-700 to-gray-900',
      bgColor: 'bg-gray-500/20',
      textColor: 'text-gray-300',
      description: 'Tweet from your account',
      features: ['Post Tweets', 'Read Timeline', 'Search Tweets'],
      steps: ['Go to developer.twitter.com', 'Create Project', 'Get Bearer Token'],
    },
    youtube: {
      color: 'from-red-600 to-red-700',
      bgColor: 'bg-red-500/20',
      textColor: 'text-red-400',
      description: 'Upload videos and manage channel',
      features: ['Video Updates', 'Playlist Management', 'Channel Info'],
      steps: ['Go to console.cloud.google.com', 'Enable YouTube API', 'Get OAuth Credentials'],
    },
    whatsapp: {
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-500/20',
      textColor: 'text-green-400',
      description: 'Send messages via WhatsApp Business',
      features: ['Send Messages', 'Template Messages', 'Business Info'],
      steps: ['Go to business.facebook.com', 'Create WhatsApp Business Account', 'Get API Credentials'],
    },
  };

  const info = platformInfo[platform] || { color: 'from-gray-600 to-gray-700', bgColor: 'bg-gray-500/20', textColor: 'text-gray-400', description: '', features: [], steps: [] };

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${info.color} text-white`}>
              <PlatformIcon platform={platform} />
            </div>
            <div>
              <h3 className="font-semibold text-white capitalize">{platform}</h3>
              <p className={`text-sm ${info.textColor}`}>{info.description}</p>
            </div>
          </div>
          <button
            onClick={() => connected ? onDisconnect(platform) : onConnect(platform)}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              connected
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30'
                : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg hover:shadow-purple-500/25'
            }`}
          >
            {connected ? 'Disconnect' : 'Connect'}
          </button>
        </div>

        {/* Features */}
        <div className="flex flex-wrap gap-2 mb-3">
          {info.features.map((feature, idx) => (
            <span key={idx} className="text-xs bg-white/10 text-gray-300 px-2 py-1 rounded-lg">
              {feature}
            </span>
          ))}
        </div>

        {/* How to Connect Button */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
        >
          <span>{showDetails ? 'Hide' : 'How to'} connect {platform}?</span>
          <svg className={`w-4 h-4 transition-transform ${showDetails ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Steps - Show when connected or expanded */}
        {(showDetails || connected) && (
          <div className="mt-3 p-3 bg-black/30 rounded-xl">
            <p className="text-xs text-gray-400 mb-2">Quick Steps:</p>
            <ol className="text-sm text-gray-300 space-y-1">
              {info.steps.map((step, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="w-5 h-5 bg-white/10 rounded-full flex items-center justify-center text-xs text-gray-400">{idx + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Connection Status */}
        <div className={`mt-3 flex items-center gap-2 ${connected ? 'text-green-400' : 'text-gray-500'}`}>
          <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`}></span>
          <span className="text-sm">{connected ? 'Account connected' : 'Not connected'}</span>
        </div>
      </div>
    </div>
  );
};

// Post Card Component
const PostCard = ({ post, onDelete }) => {
  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 hover:border-white/20 transition-all">
      <div className="flex justify-between items-start mb-3">
        <div className="flex gap-1 flex-wrap">
          {post.platforms?.map((platform) => (
            <span key={platform} className="flex items-center gap-1 text-xs bg-white/10 px-2 py-1 rounded-lg text-gray-300 capitalize">
              <PlatformIcon platform={platform} size="w-3 h-3" />
              {platform}
            </span>
          ))}
        </div>
        <span className={`text-xs px-3 py-1 rounded-full ${
          post.status === 'published' ? 'bg-green-500/20 text-green-400' :
          post.status === 'scheduled' ? 'bg-yellow-500/20 text-yellow-400' :
          'bg-gray-700/50 text-gray-400'
        }`}>
          {post.status}
        </span>
      </div>
      <p className="text-gray-300 mb-4 line-clamp-3">{post.content}</p>
      <div className="flex justify-between items-center text-sm text-gray-500">
        <span>{new Date(post.created_at).toLocaleDateString()}</span>
        {post.status !== 'published' && (
          <button
            onClick={() => onDelete(post._id)}
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 px-3 py-1 rounded-lg transition-colors"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

// Automation Rule Card
const RuleCard = ({ rule, onToggle, onDelete }) => {
  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 hover:border-white/20 transition-all">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <PlatformIcon platform={rule.platform} />
          <div>
            <h3 className="font-semibold text-white capitalize">{rule.platform}</h3>
            <p className="text-xs text-gray-400">{rule.action}</p>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={rule.enabled}
            onChange={() => onToggle(rule._id)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-500 peer-checked:to-blue-500"></div>
        </label>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-gray-400">
          <span className="text-gray-500">Trigger:</span> 
          <span className="bg-white/10 px-2 py-0.5 rounded text-gray-300">{rule.trigger}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-400">
          <span className="text-gray-500">Action:</span> 
          <span className="bg-white/10 px-2 py-0.5 rounded text-gray-300">{rule.action}</span>
        </div>
      </div>
      <button
        onClick={() => onDelete(rule._id)}
        className="mt-3 w-full text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 py-2 rounded-lg transition-colors"
      >
        Delete Rule
      </button>
    </div>
  );
};

// Stats Card
const StatsCard = ({ title, value, icon, gradient }) => (
  <div className={`bg-gradient-to-br ${gradient} bg-opacity-20 backdrop-blur-xl border border-white/10 rounded-2xl p-6`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-400 text-sm mb-1">{title}</p>
        <p className="text-3xl font-bold text-white">{value}</p>
      </div>
      <span className="text-3xl">{icon}</span>
    </div>
  </div>
);

// Main Dashboard Component
export default function AutomationDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [apiStatus, setApiStatus] = useState('checking');
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState(null);

  const {
    loading,
    error,
    checkHealth,
  } = useAutomation();

  const {
    accounts,
    fetchAccounts,
    connect,
    disconnect,
  } = useSocialAccounts();

  const {
    rules,
    loading: rulesLoading,
    fetchRules: fetchAutomationRules,
    create,
    remove,
    toggle,
  } = useAutomationRules();

  const {
    posts,
    loading: postsLoading,
    fetchPosts,
    delete: deletePost,
  } = usePosts();

  // New hooks for analytics and AI
  const {
    analytics,
    loading: analyticsLoading,
    fetchAnalytics,
    fetchPlatformStats,
  } = useAnalytics();

  const {
    generating,
    generatedContent,
    generatePost,
    generateReply,
  } = useAIGeneration();

  useEffect(() => {
    checkHealth()
      .then(() => setApiStatus('connected'))
      .catch(() => setApiStatus('disconnected'));
  }, [checkHealth]);

  useEffect(() => {
    if (apiStatus === 'connected') {
      if (activeTab === 'accounts') fetchAccounts();
      if (activeTab === 'posts') fetchPosts();
      if (activeTab === 'automation') fetchAutomationRules();
      if (activeTab === 'analytics') fetchAnalytics();
    }
  }, [activeTab, apiStatus, fetchAccounts, fetchPosts, fetchAutomationRules, fetchAnalytics]);

  const platforms = ['instagram', 'facebook', 'linkedin', 'x', 'youtube', 'whatsapp'];

  const handleConnect = (platform) => {
    setSelectedPlatform(platform);
    setShowConnectModal(true);
  };

  const handleConnectWithCredentials = async (platform, credentials) => {
    await connect(platform, credentials);
    setShowConnectModal(false);
    setSelectedPlatform(null);
  };

  const handleDisconnect = async (platform) => {
    if (confirm(`Are you sure you want to disconnect ${platform}?`)) {
      await disconnect(platform);
    }
  };

  const handleToggleRule = async (ruleId) => {
    await toggle(ruleId);
  };

  const handleDeleteRule = async (ruleId) => {
    if (confirm('Are you sure you want to delete this rule?')) {
      await remove(ruleId);
    }
  };

  const handleDeletePost = async (postId) => {
    if (confirm('Are you sure you want to delete this post?')) {
      await deletePost(postId);
    }
  };

  if (apiStatus === 'checking') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400">Connecting to automation server...</p>
        </div>
      </div>
    );
  }

  if (apiStatus === 'disconnected') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl max-w-md">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Cannot Connect</h2>
          <p className="text-gray-400 mb-4">Make sure the automation server is running on port 8000</p>
          <code className="text-sm bg-black/50 text-gray-300 px-4 py-2 rounded-lg block">
            cd automation && uvicorn app.main:app --host 0.0.0.0 --port 8000
          </code>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black pointer-events-none"></div>
      
      {/* Navbar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 pt-24 pb-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              NexGen Automation
            </h1>
            <p className="text-gray-400 mt-1">Manage your social media automation</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-full">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span className="text-green-400 text-sm">Connected</span>
          </div>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatsCard title="Connected Accounts" value={accounts.length} icon="🔗" gradient="from-purple-600 to-pink-600" />
            <StatsCard title="Total Posts" value={posts.length} icon="📝" gradient="from-blue-600 to-cyan-600" />
            <StatsCard title="Active Rules" value={rules.filter(r => r.enabled).length} icon="🤖" gradient="from-green-600 to-emerald-600" />
            
            <CollapsibleCard title="Quick Guide" icon="📖" defaultOpen={true}>
              <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-xl">
                  <h4 className="text-white font-medium mb-2">1. Connect Your Accounts</h4>
                  <p className="text-gray-400 text-sm">Click "Connect" on any platform above and enter your API credentials. We'll guide you through the process.</p>
                </div>
                <div className="p-4 bg-white/5 rounded-xl">
                  <h4 className="text-white font-medium mb-2">2. Create Posts</h4>
                  <p className="text-gray-400 text-sm">Write your content or use AI to generate engaging posts for your audience.</p>
                </div>
                <div className="p-4 bg-white/5 rounded-xl">
                  <h4 className="text-white font-medium mb-2">3. Automate & Schedule</h4>
                  <p className="text-gray-400 text-sm">Set up automation rules to automatically like, comment, or post on a schedule.</p>
                </div>
              </div>
            </CollapsibleCard>
          </div>
        )}

        {/* Accounts Tab */}
        {activeTab === 'accounts' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {platforms.map((platform) => (
              <PlatformCard
                key={platform}
                platform={platform}
                connected={accounts.some(a => a.platform === platform)}
                onConnect={handleConnect}
                onDisconnect={handleDisconnect}
              />
            ))}
          </div>
        )}

        {/* Posts Tab */}
        {activeTab === 'posts' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {postsLoading ? (
              <div className="col-span-full flex justify-center py-12">
                <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : posts.length > 0 ? (
              posts.map((post) => (
                <PostCard key={post._id} post={post} onDelete={handleDeletePost} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">📝</span>
                </div>
                <p className="text-gray-400">No posts yet. Create your first post!</p>
              </div>
            )}
          </div>
        )}

        {/* Automation Tab */}
        {activeTab === 'automation' && (
          <div>
            <CollapsibleCard title="Create New Rule" icon="➕" defaultOpen={true}>
              <div className="flex gap-3">
                <button
                  onClick={() => create('instagram', 'new_comment', 'auto_reply', 'Thanks!', true)}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all"
                >
                  + New Auto-Reply Rule
                </button>
              </div>
            </CollapsibleCard>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              {rulesLoading ? (
                <div className="col-span-full flex justify-center py-12">
                  <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : rules.length > 0 ? (
                rules.map((rule) => (
                  <RuleCard key={rule._id} rule={rule} onToggle={handleToggleRule} onDelete={handleDeleteRule} />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">🤖</span>
                  </div>
                  <p className="text-gray-400">No automation rules yet.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <CollapsibleCard title="Analytics Overview" icon="📈" defaultOpen={true}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatsCard title="Total Impressions" value="0" icon="👁️" gradient="from-purple-600 to-pink-600" />
              <StatsCard title="Engagement Rate" value="0%" icon="💬" gradient="from-blue-600 to-cyan-600" />
              <StatsCard title="Total Reach" value="0" icon="🌍" gradient="from-green-600 to-emerald-600" />
            </div>
            <p className="text-center text-gray-500 mt-6">Analytics will appear here once you have posts and engagement data.</p>
          </CollapsibleCard>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400">
            {error}
          </div>
        )}
      </main>

      {/* Connect Account Modal */}
      {showConnectModal && selectedPlatform && (
        <ConnectAccountModal
          platform={selectedPlatform}
          onClose={() => {
            setShowConnectModal(false);
            setSelectedPlatform(null);
          }}
          onConnect={handleConnectWithCredentials}
        />
      )}
    </div>
  );
}
