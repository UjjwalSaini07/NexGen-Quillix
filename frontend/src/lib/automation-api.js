// Re-export from dynamic API for backward compatibility
import * as dynamicApi from './dynamic-automation-api';

const AUTOMATION_API_BASE = process.env.NEXT_PUBLIC_AUTOMATION_API_URL || 'http://localhost:8000';

// Re-export all functions
export const checkHealth = dynamicApi.checkHealth;
export const getRootInfo = dynamicApi.getRootInfo;
export const registerUser = dynamicApi.registerUser;
export const loginUser = dynamicApi.loginUser;
export const logoutUser = dynamicApi.logoutUser;
export const getSupportedPlatforms = dynamicApi.getSupportedPlatforms;
export const connectSocialAccount = dynamicApi.connectSocialAccount;
export const getConnectedAccounts = dynamicApi.getConnectedAccounts;
export const disconnectAccount = dynamicApi.disconnectAccount;
export const publishPost = dynamicApi.createSocialPost;
export const schedulePost = dynamicApi.createSocialPost;
export const getPosts = dynamicApi.getSocialPosts;
export const getPost = dynamicApi.getPost;
export const deletePost = dynamicApi.deletePost;
export const createAutomationRule = dynamicApi.post;
export const getAutomationRules = dynamicApi.get;
export const updateAutomationRule = dynamicApi.put;
export const deleteAutomationRule = dynamicApi.del;
export const toggleAutomationRule = dynamicApi.post;
export const getAnalyticsSummary = dynamicApi.getAnalyticsSummary;
export const getPostPerformance = dynamicApi.getPostPerformance;
export const getPlatformStats = dynamicApi.getPlatformStats;
export const generatePostContent = dynamicApi.generatePost;
export const generateReply = dynamicApi.generateReply;
export const getOAuthUrl = dynamicApi.getOAuthUrl;
export const handleOAuthCallback = dynamicApi.handleOAuthCallback;
export const getApiBaseUrl = () => AUTOMATION_API_BASE;
export const setApiBaseUrl = dynamicApi.setApiBaseUrl;
