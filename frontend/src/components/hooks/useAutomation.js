import { useState, useCallback } from 'react';
import * as api from '@/lib/automation-api';

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
  const login = useCallback((email, password) => 
    handleApiCall(api.loginUser, email, password), [handleApiCall]);
  
  const register = useCallback((email, password) => 
    handleApiCall(api.registerUser, email, password), [handleApiCall]);
  
  const logout = useCallback(() => api.logoutUser(), []);

  // ==================== Platforms ====================
  const getPlatforms = useCallback(() => 
    handleApiCall(api.getSupportedPlatforms), [handleApiCall]);
  
  const connectAccount = useCallback((platform, credentials) => 
    handleApiCall(api.connectSocialAccount, platform, credentials), [handleApiCall]);
  
  const getAccounts = useCallback(() => 
    handleApiCall(api.getConnectedAccounts), [handleApiCall]);
  
  const disconnectAccount = useCallback((platform) => 
    handleApiCall(api.disconnectAccount, platform), [handleApiCall]);

  // ==================== Posts ====================
  const publishPost = useCallback((content, platforms, mediaUrl) => 
    handleApiCall(api.publishPost, content, platforms, mediaUrl), [handleApiCall]);
  
  const schedulePost = useCallback((content, platforms, scheduledTime, mediaUrl) => 
    handleApiCall(api.schedulePost, content, platforms, scheduledTime, mediaUrl), [handleApiCall]);
  
  const getPosts = useCallback((statusFilter, platformFilter, limit) => 
    handleApiCall(api.getPosts, statusFilter, platformFilter, limit), [handleApiCall]);
  
  const getPost = useCallback((postId) => 
    handleApiCall(api.getPost, postId), [handleApiCall]);
  
  const deletePost = useCallback((postId) => 
    handleApiCall(api.deletePost, postId), [handleApiCall]);

  // ==================== Automation ====================
  const createRule = useCallback((platform, trigger, action, messageTemplate, enabled) => 
    handleApiCall(api.createAutomationRule, platform, trigger, action, messageTemplate, enabled), [handleApiCall]);
  
  const getRules = useCallback((platform) => 
    handleApiCall(api.getAutomationRules, platform), [handleApiCall]);
  
  const updateRule = useCallback((ruleId, platform, trigger, action, messageTemplate, enabled) => 
    handleApiCall(api.updateAutomationRule, ruleId, platform, trigger, action, messageTemplate, enabled), [handleApiCall]);
  
  const deleteRule = useCallback((ruleId) => 
    handleApiCall(api.deleteAutomationRule, ruleId), [handleApiCall]);
  
  const toggleRule = useCallback((ruleId) => 
    handleApiCall(api.toggleAutomationRule, ruleId), [handleApiCall]);

  // ==================== Analytics ====================
  const getSummary = useCallback((userId) => 
    handleApiCall(api.getAnalyticsSummary, userId), [handleApiCall]);
  
  const getPerformance = useCallback((postId) => 
    handleApiCall(api.getPostPerformance, postId), [handleApiCall]);
  
  const getStats = useCallback((userId) => 
    handleApiCall(api.getPlatformStats, userId), [handleApiCall]);

  // ==================== AI ====================
  const generatePost = useCallback((niche, tone) => 
    handleApiCall(api.generatePostContent, niche, tone), [handleApiCall]);
  
  const generateReply = useCallback((comment) => 
    handleApiCall(api.generateReply, comment), [handleApiCall]);

  // ==================== Health ====================
  const checkHealth = useCallback(() => 
    handleApiCall(api.checkHealth), [handleApiCall]);

  return {
    // State
    loading,
    error,
    
    // Auth
    login,
    register,
    logout,
    
    // Platforms
    getPlatforms,
    connectAccount,
    getAccounts,
    disconnectAccount,
    
    // Posts
    publishPost,
    schedulePost,
    getPosts,
    getPost,
    deletePost,
    
    // Automation
    createRule,
    getRules,
    updateRule,
    deleteRule,
    toggleRule,
    
    // Analytics
    getSummary,
    getPerformance,
    getStats,
    
    // AI
    generatePost,
    generateReply,
    
    // Health
    checkHealth,
  };
}

// Hook for managing social account connections
export function useSocialAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.getConnectedAccounts();
      setAccounts(result.accounts || []);
      return result.accounts;
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const connect = useCallback(async (platform, accessToken, refreshToken, platformUserId) => {
    setLoading(true);
    setError(null);
    try {
      await api.connectSocialAccount(platform, accessToken, refreshToken, platformUserId);
      await fetchAccounts();
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchAccounts]);

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

  return {
    accounts,
    loading,
    error,
    fetchAccounts,
    connect,
    disconnect,
  };
}

// Hook for managing automation rules
export function useAutomationRules() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRules = useCallback(async (platform = null) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.getAutomationRules(platform);
      setRules(result.rules || []);
      return result.rules;
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (platform, trigger, action, messageTemplate, enabled) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.createAutomationRule(platform, trigger, action, messageTemplate, enabled);
      await fetchRules();
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchRules]);

  const remove = useCallback(async (ruleId) => {
    setLoading(true);
    setError(null);
    try {
      await api.deleteAutomationRule(ruleId);
      await fetchRules();
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchRules]);

  const toggle = useCallback(async (ruleId) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.toggleAutomationRule(ruleId);
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
    create,
    remove,
    toggle,
  };
}

export function usePosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPosts = useCallback(async (statusFilter, platformFilter, limit) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.getPosts(statusFilter, platformFilter, limit);
      setPosts(result.posts || []);
      return result.posts;
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const publish = useCallback(async (content, platforms, mediaUrl) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.publishPost(content, platforms, mediaUrl);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const schedule = useCallback(async (content, platforms, scheduledTime, mediaUrl) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.schedulePost(content, platforms, scheduledTime, mediaUrl);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

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
    loading,
    error,
    fetchPosts,
    publish,
    schedule,
    remove,
  };
}

// Hook for analytics
export function useAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAnalytics = useCallback(async (userId) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.getAnalyticsSummary(userId);
      setAnalytics(result);
      return result;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPlatformStats = useCallback(async (userId) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.getPlatformStats(userId);
      return result;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

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

  return {
    analytics,
    loading,
    error,
    fetchAnalytics,
    fetchPlatformStats,
    fetchPostPerformance,
  };
}

// Hook for AI content generation
export function useAIGeneration() {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [generatedContent, setGeneratedContent] = useState(null);

  const generatePost = useCallback(async (niche, tone) => {
    setGenerating(true);
    setError(null);
    try {
      const result = await api.generatePostContent(niche, tone);
      setGeneratedContent(result);
      return result;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setGenerating(false);
    }
  }, []);

  const generateReply = useCallback(async (comment) => {
    setGenerating(true);
    setError(null);
    try {
      const result = await api.generateReply(comment);
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
  };
}
