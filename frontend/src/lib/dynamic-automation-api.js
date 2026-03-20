let API_CONFIG = null;
let ENDPOINTS_CACHE = null;

const DEFAULT_BASE_URL = process.env.NEXT_PUBLIC_AUTOMATION_API_URL || 'http://localhost:8000';

// Get the API base URL from config or environment
function getBaseUrl() {
  if (API_CONFIG?.baseUrl) {
    return API_CONFIG.baseUrl;
  }
  return DEFAULT_BASE_URL;
}

// Set the API base URL
export function setBaseUrl(url) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('automation_api_url', url);
    API_CONFIG = { ...API_CONFIG, baseUrl: url };
  }
}

// Core fetch function with authentication
async function fetchAPI(endpoint, options = {}) {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  // Get auth token from localStorage if available
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('automation_token');
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    // Try to parse JSON, but handle cases where response might be empty or invalid
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const text = await response.text();
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = { detail: text || 'Invalid JSON response' };
      }
    } else {
      data = { detail: response.statusText || 'Non-JSON response' };
    }

    if (!response.ok) {
      // Add error type for better handling
      const error = new Error(data.detail || data.message || `API request failed with status ${response.status}`);
      error.status = response.status;
      error.isAuthError = response.status === 401 || response.status === 403;
      error.isNetworkError = !response.ok && response.status === 0;
      throw error;
    }

    return data;
  } catch (error) {
    // Add network error detection
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      error.isNetworkError = true;
      error.isAuthError = false;
    }
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

// ==================== Dynamic Endpoint Registry ====================
export const ENDPOINTS = {
  // Health & Root
  HEALTH: '/health',
  ROOT: '/',
  
  // Auth Endpoints
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
    ME_PROFILE: '/auth/me/profile',
    UPDATE_PROFILE: '/auth/me',
    DELETE_ACCOUNT: '/auth/me',
    OAUTH_INIT: (provider) => `/auth/oauth/${provider}`,
    OAUTH_CALLBACK: (provider) => `/auth/oauth/${provider}/callback`,
  },
  
  // Posts Endpoints
  POSTS: {
    CREATE: '/posts/create',
    LIST: '/posts/',  // Note: trailing slash required
    GET: (postId) => `/posts/${postId}`,
    UPDATE: (postId) => `/posts/${postId}`,
    DELETE: (postId) => `/posts/${postId}`,
    PUBLISH: (postId) => `/posts/${postId}/publish`,
    SCHEDULE: (postId) => `/posts/${postId}/schedule`,
    TRIGGER_SCHEDULED: '/posts/trigger-scheduled/',
  },
  
  // Social/Platforms Endpoints
  SOCIAL: {
    PLATFORMS: '/social/platforms',
    OAUTH_URL: (platform) => `/social/platforms/${platform}/oauth-url`,
    CONNECT: (platform) => `/social/platforms/${platform}/connect`,
    VALIDATE: (platform) => `/social/platforms/${platform}/validate`,
    ACCOUNTS: '/social/accounts',
    ACCOUNT: (platform) => `/social/accounts/${platform}`,
    DISCONNECT: (platform) => `/social/accounts/${platform}`,
    REFRESH_TOKEN: (platform) => `/social/accounts/${platform}/refresh`,
    CREATE_POST: '/social/posts',
    POSTS_LIST: '/social/posts',
    POST_DETAIL: (postId) => `/social/posts/${postId}`,
    POST_UPDATE: (postId) => `/social/posts/${postId}`,
    POST_DELETE: (postId) => `/social/posts/${postId}`,
    POST_PUBLISH: (postId) => `/social/posts/${postId}/publish`,
  },
  
  // Analytics Endpoints
  ANALYTICS: {
    SUMMARY: '/analytics/summary',
    PLATFORM_STATS: '/analytics/platform-stats',
    PERFORMANCE: (postId) => `/analytics/performance/${postId}`,
    TRENDS: '/analytics/trends',
    TOP_POSTS: '/analytics/top-posts',
    TRACK: '/analytics/track',
    TIME_SERIES: '/analytics/time-series',
    AUDIENCE_INSIGHTS: '/analytics/audience-insights',
    PREDICTIONS: '/analytics/predictions',
    ENGAGEMENT_METRICS: '/analytics/engagement-metrics',
    GROWTH_METRICS: '/analytics/growth-metrics',
  },
  
  // AI Endpoints
  AI: {
    GENERATE_POST: '/ai/generate-post',
    GENERATE_REPLY: '/ai/generate-reply',
    GENERATE_HASHTAGS: '/ai/generate-hashtags',
    GENERATE_MEDIA: '/ai/generate-media',
    OPTIMIZE_CONTENT: '/ai/optimize-content',
    GENERATE_CAPTIONS: '/ai/generate-captions',
    ANALYZE_SENTIMENT: '/ai/analyze-sentiment',
    TRANSLATE: '/ai/translate',
  },
};

// ==================== Supported Platforms ====================
export const SUPPORTED_PLATFORMS = [
  'facebook',
  'instagram', 
  'linkedin',
  'x',
  'youtube',
  'whatsapp'
];

// ==================== Health & Info API ====================
export async function checkHealth() {
  return fetchAPI(ENDPOINTS.HEALTH);
}

// Get API root info and available endpoints
export async function getRootInfo() {
  return fetchAPI(ENDPOINTS.ROOT);
}

// Fetch all available endpoints dynamically from the API
// This makes the frontend completely dynamic
export async function fetchAvailableEndpoints() {
  if (ENDPOINTS_CACHE) {
    return ENDPOINTS_CACHE;
  }
  
  try {
    const info = await getRootInfo();
    ENDPOINTS_CACHE = info;
    return info;
  } catch (error) {
    console.error('Failed to fetch endpoints:', error);
    return null;
  }
}

// ==================== Authentication API ====================

// Register a new user
export async function registerUser(userData) {
  return fetchAPI(ENDPOINTS.AUTH.REGISTER, {
    method: 'POST',
    body: JSON.stringify(userData),
  });
}

// Login user
export async function loginUser(credentials) {
  const data = await fetchAPI(ENDPOINTS.AUTH.LOGIN, {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
  
  // Store tokens if returned
  if (data.access_token && typeof window !== 'undefined') {
    localStorage.setItem('automation_token', data.access_token);
    if (data.refresh_token) {
      localStorage.setItem('automation_refresh_token', data.refresh_token);
    }
  }
  
  return data;
}

// Logout user
export async function logoutUser() {
  try {
    await fetchAPI(ENDPOINTS.AUTH.LOGOUT, {
      method: 'POST',
    });
  } finally {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('automation_token');
      localStorage.removeItem('automation_refresh_token');
    }
  }
}

// Refresh access token
export async function refreshToken(refreshToken) {
  const token = refreshToken || (typeof window !== 'undefined' ? localStorage.getItem('automation_refresh_token') : null);
  
  if (!token) {
    throw new Error('No refresh token available');
  }
  
  const data = await fetchAPI(ENDPOINTS.AUTH.REFRESH, {
    method: 'POST',
    body: JSON.stringify({ refresh_token: token }),
  });
  
  // Store new tokens
  if (data.access_token && typeof window !== 'undefined') {
    localStorage.setItem('automation_token', data.access_token);
    if (data.refresh_token) {
      localStorage.setItem('automation_refresh_token', data.refresh_token);
    }
  }
  
  return data;
}

// Get current user profile
export async function getCurrentUser() {
  return fetchAPI(ENDPOINTS.AUTH.ME);
}

// Get extended user profile with statistics
export async function getUserProfile() {
  return fetchAPI(ENDPOINTS.AUTH.ME_PROFILE);
}

// Update user profile
export async function updateProfile(userData) {
  return fetchAPI(ENDPOINTS.AUTH.UPDATE_PROFILE, {
    method: 'PUT',
    body: JSON.stringify(userData),
  });
}

// Delete user account
export async function deleteAccount(password) {
  return fetchAPI(ENDPOINTS.AUTH.DELETE_ACCOUNT, {
    method: 'DELETE',
    body: JSON.stringify({ password }),
  });
}

// Initiate OAuth flow
export async function initOAuth(provider) {
  return fetchAPI(ENDPOINTS.AUTH.OAUTH_INIT(provider));
}

// Handle OAuth callback
export async function handleOAuthCallback(provider, code, state) {
  return fetchAPI(ENDPOINTS.AUTH.OAUTH_CALLBACK(provider), {
    method: 'GET',
    // Parameters will be encoded in the URL by fetchAPI
  });
}

// ==================== Platforms API ====================
export async function getSupportedPlatforms() {
  return fetchAPI(ENDPOINTS.SOCIAL.PLATFORMS);
}

// Get OAuth URL for a specific platform
export async function getOAuthUrl(platform) {
  return fetchAPI(ENDPOINTS.SOCIAL.OAUTH_URL(platform));
}

// Connect a social platform account
export async function connectSocialAccount(platform, credentials) {
  // Build the base request - always include access_token (use bearer_token for X)
  const requestBody = {
    platform,
    access_token: credentials.access_token || credentials.bearer_token || '',
    refresh_token: credentials.refresh_token || null,
    platform_user_id: credentials.platform_user_id || null,
    platform_username: credentials.platform_username || null,
    expires_in: credentials.expires_in || null,
  };
  
  // Add extra credentials for X (Twitter)
  if (platform === 'x') {
    requestBody.bearer_token = credentials.bearer_token || credentials.access_token || '';
    requestBody.api_key = credentials.api_key || null;
    requestBody.api_secret = credentials.api_secret || null;
    requestBody.access_token_secret = credentials.access_token_secret || null;
  }
  
  return fetchAPI(ENDPOINTS.SOCIAL.CONNECT(platform), {
    method: 'POST',
    body: JSON.stringify(requestBody),
  });
}

// Validate platform credentials before connecting
export async function validatePlatformCredentials(platform, credentials) {
  // Build the base request - always include access_token (use bearer_token for X)
  const requestBody = {
    platform,
    access_token: credentials.access_token || credentials.bearer_token || '',
    platform_user_id: credentials.platform_user_id || null,
    platform_username: credentials.platform_username || null,
  };
  
  // Add extra credentials for X (Twitter)
  if (platform === 'x') {
    requestBody.bearer_token = credentials.bearer_token || credentials.access_token || '';
    requestBody.api_key = credentials.api_key || null;
    requestBody.api_secret = credentials.api_secret || null;
    requestBody.access_token_secret = credentials.access_token_secret || null;
  }
  
  return fetchAPI(ENDPOINTS.SOCIAL.VALIDATE(platform), {
    method: 'POST',
    body: JSON.stringify(requestBody),
  });
}

// Get all connected accounts
export async function getConnectedAccounts(platform = null, includeInactive = false) {
  const params = new URLSearchParams();
  if (platform) params.append('platform', platform);
  if (includeInactive) params.append('include_inactive', 'true');
  
  const queryString = params.toString();
  return fetchAPI(`${ENDPOINTS.SOCIAL.ACCOUNTS}${queryString ? '?' + queryString : ''}`);
}

// Get specific connected account
export async function getAccount(platform) {
  return fetchAPI(ENDPOINTS.SOCIAL.ACCOUNT(platform));
}

// Disconnect a social platform account
export async function disconnectAccount(platform) {
  return fetchAPI(ENDPOINTS.SOCIAL.DISCONNECT(platform), {
    method: 'DELETE',
  });
}

// Refresh platform token

export async function refreshPlatformToken(platform) {
  return fetchAPI(ENDPOINTS.SOCIAL.REFRESH_TOKEN(platform), {
    method: 'POST',
  });
}

// ==================== Posts API ====================
export async function createPost(postData) {
  return fetchAPI(ENDPOINTS.POSTS.CREATE, {
    method: 'POST',
    body: JSON.stringify(postData),
  });
}

// Get all posts with pagination and filters
export async function getPosts(options = {}) {
  const { status_filter, platform, page = 1, limit = 20 } = options;
  const params = new URLSearchParams();
  
  if (status_filter) params.append('status_filter', status_filter);
  if (platform) params.append('platform', platform);
  params.append('page', page.toString());
  params.append('limit', limit.toString());
  
  return fetchAPI(`${ENDPOINTS.POSTS.LIST}?${params.toString()}`);
}

// Get a specific post
export async function getPost(postId) {
  return fetchAPI(ENDPOINTS.POSTS.GET(postId));
}

// Update a post
export async function updatePost(postId, updateData) {
  return fetchAPI(ENDPOINTS.POSTS.UPDATE(postId), {
    method: 'PUT',
    body: JSON.stringify(updateData),
  });
}

// Delete a post
export async function deletePost(postId) {
  return fetchAPI(ENDPOINTS.POSTS.DELETE(postId), {
    method: 'DELETE',
  });
}

// Publish a post immediately
export async function publishPost(postId) {
  return fetchAPI(ENDPOINTS.POSTS.PUBLISH(postId), {
    method: 'POST',
  });
}

// Schedule a post
export async function schedulePost(postId, scheduledTime) {
  return fetchAPI(ENDPOINTS.POSTS.SCHEDULE(postId), {
    method: 'POST',
    body: JSON.stringify({ scheduled_time: scheduledTime }),
  });
}

// Trigger publishing of scheduled posts that are due
export async function triggerScheduledPosts() {
  return fetchAPI(ENDPOINTS.POSTS.TRIGGER_SCHEDULED, {
    method: 'POST',
  });
}

// ==================== Social Posts API (Alternative) ====================

// Create a post via social endpoint
export async function createSocialPost(postData) {
  return fetchAPI(ENDPOINTS.SOCIAL.CREATE_POST, {
    method: 'POST',
    body: JSON.stringify(postData),
  });
}

// Get posts via social endpoint
export async function getSocialPosts(options = {}) {
  const params = new URLSearchParams();
  
  if (options.status) params.append('status', options.status);
  if (options.platform) params.append('platform', options.platform);
  if (options.page) params.append('page', options.page.toString());
  if (options.limit) params.append('limit', options.limit.toString());
  
  const queryString = params.toString();
  return fetchAPI(`${ENDPOINTS.SOCIAL.POSTS_LIST}${queryString ? '?' + queryString : ''}`);
}

// ==================== Analytics API ====================
export async function getAnalyticsSummary(days = 30) {
  return fetchAPI(`${ENDPOINTS.ANALYTICS.SUMMARY}?days=${days}`);
}

export async function getPlatformStats(platform = null, days = 30) {
  const params = new URLSearchParams();
  params.append('days', days.toString());
  if (platform) params.append('platform', platform);
  
  return fetchAPI(`${ENDPOINTS.ANALYTICS.PLATFORM_STATS}?${params.toString()}`);
}

// Get post performance
export async function getPostPerformance(postId) {
  return fetchAPI(ENDPOINTS.ANALYTICS.PERFORMANCE(postId));
}

/**
 * Get engagement trends
 */
export async function getEngagementTrends(days = 30, interval = 'day') {
  return fetchAPI(`${ENDPOINTS.ANALYTICS.TRENDS}?days=${days}&interval=${interval}`);
}

// Get top performing posts
export async function getTopPosts(platform = null, limit = 10, days = 30) {
  const params = new URLSearchParams();
  params.append('limit', limit.toString());
  params.append('days', days.toString());
  if (platform) params.append('platform', platform);
  
  return fetchAPI(`${ENDPOINTS.ANALYTICS.TOP_POSTS}?${params.toString()}`);
}

// Track post metrics
export async function trackPostMetrics(postId, platform, metrics) {
  return fetchAPI(ENDPOINTS.ANALYTICS.TRACK, {
    method: 'POST',
    body: JSON.stringify({
      post_id: postId,
      platform,
      metrics,
    }),
  });
}

// Get time-series analytics
export async function getTimeSeriesAnalytics(options = {}) {
  const params = new URLSearchParams();
  if (options.platform) params.append('platform', options.platform);
  if (options.days) params.append('days', options.days);
  if (options.granularity) params.append('granularity', options.granularity);
  return fetchAPI(`${ENDPOINTS.ANALYTICS.TIME_SERIES}?${params.toString()}`);
}

// Get audience insights
export async function getAudienceInsights(options = {}) {
  const params = new URLSearchParams();
  if (options.platform) params.append('platform', options.platform);
  if (options.days) params.append('days', options.days);
  return fetchAPI(`${ENDPOINTS.ANALYTICS.AUDIENCE_INSIGHTS}?${params.toString()}`);
}

// Get predictive insights
export async function getPredictiveInsights(options = {}) {
  const params = new URLSearchParams();
  if (options.platform) params.append('platform', options.platform);
  if (options.days) params.append('days', options.days);
  return fetchAPI(`${ENDPOINTS.ANALYTICS.PREDICTIONS}?${params.toString()}`);
}

// Get engagement metrics for charts
export async function getEngagementMetrics(options = {}) {
  const params = new URLSearchParams();
  if (options.platform) params.append('platform', options.platform);
  if (options.days) params.append('days', options.days);
  return fetchAPI(`${ENDPOINTS.ANALYTICS.ENGAGEMENT_METRICS}?${params.toString()}`);
}

// Get growth metrics
export async function getGrowthMetrics(options = {}) {
  const params = new URLSearchParams();
  if (options.platform) params.append('platform', options.platform);
  if (options.days) params.append('days', options.days);
  return fetchAPI(`${ENDPOINTS.ANALYTICS.GROWTH_METRICS}?${params.toString()}`);
}

// ==================== AI API ====================
export async function generatePost(request) {
  return fetchAPI(ENDPOINTS.AI.GENERATE_POST, {
    method: 'POST',
    body: JSON.stringify({
      prompt: request.prompt || request.niche || '',
      niche: request.niche || request.prompt || '',
      tone: request.tone || 'professional',
      platform: request.platform || null,
      include_emoji: request.include_emoji !== false,
      include_cta: request.include_cta !== false,
      include_hashtags: request.include_hashtags !== false,
      length: request.length || 'medium',
      word_count: request.word_count || null,
    }),
  });
}

// Generate media (images/videos) using AI
export async function generateMedia(request) {
  return fetchAPI(ENDPOINTS.AI.GENERATE_MEDIA, {
    method: 'POST',
    body: JSON.stringify({
      prompt: request.prompt,
      media_type: request.media_type || 'image',
      scheduled_time: request.scheduled_time || null,
    }),
  });
}

// Generate a reply using AI
export async function generateReply(request) {
  return fetchAPI(ENDPOINTS.AI.GENERATE_REPLY, {
    method: 'POST',
    body: JSON.stringify({
      comment: request.comment,
      tone: request.tone || 'friendly',
      platform: request.platform || null,
    }),
  });
}

// Generate hashtags using AI
export async function generateHashtags(request) {
  return fetchAPI(ENDPOINTS.AI.GENERATE_HASHTAGS, {
    method: 'POST',
    body: JSON.stringify({
      content: request.content,
      niche: request.niche,
      count: request.count || 5,
    }),
  });
}

// Optimize content using AI
export async function optimizeContent(request) {
  return fetchAPI(ENDPOINTS.AI.OPTIMIZE_CONTENT, {
    method: 'POST',
    body: JSON.stringify({
      content: request.content,
      target_platform: request.target_platform,
      improve_engagement: request.improve_engagement !== false,
      shorten: request.shorten || false,
    }),
  });
}

// Generate captions using AI
export async function generateCaptions(request) {
  return fetchAPI(ENDPOINTS.AI.GENERATE_CAPTIONS, {
    method: 'POST',
    body: JSON.stringify({
      image_description: request.image_description || null,
      tone: request.tone || 'creative',
      platform: request.platform || null,
    }),
  });
}

// Analyze sentiment using AI
export async function analyzeSentiment(text) {
  return fetchAPI(ENDPOINTS.AI.ANALYZE_SENTIMENT, {
    method: 'POST',
    body: JSON.stringify({ text }),
  });
}

// Translate content using AI
export async function translateContent(content, targetLanguage) {
  return fetchAPI(ENDPOINTS.AI.TRANSLATE, {
    method: 'POST',
    body: JSON.stringify({
      content,
      target_language: targetLanguage,
    }),
  });
}

// ==================== Generic Dynamic API ====================

// Generic GET request
export async function get(endpoint, params = {}) {
  const queryString = new URLSearchParams(params).toString();
  return fetchAPI(`${endpoint}${queryString ? '?' + queryString : ''}`);
}

// Generic POST request
export async function post(endpoint, data = {}) {
  return fetchAPI(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Generic PUT request
export async function put(endpoint, data = {}) {
  return fetchAPI(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// Generic DELETE request
export async function del(endpoint) {
  return fetchAPI(endpoint, {
    method: 'DELETE',
  });
}

// ==================== Utility Functions ====================

// Get the API base URL
export function getApiBaseUrl() {
  return getBaseUrl();
}

// Set API configuration
export function setApiConfig(config) {
  API_CONFIG = { ...API_CONFIG, ...config };
}

// Check if user is authenticated
export function isAuthenticated() {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('automation_token');
}

// Get auth token
export function getAuthToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('automation_token');
}

// Set auth token
export function setAuthToken(token) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('automation_token', token);
  }
}

// Clear all auth data
export function clearAuth() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('automation_token');
    localStorage.removeItem('automation_refresh_token');
  }
}

// ==================== Export all as default ====================
export default {
  // Core
  fetchAPI,
  ENDPOINTS,
  SUPPORTED_PLATFORMS,
  
  // Health
  checkHealth,
  getRootInfo,
  fetchAvailableEndpoints,
  
  // Auth
  registerUser,
  loginUser,
  logoutUser,
  refreshToken,
  getCurrentUser,
  getUserProfile,
  updateProfile,
  deleteAccount,
  initOAuth,
  handleOAuthCallback,
  
  // Platforms
  getSupportedPlatforms,
  getOAuthUrl,
  connectSocialAccount,
  validatePlatformCredentials,
  getConnectedAccounts,
  getAccount,
  disconnectAccount,
  refreshPlatformToken,
  
  // Posts
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost,
  publishPost,
  schedulePost,
  createSocialPost,
  getSocialPosts,
  
  // Analytics
  getAnalyticsSummary,
  getPlatformStats,
  getPostPerformance,
  getEngagementTrends,
  getTopPosts,
  trackPostMetrics,
  
  // AI
  generatePost,
  generateReply,
  generateHashtags,
  optimizeContent,
  generateCaptions,
  analyzeSentiment,
  translateContent,
  
  // Generic
  get,
  post,
  put,
  del,
  
  // Utilities
  getApiBaseUrl,
  setBaseUrl,
  setApiConfig,
  isAuthenticated,
  getAuthToken,
  setAuthToken,
  clearAuth,
};
