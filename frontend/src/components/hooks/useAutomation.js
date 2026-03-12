import { useState, useCallback, useEffect } from 'react';
import * as api from '@/lib/dynamic-automation-api';

// ==================== Main Automation Hook ====================
export function useAutomationRules() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch automation rules
  const fetchRules = useCallback(async (platform = null) => {
    setLoading(true);
    setError(null);
    try {
      // Using generic get - rules endpoint would need to be defined in API
      const result = await api.get(`/social/automation/rules`, { platform });
      setRules(result.rules || []);
      return result.rules;
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Create automation rule
  const createRule = useCallback(async (ruleData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.post('/social/automation/rules', ruleData);
      await fetchRules();
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchRules]);

  // Update automation rule
  const updateRule = useCallback(async (ruleId, ruleData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.put(`/social/automation/rules/${ruleId}`, ruleData);
      await fetchRules();
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchRules]);

  // Delete automation rule
  const removeRule = useCallback(async (ruleId) => {
    setLoading(true);
    setError(null);
    try {
      await api.del(`/social/automation/rules/${ruleId}`);
      await fetchRules();
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchRules]);

  // Toggle automation rule
  const toggleRule = useCallback(async (ruleId) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.post(`/social/automation/${ruleId}/toggle`, {});
      await fetchRules();
      return result;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchRules]);

  return {
    rules,
    loading,
    error,
    fetchRules,
    createRule,
    updateRule,
    removeRule,
    toggleRule,
  };
}

export function useAutomation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Helper function to handle API calls
  const handleApiCall = useCallback(async (apiFunction, ...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFunction(...args);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ==================== Auth ====================
  const login = useCallback((credentials) => 
    handleApiCall(api.loginUser, credentials), [handleApiCall]);
  
  const register = useCallback((userData) => 
    handleApiCall(api.registerUser, userData), [handleApiCall]);
  
  const logout = useCallback(() => api.logoutUser(), []);
  
  const refreshToken = useCallback((token) => 
    handleApiCall(api.refreshToken, token), [handleApiCall]);
  
  const getCurrentUser = useCallback(() => 
    handleApiCall(api.getCurrentUser), [handleApiCall]);
  
  const getUserProfile = useCallback(() => 
    handleApiCall(api.getUserProfile), [handleApiCall]);
  
  const updateProfile = useCallback((userData) => 
    handleApiCall(api.updateProfile, userData), [handleApiCall]);

  // ==================== Platforms ====================
  const getPlatforms = useCallback(() => 
    handleApiCall(api.getSupportedPlatforms), [handleApiCall]);
  
  const getOAuthUrl = useCallback((platform) => 
    handleApiCall(api.getOAuthUrl, platform), [handleApiCall]);
  
  const connectAccount = useCallback((platform, credentials) => 
    handleApiCall(api.connectSocialAccount, platform, credentials), [handleApiCall]);
  
  const getAccounts = useCallback((platform, includeInactive) => 
    handleApiCall(api.getConnectedAccounts, platform, includeInactive), [handleApiCall]);
  
  const getAccount = useCallback((platform) => 
    handleApiCall(api.getAccount, platform), [handleApiCall]);
  
  const disconnectAccount = useCallback((platform) => 
    handleApiCall(api.disconnectAccount, platform), [handleApiCall]);
  
  const refreshPlatformToken = useCallback((platform) => 
    handleApiCall(api.refreshPlatformToken, platform), [handleApiCall]);

  // ==================== Posts ====================
  const createPost = useCallback((postData) => 
    handleApiCall(api.createPost, postData), [handleApiCall]);
  
  const createSocialPost = useCallback((postData) => 
    handleApiCall(api.createSocialPost, postData), [handleApiCall]);
  
  const publishPost = useCallback((postId) => 
    handleApiCall(api.publishPost, postId), [handleApiCall]);
  
  const schedulePost = useCallback((postId, scheduledTime) => 
    handleApiCall(api.schedulePost, postId, scheduledTime), [handleApiCall]);
  
  const getPosts = useCallback((options) => 
    handleApiCall(api.getPosts, options || {}), [handleApiCall]);
  
  const getPost = useCallback((postId) => 
    handleApiCall(api.getPost, postId), [handleApiCall]);
  
  const updatePost = useCallback((postId, updateData) => 
    handleApiCall(api.updatePost, postId, updateData), [handleApiCall]);
  
  const deletePost = useCallback((postId) => 
    handleApiCall(api.deletePost, postId), [handleApiCall]);

  // ==================== Analytics ====================
  const getSummary = useCallback((days) => 
    handleApiCall(api.getAnalyticsSummary, days), [handleApiCall]);
  
  const getPerformance = useCallback((postId) => 
    handleApiCall(api.getPostPerformance, postId), [handleApiCall]);
  
  const getStats = useCallback((platform, days) => 
    handleApiCall(api.getPlatformStats, platform, days), [handleApiCall]);
  
  const getTrends = useCallback((days, interval) => 
    handleApiCall(api.getEngagementTrends, days, interval), [handleApiCall]);
  
  const getTopPosts = useCallback((platform, limit, days) => 
    handleApiCall(api.getTopPosts, platform, limit, days), [handleApiCall]);
  
  const trackMetrics = useCallback((postId, platform, metrics) => 
    handleApiCall(api.trackPostMetrics, postId, platform, metrics), [handleApiCall]);

  // ==================== AI ====================
  const generatePost = useCallback((request) => 
    handleApiCall(api.generatePost, request), [handleApiCall]);
  
  const generateReply = useCallback((request) => 
    handleApiCall(api.generateReply, request), [handleApiCall]);
  
  const generateHashtags = useCallback((request) => 
    handleApiCall(api.generateHashtags, request), [handleApiCall]);
  
  const optimizeContent = useCallback((request) => 
    handleApiCall(api.optimizeContent, request), [handleApiCall]);
  
  const generateCaptions = useCallback((request) => 
    handleApiCall(api.generateCaptions, request), [handleApiCall]);
  
  const analyzeSentiment = useCallback((text) => 
    handleApiCall(api.analyzeSentiment, text), [handleApiCall]);
  
  const translateContent = useCallback((content, targetLanguage) => 
    handleApiCall(api.translateContent, content, targetLanguage), [handleApiCall]);

  // ==================== Health ====================
  const checkHealth = useCallback(() => 
    handleApiCall(api.checkHealth), [handleApiCall]);
  
  const getRootInfo = useCallback(() => 
    handleApiCall(api.getRootInfo), [handleApiCall]);
  
  const fetchEndpoints = useCallback(() => 
    handleApiCall(api.fetchAvailableEndpoints), [handleApiCall]);

  return {
    // State
    loading,
    error,
    
    // Auth
    login,
    register,
    logout,
    refreshToken,
    getCurrentUser,
    getUserProfile,
    updateProfile,
    
    // Platforms
    getPlatforms,
    getOAuthUrl,
    connectAccount,
    getAccounts,
    getAccount,
    disconnectAccount,
    refreshPlatformToken,
    
    // Posts
    createPost,
    createSocialPost,
    publishPost,
    schedulePost,
    getPosts,
    getPost,
    updatePost,
    deletePost,
    
    // Analytics
    getSummary,
    getPerformance,
    getStats,
    getTrends,
    getTopPosts,
    trackMetrics,
    
    // AI
    generatePost,
    generateReply,
    generateHashtags,
    optimizeContent,
    generateCaptions,
    analyzeSentiment,
    translateContent,
    
    // Health
    checkHealth,
    getRootInfo,
    fetchEndpoints,
  };
}

// ==================== Social Accounts Hook ====================

export function useSocialAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch available platforms
  const fetchPlatforms = useCallback(async () => {
    try {
      const result = await api.getSupportedPlatforms();
      setPlatforms(result.platforms || []);
      return result;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, []);

  // Fetch all connected accounts
  const fetchAccounts = useCallback(async (platform = null, includeInactive = false) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.getConnectedAccounts(platform, includeInactive);
      setAccounts(result.accounts || []);
      return result.accounts;
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Connect a new platform
  const connect = useCallback(async (platform, credentials) => {
    setLoading(true);
    setError(null);
    try {
      await api.connectSocialAccount(platform, credentials);
      await fetchAccounts();
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchAccounts]);

  // Disconnect a platform
  const disconnect = useCallback(async (platform) => {
    setLoading(true);
    setError(null);
    try {
      await api.disconnectAccount(platform);
      await fetchAccounts();
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchAccounts]);

  // Refresh platform token
  const refreshToken = useCallback(async (platform) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.refreshPlatformToken(platform);
      return result;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get OAuth URL for a platform
  const getOAuthUrl = useCallback(async (platform) => {
    try {
      return await api.getOAuthUrl(platform);
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, []);

  // Initialize - fetch platforms and accounts
  useEffect(() => {
    fetchPlatforms();
  }, [fetchPlatforms]);

  return {
    accounts,
    platforms,
    loading,
    error,
    fetchAccounts,
    fetchPlatforms,
    connect,
    disconnect,
    refreshToken,
    getOAuthUrl,
  };
}

// ==================== Posts Hook ====================

export function usePosts() {
  const [posts, setPosts] = useState([]);
  const [currentPost, setCurrentPost] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);

  // Fetch posts with filters
  const fetchPosts = useCallback(async (options = {}) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.getPosts(options);
      setPosts(result.posts || []);
      setPagination(result.pagination || null);
      return result.posts;
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch single post
  const fetchPost = useCallback(async (postId) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.getPost(postId);
      setCurrentPost(result);
      return result;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new post
  const create = useCallback(async (postData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.createPost(postData);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Publish immediately
  const publish = useCallback(async (postId) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.publishPost(postId);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Schedule a post
  const schedule = useCallback(async (postId, scheduledTime) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.schedulePost(postId, scheduledTime);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update a post
  const update = useCallback(async (postId, updateData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.updatePost(postId, updateData);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete a post
  const remove = useCallback(async (postId) => {
    setLoading(true);
    setError(null);
    try {
      await api.deletePost(postId);
      setPosts(posts.filter(p => p._id !== postId));
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [posts]);

  return {
    posts,
    currentPost,
    pagination,
    loading,
    error,
    fetchPosts,
    fetchPost,
    create,
    publish,
    schedule,
    update,
    remove,
  };
}

// ==================== Analytics Hook ====================

export function useAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [platformStats, setPlatformStats] = useState(null);
  const [trends, setTrends] = useState(null);
  const [topPosts, setTopPosts] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch analytics summary
  const fetchAnalytics = useCallback(async (days = 30) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.getAnalyticsSummary(days);
      setAnalytics(result);
      return result;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch platform stats
  const fetchPlatformStats = useCallback(async (platform = null, days = 30) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.getPlatformStats(platform, days);
      setPlatformStats(result);
      return result;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch engagement trends
  const fetchTrends = useCallback(async (days = 30, interval = 'day') => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.getEngagementTrends(days, interval);
      setTrends(result);
      return result;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch top posts
  const fetchTopPosts = useCallback(async (platform = null, limit = 10, days = 30) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.getTopPosts(platform, limit, days);
      setTopPosts(result.top_posts || []);
      return result;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch post performance
  const fetchPostPerformance = useCallback(async (postId) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.getPostPerformance(postId);
      return result;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Track metrics
  const trackMetrics = useCallback(async (postId, platform, metrics) => {
    try {
      return await api.trackPostMetrics(postId, platform, metrics);
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, []);

  return {
    analytics,
    platformStats,
    trends,
    topPosts,
    loading,
    error,
    fetchAnalytics,
    fetchPlatformStats,
    fetchTrends,
    fetchTopPosts,
    fetchPostPerformance,
    trackMetrics,
  };
}

// ==================== AI Generation Hook ====================

export function useAIGeneration() {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [generatedContent, setGeneratedContent] = useState(null);

  // Generate post content
  const generatePost = useCallback(async (request) => {
    setGenerating(true);
    setError(null);
    try {
      const result = await api.generatePost(request);
      setGeneratedContent(result);
      return result;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setGenerating(false);
    }
  }, []);

  // Generate reply
  const generateReply = useCallback(async (request) => {
    setGenerating(true);
    setError(null);
    try {
      const result = await api.generateReply(request);
      return result;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setGenerating(false);
    }
  }, []);

  // Generate hashtags
  const generateHashtags = useCallback(async (request) => {
    setGenerating(true);
    setError(null);
    try {
      const result = await api.generateHashtags(request);
      return result;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setGenerating(false);
    }
  }, []);

  // Optimize content
  const optimizeContent = useCallback(async (request) => {
    setGenerating(true);
    setError(null);
    try {
      const result = await api.optimizeContent(request);
      return result;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setGenerating(false);
    }
  }, []);

  // Generate captions
  const generateCaptions = useCallback(async (request) => {
    setGenerating(true);
    setError(null);
    try {
      const result = await api.generateCaptions(request);
      return result;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setGenerating(false);
    }
  }, []);

  // Analyze sentiment
  const analyzeSentiment = useCallback(async (text) => {
    setGenerating(true);
    setError(null);
    try {
      const result = await api.analyzeSentiment(text);
      return result;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setGenerating(false);
    }
  }, []);

  // Translate content
  const translate = useCallback(async (content, targetLanguage) => {
    setGenerating(true);
    setError(null);
    try {
      const result = await api.translateContent(content, targetLanguage);
      return result;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setGenerating(false);
    }
  }, []);

  return {
    generating,
    error,
    generatedContent,
    generatePost,
    generateReply,
    generateHashtags,
    optimizeContent,
    generateCaptions,
    analyzeSentiment,
    translate,
  };
}

// ==================== Auth Hook ====================

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check if user is authenticated and restore session
  useEffect(() => {
    const checkAuth = async () => {
      const hasToken = api.isAuthenticated();
      setIsAuthenticated(hasToken);
      
      // If token exists, try to fetch user profile
      if (hasToken) {
        try {
          const profile = await api.getCurrentUser();
          setUser(profile);
        } catch (err) {
          // Token might be invalid/expired, clear auth
          console.warn('Failed to fetch user profile, clearing auth:', err.message);
          api.clearAuth();
          setIsAuthenticated(false);
          setUser(null);
        }
      }
    };
    
    checkAuth();
  }, []);

  // Login
  const login = useCallback(async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.loginUser(credentials);
      setIsAuthenticated(true);
      // Fetch user profile after login
      const profile = await api.getCurrentUser();
      setUser(profile);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Register
  const register = useCallback(async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.registerUser(userData);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await api.logoutUser();
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch current user
  const fetchUser = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const profile = await api.getCurrentUser();
      setUser(profile);
      return profile;
    } catch (err) {
      setError(err.message);
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update profile
  const updateProfile = useCallback(async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.updateProfile(userData);
      setUser(result);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    fetchUser,
    updateProfile,
  };
}

// ==================== Health Check Hook ====================

export function useHealthCheck() {
  const [health, setHealth] = useState(null);
  const [endpoints, setEndpoints] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check health
  const checkHealth = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.checkHealth();
      setHealth(result);
      return result;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch available endpoints
  const fetchEndpoints = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.fetchAvailableEndpoints();
      setEndpoints(result);
      return result;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get root info
  const getRootInfo = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.getRootInfo();
      setEndpoints(result);
      return result;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    health,
    endpoints,
    loading,
    error,
    checkHealth,
    fetchEndpoints,
    getRootInfo,
  };
}

export default useAutomation;
