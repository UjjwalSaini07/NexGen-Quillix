const AUTOMATION_API_BASE = process.env.NEXT_PUBLIC_AUTOMATION_API_URL || 'http://localhost:8000';

async function fetchAPI(endpoint, options = {}) {
  const url = `${AUTOMATION_API_BASE}${endpoint}`;
  
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

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

// ==================== Health & Info ====================
export async function checkHealth() {
  return fetchAPI('/health');
}

export async function getRootInfo() {
  return fetchAPI('/');
}

// ==================== Authentication ====================
export async function registerUser(email, password) {
  return fetchAPI('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function loginUser(email, password) {
  const data = await fetchAPI('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  
  // Store token if returned
  if (data.access_token && typeof window !== 'undefined') {
    localStorage.setItem('automation_token', data.access_token);
  }
  
  return data;
}

// Logout user
export function logoutUser() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('automation_token');
  }
}

// ==================== Social Platforms ====================
export async function getSupportedPlatforms() {
  return fetchAPI('/social/platforms');
}

export async function connectSocialAccount(platform, credentials) {
  const { access_token, refresh_token, platform_user_id, ...additionalFields } = credentials;
  
  return fetchAPI('/social/connect', {
    method: 'POST',
    body: JSON.stringify({
      platform,
      access_token,
      refresh_token: refresh_token || null,
      platform_user_id: platform_user_id || additionalFields.page_id || additionalFields.ig_user_id || additionalFields.phone_number_id || null,
    }),
  });
}

export async function getConnectedAccounts() {
  return fetchAPI('/social/accounts');
}

export async function disconnectAccount(platform) {
  return fetchAPI(`/social/accounts/${platform}`, {
    method: 'DELETE',
  });
}

// ==================== Posts ====================
export async function publishPost(content, platforms, mediaUrl = null) {
  return fetchAPI('/social/publish', {
    method: 'POST',
    body: JSON.stringify({
      content,
      platforms,
      media_url: mediaUrl,
    }),
  });
}

// Schedule a post
export async function schedulePost(content, platforms, scheduledTime, mediaUrl = null) {
  return fetchAPI('/social/schedule', {
    method: 'POST',
    body: JSON.stringify({
      content,
      platforms,
      media_url: mediaUrl,
      scheduled_time: scheduledTime,
    }),
  });
}

export async function getPosts(statusFilter = null, platformFilter = null, limit = 50) {
  const params = new URLSearchParams();
  if (statusFilter) params.append('status_filter', statusFilter);
  if (platformFilter) params.append('platform_filter', platformFilter);
  params.append('limit', limit.toString());
  
  return fetchAPI(`/social/posts?${params.toString()}`);
}

export async function getPost(postId) {
  return fetchAPI(`/social/posts/${postId}`);
}

export async function deletePost(postId) {
  return fetchAPI(`/social/posts/${postId}`, {
    method: 'DELETE',
  });
}

// ==================== Automation Rules ====================
export async function createAutomationRule(platform, trigger, action, messageTemplate = null, enabled = true) {
  return fetchAPI('/social/automation/rules', {
    method: 'POST',
    body: JSON.stringify({
      platform,
      trigger,
      action,
      message_template: messageTemplate,
      enabled,
    }),
  });
}

export async function getAutomationRules(platform = null) {
  const params = platform ? `?platform=${platform}` : '';
  return fetchAPI(`/social/automation/rules${params}`);
}

export async function updateAutomationRule(ruleId, platform, trigger, action, messageTemplate = null, enabled = true) {
  return fetchAPI(`/social/automation/rules/${ruleId}`, {
    method: 'PUT',
    body: JSON.stringify({
      platform,
      trigger,
      action,
      message_template: messageTemplate,
      enabled,
    }),
  });
}

export async function deleteAutomationRule(ruleId) {
  return fetchAPI(`/social/automation/rules/${ruleId}`, {
    method: 'DELETE',
  });
}

export async function toggleAutomationRule(ruleId) {
  return fetchAPI(`/social/automation/${ruleId}/toggle`, {
    method: 'POST',
  });
}

// ==================== Analytics ====================
export async function getAnalyticsSummary(userId) {
  return fetchAPI(`/analytics/summary?user_id=${userId}`);
}

export async function getPostPerformance(postId) {
  return fetchAPI(`/analytics/performance/${postId}`);
}


export async function getPlatformStats(userId) {
  return fetchAPI(`/analytics/platform-stats?user_id=${userId}`);
}

// ==================== AI ====================
export async function generatePostContent(niche, tone) {
  return fetchAPI('/ai/generate-post', {
    method: 'POST',
    body: JSON.stringify({ niche, tone }),
  });
}

export async function generateReply(comment) {
  return fetchAPI('/ai/generate-reply', {
    method: 'POST',
    body: JSON.stringify({ comment }),
  });
}

// ==================== OAuth ====================
export async function getOAuthUrl(platform) {
  return fetchAPI(`/social/${platform}/login`);
}

export async function handleOAuthCallback(platform, code) {
  return fetchAPI(`/social/${platform}/callback?code=${code}`);
}

// ==================== Utility ====================
export function getApiBaseUrl() {
  return AUTOMATION_API_BASE;
}

export function setApiBaseUrl(url) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('automation_api_url', url);
  }
}
