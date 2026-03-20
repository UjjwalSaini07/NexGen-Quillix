"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useAutomation } from '@/components/hooks/useAutomation';
import { toast } from 'react-toastify';
import { generateMedia } from '@/lib/dynamic-automation-api';

// Platform configuration with character limits and features
const PLATFORM_CONFIG = {
  facebook: {
    id: 'facebook',
    label: 'Facebook',
    color: '#1877F2',
    bgColor: 'bg-blue-600',
    hoverColor: 'hover:bg-blue-700',
    icon: '📘',
    maxChars: 63206,
    optimalLength: 80,
    supportsMedia: true,
    supportsVideo: true,
    supportsLinks: true,
    hashtags: 30,
  },
  instagram: {
    id: 'instagram',
    label: 'Instagram',
    color: '#E4405F',
    bgColor: 'bg-pink-600',
    hoverColor: 'hover:bg-pink-700',
    icon: '📸',
    maxChars: 2200,
    optimalLength: 125,
    supportsMedia: true,
    supportsVideo: true,
    supportsLinks: false,
    hashtags: 30,
  },
  linkedin: {
    id: 'linkedin',
    label: 'LinkedIn',
    color: '#0A66C2',
    bgColor: 'bg-blue-700',
    hoverColor: 'hover:bg-blue-800',
    icon: '💼',
    maxChars: 3000,
    optimalLength: 100,
    supportsMedia: true,
    supportsVideo: true,
    supportsLinks: true,
    hashtags: 3,
  },
  x: {
    id: 'x',
    label: 'X (Twitter)',
    color: '#000000',
    bgColor: 'bg-gray-900',
    hoverColor: 'hover:bg-gray-800',
    icon: '𝕏',
    maxChars: 280,
    optimalLength: 70,
    supportsMedia: true,
    supportsVideo: true,
    supportsLinks: true,
    hashtags: 3,
  },
  youtube: {
    id: 'youtube',
    label: 'YouTube',
    color: '#FF0000',
    bgColor: 'bg-red-600',
    hoverColor: 'hover:bg-red-700',
    icon: '▶️',
    maxChars: 5000,
    optimalLength: 200,
    supportsMedia: true,
    supportsVideo: true,
    supportsLinks: true,
    hashtags: 15,
  },
  whatsapp: {
    id: 'whatsapp',
    label: 'WhatsApp',
    color: '#25D366',
    bgColor: 'bg-green-500',
    hoverColor: 'hover:bg-green-600',
    icon: '💬',
    maxChars: 4096,
    optimalLength: 100,
    supportsMedia: true,
    supportsVideo: true,
    supportsLinks: true,
    hashtags: 10,
  },
};

// AI Generation options
const TONE_OPTIONS = [
  { id: 'professional', label: 'Professional', icon: '👔' },
  { id: 'friendly', label: 'Friendly', icon: '😊' },
  { id: 'humorous', label: 'Humorous', icon: '😂' },
  { id: 'inspirational', label: 'Inspirational', icon: '✨' },
  { id: 'educational', label: 'Educational', icon: '📚' },
];

const NICHE_OPTIONS = [
  { id: 'tech', label: 'Technology', icon: '💻' },
  { id: 'business', label: 'Business', icon: '💼' },
  { id: 'marketing', label: 'Marketing', icon: '📈' },
  { id: 'health', label: 'Health & Wellness', icon: '🏥' },
  { id: 'education', label: 'Education', icon: '🎓' },
  { id: 'entertainment', label: 'Entertainment', icon: '🎬' },
  { id: 'finance', label: 'Finance', icon: '💰' },
  { id: 'lifestyle', label: 'Lifestyle', icon: '🌟' },
];

export default function PostCreator({ onClose }) {
  // Core state
  const [content, setContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState('image'); // image, video
  // Default to current time for scheduling (local time, not UTC)
  const getDefaultScheduleTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5); // Add 5 minutes buffer
    // Format as YYYY-MM-DDTHH:MM (local time)
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };
  const [scheduleTime, setScheduleTime] = useState(getDefaultScheduleTime);
  const [isSchedule, setIsSchedule] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  
  // AI Panel State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiGenerating, setAIGenerating] = useState(false);
  const [generatedVariations, setGeneratedVariations] = useState([]);
  const [selectedVariation, setSelectedVariation] = useState(0);
  const [activeTab, setActiveTab] = useState('create'); // create, ai, preview
  const [selectedNiche, setSelectedNiche] = useState('tech'); // Default niche
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [showMediaPreview, setShowMediaPreview] = useState(false);
  const [postVariations, setPostVariations] = useState({}); // Platform-specific content
  const [hashtagSuggestions, setHashtagSuggestions] = useState([]);
  const [showScheduler, setShowScheduler] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  
  // Word count for AI generation
  const [aiWordCount, setAiWordCount] = useState(150); // Default 150 words
  const [numVariations, setNumVariations] = useState(1); // Default 1 variation
  const [selectedTone, setSelectedTone] = useState('friendly'); // Default tone
  const [mediaSuggestions, setMediaSuggestions] = useState([]); // AI media suggestions
  const [selectedMedia, setSelectedMedia] = useState(null); // Selected media URL
  const [isGeneratingMedia, setIsGeneratingMedia] = useState(false);
  const [includeMedia, setIncludeMedia] = useState(false); // Whether to include media
  const [aiMediaType, setAiMediaType] = useState('none'); // image or video for AI
  const [previewMedia, setPreviewMedia] = useState(null); // Media preview modal
  
  const { createPost, publishPost, schedulePost, generatePost } = useAutomation();
  
  // Load draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('postCreatorDraft');
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        setContent(draft.content || '');
        setMediaUrl(draft.mediaUrl || '');
        setSelectedPlatforms(draft.selectedPlatforms || []);
        if (draft.content || draft.mediaUrl) {
          toast.info('Draft restored from previous session');
        }
      } catch (e) {
        console.error('Error loading draft:', e);
      }
    }
  }, []);
  
  // Auto-save draft
  useEffect(() => {
    if (content || mediaUrl) {
      setIsDirty(true);
      const draft = { content, mediaUrl, selectedPlatforms };
      localStorage.setItem('postCreatorDraft', JSON.stringify(draft));
      setDraftSaved(true);
      setTimeout(() => setDraftSaved(false), 2000);
    }
  }, [content, mediaUrl, selectedPlatforms]);
  
  // Character count for selected platforms
  const getCharacterLimit = useCallback(() => {
    if (selectedPlatforms.length === 0) return 280;
    const limits = selectedPlatforms.map(p => PLATFORM_CONFIG[p]?.maxChars || 280);
    return Math.min(...limits);
  }, [selectedPlatforms]);
  
  // Optimal length for selected platforms
  const getOptimalLength = useCallback(() => {
    if (selectedPlatforms.length === 0) return 280;
    const lengths = selectedPlatforms.map(p => PLATFORM_CONFIG[p]?.optimalLength || 100);
    return Math.min(...lengths);
  }, [selectedPlatforms]);
  
  // Get character count status
  const getCharacterStatus = useCallback(() => {
    const limit = getCharacterLimit();
    const percentage = (content.length / limit) * 100;
    if (percentage < 80) return 'good';
    if (percentage < 100) return 'warning';
    return 'error';
  }, [content, getCharacterLimit]);
  
  // Toggle platform selection
  const togglePlatform = (platformId) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platformId)
        ? prev.filter((p) => p !== platformId)
        : [...prev, platformId]
    );
  };
  
  // Select all platforms
  const selectAllPlatforms = () => {
    setSelectedPlatforms(Object.keys(PLATFORM_CONFIG));
  };
  
  // Clear all platforms
  const clearPlatforms = () => {
    setSelectedPlatforms([]);
  };
  
  // Generate platform-specific variations
  const generateVariations = useCallback(() => {
    const variations = {};
    selectedPlatforms.forEach(platform => {
      const config = PLATFORM_CONFIG[platform];
      let platformContent = content;
      
      // Adjust content based on platform limits
      if (platformContent.length > config.maxChars) {
        platformContent = platformContent.substring(0, config.maxChars - 10) + '...';
      }
      
      // Add platform-specific hashtags if needed
      if (config.hashtags && !platformContent.includes('#')) {
        const hashtags = hashtagSuggestions.slice(0, config.hashtags).join(' ');
        platformContent = platformContent + '\n\n' + hashtags;
      }
      
      variations[platform] = platformContent;
    });
    setPostVariations(variations);
    return variations;
  }, [content, selectedPlatforms, hashtagSuggestions]);
  
  // Handle AI content generation with simple prompt
  const handleGenerateContent = async () => {
    if (!aiPrompt.trim()) {
      toast.error('Please enter a topic or prompt');
      return;
    }
    
    setAIGenerating(true);
    setError(null);
    try {
      // Generate multiple variations by making multiple API calls
      const variations = [];
      
      for (let i = 0; i < numVariations; i++) {
        const response = await generatePost({ 
          prompt: aiPrompt,
          word_count: aiWordCount,
          tone: selectedTone,
          length: aiWordCount <= 100 ? 'short' : aiWordCount <= 250 ? 'medium' : 'long',
        });
        
        if (response && response.content) {
          variations.push({
            id: i,
            content: response.content,
          });
        }
      }
      
      if (variations.length > 0) {
        setGeneratedVariations(variations);
        setSelectedVariation(0);
        setContent(variations[0]?.content || '');
        toast.success(`AI generated ${variations.length} variations with ${aiWordCount} words!`);
      } else {
        setError('Failed to generate content');
      }
      
      // Generate relevant media only if user wants media
      if (includeMedia && aiPrompt.trim()) {
        try {
          setIsGeneratingMedia(true);
          
          // Calculate scheduled time if post is scheduled
          let scheduledTime = null;
          if (isSchedule && scheduleTime) {
            const scheduleDate = new Date(scheduleTime);
            const year = scheduleDate.getFullYear();
            const month = String(scheduleDate.getMonth() + 1).padStart(2, '0');
            const day = String(scheduleDate.getDate()).padStart(2, '0');
            const hours = String(scheduleDate.getHours()).padStart(2, '0');
            const minutes = String(scheduleDate.getMinutes()).padStart(2, '0');
            const seconds = String(scheduleDate.getSeconds()).padStart(2, '0');
            scheduledTime = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
          }
          
          const mediaResponse = await generateMedia({
            prompt: aiPrompt,
            media_type: aiMediaType,
            scheduled_time: scheduledTime,
          });
          
          if (mediaResponse && mediaResponse.media_urls && mediaResponse.media_urls.length > 0) {
            setMediaSuggestions(mediaResponse.media_urls);
            setSelectedMedia(mediaResponse.media_urls[0]);
            setMediaUrl(mediaResponse.media_urls[0].url);
            toast.success(`AI found ${mediaResponse.media_urls.length} relevant ${aiMediaType === 'video' ? 'videos' : 'images'}!`);
          }
        } catch (mediaErr) {
          console.error('Media generation error:', mediaErr);
        } finally {
          setIsGeneratingMedia(false);
        }
      }
      
    } catch (err) {
      setError(err.message || 'Failed to generate content');
      toast.error('AI generation failed');
    } finally {
      setAIGenerating(false);
    }
  };
  
  // Add hashtag
  const addHashtag = (hashtag) => {
    const formattedTag = hashtag.startsWith('#') ? hashtag : `#${hashtag}`;
    if (!content.includes(formattedTag)) {
      setContent(prev => prev + (prev ? ' ' : '') + formattedTag);
    }
  };
  
  // Copy content to clipboard
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy');
    }
  };
  
  // Clear draft
  const clearDraft = () => {
    localStorage.removeItem('postCreatorDraft');
    setContent('');
    setMediaUrl('');
    setSelectedPlatforms([]);
    setPostVariations({});
    setHashtagSuggestions([]);
    setGeneratedVariations([]);
    setResult(null);
    setError(null);
    setIsDirty(false);
    toast.info('Draft cleared');
  };
  
  // Main form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      // Validation
      if (!content.trim()) {
        toast.error('Please enter some content for your post');
        throw new Error('Please enter some content');
      }
      
      if (content.length > getCharacterLimit()) {
        toast.error(`Content exceeds maximum length of ${getCharacterLimit()} characters`);
        throw new Error('Content too long');
      }
      
      if (selectedPlatforms.length === 0) {
        toast.error('Please select at least one platform');
        throw new Error('No platforms selected');
      }
      
      // Check character limits for each platform
      for (const platform of selectedPlatforms) {
        const limit = PLATFORM_CONFIG[platform]?.maxChars;
        if (content.length > limit) {
          throw new Error(`Content exceeds ${PLATFORM_CONFIG[platform].label} limit of ${limit} characters`);
        }
      }
      
      // Prepare post data
      const postData = {
        content: content,
        platforms: selectedPlatforms,
        media_urls: mediaUrl ? [mediaUrl] : [],
        media_type: mediaUrl ? mediaType : null,
        is_draft: false,
      };
      
      // Add scheduled time if scheduling is enabled
      if (isSchedule && scheduleTime) {
        const scheduleDate = new Date(scheduleTime);
        if (scheduleDate <= new Date()) {
          throw new Error('Scheduled time must be in the future');
        }
        // Store as local ISO string without timezone conversion
        // Format: YYYY-MM-DDTHH:MM:SS (local time)
        const year = scheduleDate.getFullYear();
        const month = String(scheduleDate.getMonth() + 1).padStart(2, '0');
        const day = String(scheduleDate.getDate()).padStart(2, '0');
        const hours = String(scheduleDate.getHours()).padStart(2, '0');
        const minutes = String(scheduleDate.getMinutes()).padStart(2, '0');
        const seconds = String(scheduleDate.getSeconds()).padStart(2, '0');
        postData.scheduled_time = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
      }
      
      // Create post
      const response = await createPost(postData);
      
      // Handle publishing
      if (!isSchedule && response?.post_id) {
        const publishResult = await publishPost(response.post_id);
        console.log('Publish result:', publishResult);
        
        // Show platform-specific results
        if (publishResult?.results) {
          const successCount = publishResult.results.filter(r => r.status === 'success').length;
          const failCount = publishResult.results.filter(r => r.status === 'error').length;
          
          if (failCount > 0) {
            const failedPlatforms = publishResult.results
              .filter(r => r.status === 'error')
              .map(r => `${PLATFORM_CONFIG[r.platform]?.icon || ''} ${r.platform}`)
              .join(', ');
            
            toast.warning(`Posted to ${successCount} platform(s). Failed: ${failedPlatforms}`);
          } else {
            toast.success(`Posted successfully to all ${successCount} platform(s)!`);
          }
          
          // Show individual platform errors
          publishResult.results.forEach(r => {
            if (r.status === 'error') {
              console.error(`${r.platform} error:`, r.message);
            }
          });
        }
      } else if (isSchedule) {
        toast.success('Post scheduled successfully!');
      } else {
        toast.success('Post created successfully!');
      }
      
      // Clear form on success
      setResult(response);
      clearDraft();
      
      // Close the modal if onClose callback is provided
      if (onClose) {
        setTimeout(() => onClose(), 1500);
      }
      
    } catch (err) {
      console.error('Error:', err);
      const errorMessage = err.message || 'Failed to create post';
      
      // Handle specific errors
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError') || errorMessage.includes('Network request failed')) {
        toast.error('Cannot connect to server. Please ensure the automation server is running.');
        setError('Server unreachable. Check if the backend is running on port 8000.');
      } else if (errorMessage.includes('account not connected')) {
        toast.error('Please connect your social accounts first');
        setError(errorMessage);
      } else if (errorMessage.includes('permission')) {
        toast.error('Permission denied. Please check your account permissions.');
        setError(errorMessage);
      } else {
        toast.error(errorMessage);
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Calculate progress
  const completionProgress = () => {
    let score = 0;
    if (content.trim()) score += 40;
    if (selectedPlatforms.length > 0) score += 30;
    if (mediaUrl) score += 20;
    if (isSchedule && scheduleTime) score += 10;
    return score;
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 shadow-2xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Create Post</h2>
        <div className="flex items-center gap-3">
          {draftSaved && (
            <span className="text-xs text-green-400">✓ Draft saved</span>
          )}
          {isDirty && (
            <button
              onClick={clearDraft}
              className="text-xs text-gray-400 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Completion</span>
          <span>{completionProgress()}%</span>
        </div>
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
            style={{ width: `${completionProgress()}%` }}
          />
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { id: 'create', label: '✏️ Create' },
          { id: 'ai', label: '🤖 AI Generate' },
          { id: 'preview', label: '👁️ Preview' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === tab.id 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Platform Selection - Only show in Create tab */}
        {activeTab === 'create' && (
        <div className="bg-gray-900/50 rounded-lg p-4">
          <div className="flex justify-between items-center mb-3">
            <label className="text-sm font-medium text-gray-300">
              Select Platforms ({selectedPlatforms.length} selected)
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={selectAllPlatforms}
                className="text-xs text-blue-400 hover:text-blue-300"
              >
                Select All
              </button>
              <span className="text-gray-600">|</span>
              <button
                type="button"
                onClick={clearPlatforms}
                className="text-xs text-gray-400 hover:text-white"
              >
                Clear
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.values(PLATFORM_CONFIG).map((platform) => (
              <button
                key={platform.id}
                type="button"
                onClick={() => togglePlatform(platform.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105 ${
                  selectedPlatforms.includes(platform.id)
                    ? platform.bgColor + ' text-white shadow-lg'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                style={selectedPlatforms.includes(platform.id) ? { backgroundColor: platform.color } : {}}
              >
                <span className="mr-1">{platform.icon}</span>
                {platform.label}
              </button>
            ))}
          </div>
          
          {/* Platform-specific limits warning */}
          {selectedPlatforms.length > 0 && (
            <div className="mt-3 text-xs text-gray-500">
              Character limit: {getCharacterLimit().toLocaleString()} | Optimal: {getOptimalLength()} chars
            </div>
          )}
        </div>
        )}
        
        {/* Content Tab */}
        {activeTab === 'create' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Post Content
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's on your mind? Start typing or use AI to generate..."
                className="w-full h-48 bg-gray-900 text-white rounded-lg p-4 border border-gray-700 focus:border-blue-500 focus:outline-none resize-none transition-all"
                maxLength={getCharacterLimit() + 100}
              />
              
              {/* Character count bar */}
              <div className="mt-2">
                <div className="flex justify-between text-xs mb-1">
                  <span className={
                    getCharacterStatus() === 'good' ? 'text-green-400' :
                    getCharacterStatus() === 'warning' ? 'text-yellow-400' : 'text-red-400'
                  }>
                    {content.length} / {getCharacterLimit().toLocaleString()} characters
                  </span>
                  {content.length >= getOptimalLength() && (
                    <span className="text-blue-400">✓ Optimal length</span>
                  )}
                </div>
                <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all ${
                      getCharacterStatus() === 'good' ? 'bg-green-500' :
                      getCharacterStatus() === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min((content.length / getCharacterLimit()) * 100, 100)}%` }}
                  />
                </div>
              </div>
              
              {/* Quick actions */}
              <div className="flex justify-between items-center mt-3">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('ai');
                      setShowAIPanel(false);
                    }}
                    className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
                  >
                    ✨ Generate with AI
                  </button>
                </div>
              </div>
              
              {/* AI Panel */}
              {showAIPanel && (
                <div className="mt-4 p-4 bg-gray-800 rounded-lg border border-gray-600">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Tone</label>
                      <select
                        value={selectedTone}
                        onChange={(e) => setSelectedTone(e.target.value)}
                        className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm"
                      >
                        {TONE_OPTIONS.map(opt => (
                          <option key={opt.id} value={opt.id}>{opt.icon} {opt.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Niche</label>
                      <select
                        value={selectedNiche}
                        onChange={(e) => setSelectedNiche(e.target.value)}
                        className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm"
                      >
                        {NICHE_OPTIONS.map(opt => (
                          <option key={opt.id} value={opt.id}>{opt.icon} {opt.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleGenerateContent}
                    disabled={aiGenerating || !aiPrompt.trim()}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 disabled:opacity-50"
                  >
                    {aiGenerating ? '🤖 Generating...' : '🚀 Generate with AI'}
                  </button>
                </div>
              )}
            </div>
            
            {/* Media URL */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Media URL (Optional)
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="flex-1 bg-gray-900 text-white rounded-lg p-3 border border-gray-700 focus:border-blue-500 focus:outline-none"
                />
                {mediaUrl && (
                  <button
                    type="button"
                    onClick={() => setShowMediaPreview(!showMediaPreview)}
                    className="px-4 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                  >
                    {showMediaPreview ? 'Hide' : 'Preview'}
                  </button>
                )}
              </div>
              
              {/* Media type selection */}
              {mediaUrl && (
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center gap-2 text-sm text-gray-400">
                    <input
                      type="radio"
                      name="mediaType"
                      value="image"
                      checked={mediaType === 'image'}
                      onChange={(e) => setMediaType(e.target.value)}
                      className="text-blue-500"
                    />
                    🖼️ Image
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-400">
                    <input
                      type="radio"
                      name="mediaType"
                      value="video"
                      checked={mediaType === 'video'}
                      onChange={(e) => setMediaType(e.target.value)}
                      className="text-blue-500"
                    />
                    🎬 Video
                  </label>
                </div>
              )}
              
              {/* Media preview */}
              {showMediaPreview && mediaUrl && (
                <div className="mt-3 p-3 bg-gray-900 rounded-lg">
                  {mediaType === 'image' ? (
                    <img 
                      src={mediaUrl} 
                      alt="Preview" 
                      className="max-h-48 rounded mx-auto"
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  ) : (
                    <video 
                      src={mediaUrl} 
                      className="max-h-48 rounded mx-auto"
                      controls
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* AI Tab */}
        {activeTab === 'ai' && (
          <div className="space-y-4">
            {/* Simple Prompt Input */}
            <div>
              <label className="text-sm text-gray-400 mb-2 block">
                📝 What do you want to post about?
              </label>
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g., Launching our new AI product, Tips for remote work, Happy Diwali wishes..."
                className="w-full h-32 bg-gray-900 text-white rounded-lg p-4 border border-gray-700 focus:border-purple-500 focus:outline-none resize-none"
              />
              <p className="text-xs text-gray-500 mt-2">
                Enter a short description or topic, and our AI will create engaging content for you!
              </p>
            </div>
            
            {/* Word Count Slider */}
            <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50">
              <div className="flex justify-between items-center mb-3">
                <label className="text-sm text-gray-300 font-medium">
                  📊 Number of Words
                </label>
                <span className="bg-purple-600/20 text-purple-400 px-3 py-1 rounded-full text-sm font-semibold">
                  {aiWordCount} words
                </span>
              </div>
              <input
                type="range"
                min={10}
                max={1000}
                step={10}
                value={aiWordCount}
                onChange={(e) => setAiWordCount(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-thumb-purple"
                style={{
                  background: `linear-gradient(to right, #9333ea 0%, #9333ea ${(aiWordCount/1000)*100}%, #374151 ${(aiWordCount/1000)*100}%, #374151 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>10</span>
                <span>250</span>
                <span>500</span>
                <span>750</span>
                <span>1000</span>
              </div>
            </div>
            
            {/* Number of Variations Slider */}
            <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50">
              <div className="flex justify-between items-center mb-3">
                <label className="text-sm text-gray-300 font-medium">
                  🎨 Number of Variations
                </label>
                <span className="bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full text-sm font-semibold">
                  {numVariations} {numVariations === 1 ? 'variation' : 'variations'}
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                step={1}
                value={numVariations}
                onChange={(e) => setNumVariations(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer variation-slider"
                style={{
                  background: `linear-gradient(to right, #2563eb 0%, #2563eb ${((numVariations-1)/9)*100}%, #374151 ${((numVariations-1)/9)*100}%, #374151 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>1</span>
                <span>3</span>
                <span>5</span>
                <span>7</span>
                <span>10</span>
              </div>
              <p className="text-xs text-gray-400 mt-3">
                💡 Coming soon: Generate multiple variations and pick the best one!
              </p>
            </div>
            
            {/* Tone Selector */}
            <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50">
              <div className="flex justify-between items-center mb-3">
                <label className="text-sm text-gray-300 font-medium">
                  🎭 Select Tone
                </label>
                <span className="bg-green-600/20 text-green-400 px-3 py-1 rounded-full text-sm font-semibold">
                  {TONE_OPTIONS.find(t => t.id === selectedTone)?.icon} {TONE_OPTIONS.find(t => t.id === selectedTone)?.label}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {TONE_OPTIONS.map((tone) => (
                  <button
                    key={tone.id}
                    type="button"
                    onClick={() => setSelectedTone(tone.id)}
                    className={`py-2 px-2 rounded-lg text-sm font-medium transition-all flex flex-col items-center gap-1 ${
                      selectedTone === tone.id
                        ? 'bg-green-600 text-white shadow-lg shadow-green-600/30'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    <span className="text-lg">{tone.icon}</span>
                    <span>{tone.label}</span>
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-3">
                ✨ Content will be generated with a {TONE_OPTIONS.find(t => t.id === selectedTone)?.label.toLowerCase()} tone
              </p>
            </div>
            
            {/* Media Type Selector */}
            <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50">
              <div className="flex justify-between items-center mb-3">
                <label className="text-sm text-gray-300 font-medium">
                  🖼️ Include Media
                </label>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  aiMediaType === 'none' 
                    ? 'bg-gray-600/20 text-gray-400' 
                    : aiMediaType === 'image'
                      ? 'bg-blue-600/20 text-blue-400'
                      : 'bg-red-600/20 text-red-400'
                }`}>
                  {aiMediaType === 'none' ? '🚫 No Media' : aiMediaType === 'image' ? '🖼️ Image' : '🎬 Video'}
                </span>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                {/* No Media Option */}
                <button
                  type="button"
                  onClick={() => {
                    setAiMediaType('none');
                    setIncludeMedia(false);
                    setMediaSuggestions([]);
                  }}
                  className={`py-3 px-3 rounded-xl text-sm font-medium transition-all flex flex-col items-center gap-2 ${
                    aiMediaType === 'none'
                      ? 'bg-gray-600 text-white shadow-lg shadow-gray-600/30 border-2 border-gray-400'
                      : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700 border-2 border-transparent'
                  }`}
                >
                  <span className="text-2xl">🚫</span>
                  <span>No Media</span>
                </button>
                
                {/* Image Option */}
                <button
                  type="button"
                  onClick={() => {
                    setAiMediaType('image');
                    setIncludeMedia(true);
                  }}
                  className={`py-3 px-3 rounded-xl text-sm font-medium transition-all flex flex-col items-center gap-2 ${
                    aiMediaType === 'image'
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 border-2 border-blue-400'
                      : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700 border-2 border-transparent'
                  }`}
                >
                  <span className="text-2xl">🖼️</span>
                  <span>Image</span>
                </button>
                
                {/* Video Option */}
                <button
                  type="button"
                  onClick={() => {
                    setAiMediaType('video');
                    setIncludeMedia(true);
                  }}
                  className={`py-3 px-3 rounded-xl text-sm font-medium transition-all flex flex-col items-center gap-2 ${
                    aiMediaType === 'video'
                      ? 'bg-red-600 text-white shadow-lg shadow-red-600/30 border-2 border-red-400'
                      : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700 border-2 border-transparent'
                  }`}
                >
                  <span className="text-2xl">🎬</span>
                  <span>Video</span>
                </button>
              </div>
              
              {aiMediaType !== 'none' && (
                <p className="text-xs text-gray-400 mt-3">
                  ✨ AI will search and find the most relevant {aiMediaType === 'video' ? 'videos' : 'images'} based on your prompt
                </p>
              )}
              
              {aiMediaType === 'none' && (
                <p className="text-xs text-gray-400 mt-3">
                  📝 Your post will be text-only with no media attachments
                </p>
              )}
            </div>
            
            
            <button
              type="button"
              onClick={handleGenerateContent}
              disabled={aiGenerating || !aiPrompt.trim()}
              className={`w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 transition-all transform hover:scale-[1.02] ${
                aiMediaType === 'none' ? 'from-gray-600 to-gray-700' : ''
              }`}
            >
              {aiGenerating ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">🤖</span>
                  {aiMediaType === 'none' ? 'Generating Content...' : aiMediaType === 'image' ? 'Creating Content & Finding Images...' : 'Creating Content & Finding Videos...'}
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  {aiMediaType === 'none' ? '✨ Generate Content' : aiMediaType === 'image' ? '🖼️ Generate Content & Images' : '🎬 Generate Content & Videos'}
                </span>
              )}
            </button>
            
            {/* AI-Generated Media Suggestions */}
            {(mediaSuggestions.length > 0 || isGeneratingMedia) && (
              <div className="mt-4 bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm text-gray-300 font-medium">
                    {aiMediaType === 'video' ? '🎬' : '🖼️'} AI-Generated {aiMediaType === 'video' ? 'Videos' : 'Images'}
                  </label>
                  {isGeneratingMedia && (
                    <span className="text-xs text-yellow-400 animate-pulse">
                      🔄 Finding relevant {aiMediaType === 'video' ? 'videos' : 'images'}...
                    </span>
                  )}
                </div>
                
                {mediaSuggestions.length > 0 && (
                  <>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {mediaSuggestions.map((media, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setSelectedMedia(media);
                            setMediaUrl(media.url);
                            // Set media type based on the media's type
                            setMediaType(media.type === 'video' ? 'video' : 'image');
                          }}
                          onDoubleClick={() => {
                            // Double-click to preview
                            setPreviewMedia(media);
                          }}
                          className={`relative rounded-lg overflow-hidden border-2 transition-all group ${
                            selectedMedia?.url === media.url
                              ? 'border-green-500 ring-2 ring-green-500/30'
                              : 'border-transparent hover:border-gray-500'
                          }`}
                        >
                          {/* Show video indicator for videos */}
                          {media.type === 'video' && (
                            <div className="absolute top-1 left-1 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-1 z-10">
                              <span>🎬</span>
                              {media.duration && <span>{Math.floor(media.duration / 60)}:{String(media.duration % 60).padStart(2, '0')}</span>}
                            </div>
                          )}
                          
                          <img
                            src={media.thumb_url || media.url}
                            alt={media.description || 'Media suggestion'}
                            className="w-full h-20 object-cover"
                          />
                          
                          {/* Play button overlay for videos */}
                          {media.type === 'video' && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center">
                                <span className="text-red-600 text-lg">▶</span>
                              </div>
                            </div>
                          )}
                          
                          {selectedMedia?.url === media.url && (
                            <div className="absolute top-1 right-1 bg-green-500 text-white text-xs px-1 rounded z-10">
                              ✓
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                    
                    {selectedMedia && (
                      <div className="text-xs text-gray-400">
                        {selectedMedia.type === 'video' ? (
                          <p>🎬 Video from {selectedMedia.source}</p>
                        ) : (
                          <p>📷 Photo by {selectedMedia.photographer} on {selectedMedia.source}</p>
                        )}
                        {selectedMedia.description && <p>📝 {selectedMedia.description}</p>}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
            
            {/* Generated content */}
            {generatedVariations.length > 0 && (
              <div className="mt-6">
                <h3 className="text-white font-medium mb-3">Generated Content</h3>
                <div className="space-y-3">
                  {generatedVariations.map((variation, idx) => (
                    <div
                      key={variation.id}
                      onClick={() => {
                        setSelectedVariation(idx);
                        setContent(variation.content);
                      }}
                      className={`p-4 rounded-lg cursor-pointer transition-all ${
                        selectedVariation === idx
                          ? 'bg-blue-600/30 border-2 border-blue-500'
                          : 'bg-gray-700/50 border-2 border-transparent hover:border-gray-500'
                      }`}
                    >
                      <p className="text-white text-sm">{variation.content}</p>
                      <div className="mt-2 flex justify-between items-center">
                        <span className="text-xs text-gray-400">{variation.tone}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(variation.content);
                          }}
                          className="text-xs text-blue-400 hover:text-blue-300"
                        >
                          📋 Copy
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Preview Tab */}
        {activeTab === 'preview' && (
          <div className="space-y-4">
            <h3 className="text-white font-medium">Platform Previews</h3>
            
            {selectedPlatforms.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Select platforms to see previews
              </div>
            ) : (
              <div className="space-y-4">
                {selectedPlatforms.map(platformId => {
                  const config = PLATFORM_CONFIG[platformId];
                  const previewContent = postVariations[platformId] || content;
                  
                  return (
                    <div
                      key={platformId}
                      className="bg-gray-900 rounded-lg p-4 border-l-4"
                      style={{ borderLeftColor: config.color }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{config.icon}</span>
                        <span className="font-medium text-white">{config.label}</span>
                        <span className="text-xs text-gray-500">
                          {previewContent.length}/{config.maxChars}
                        </span>
                      </div>
                      <div className="bg-gray-800 rounded p-3 text-white text-sm whitespace-pre-wrap">
                        {previewContent || 'No content yet...'}
                      </div>
                      {mediaUrl && config.supportsMedia && (
                        <div className="mt-2 text-xs text-green-400">
                          ✓ Media will be attached
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
        
        {/* Schedule Toggle */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowScheduler(!showScheduler)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              showScheduler ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300'
            }`}
          >
            <span>📅</span>
            {showScheduler 
              ? scheduleTime 
                ? `Scheduled: ${new Date(scheduleTime).toLocaleString()}` 
                : 'Scheduling Enabled' 
              : 'Schedule Post'}
          </button>
        </div>
        
        {/* Schedule Time */}
        {showScheduler && (
          <div className="bg-gray-900/50 p-4 rounded-lg">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Schedule Date & Time
            </label>
            <div className="flex gap-2">
              <input
                type="date"
                value={scheduleTime ? scheduleTime.split('T')[0] : new Date().toISOString().split('T')[0]}
                onChange={(e) => {
                  const timePart = scheduleTime ? scheduleTime.split('T')[1]?.substring(0, 5) : getDefaultScheduleTime().split('T')[1];
                  setScheduleTime(`${e.target.value}T${timePart}:00`);
                  setIsSchedule(true);
                }}
                min={new Date().toISOString().split('T')[0]}
                className="flex-1 bg-gray-900 text-white rounded-lg p-3 border border-gray-700 focus:border-green-500 focus:outline-none"
              />
              <input
                type="time"
                value={scheduleTime ? scheduleTime.split('T')[1]?.substring(0, 5) : getDefaultScheduleTime().split('T')[1]}
                onChange={(e) => {
                  const datePart = scheduleTime ? scheduleTime.split('T')[0] : new Date().toISOString().split('T')[0];
                  setScheduleTime(`${datePart}T${e.target.value}:00`);
                  setIsSchedule(true);
                }}
                min={scheduleTime && scheduleTime.split('T')[0] === new Date().toISOString().split('T')[0] 
                  ? new Date().toTimeString().slice(0, 5) 
                  : '00:00'}
                className="flex-1 bg-gray-900 text-white rounded-lg p-3 border border-gray-700 focus:border-green-500 focus:outline-none"
              />
              <select
                value={scheduleTime && parseInt(scheduleTime.split('T')[1]?.split(':')[0] || '0') >= 12 ? 'PM' : 'AM'}
                onChange={(e) => {
                  if (!scheduleTime) return;
                  const [datePart, timePart] = scheduleTime.split('T');
                  let [hours, minutes] = timePart.split(':');
                  hours = parseInt(hours);
                  if (e.target.value === 'PM' && hours < 12) hours += 12;
                  if (e.target.value === 'AM' && hours >= 12) hours -= 12;
                  setScheduleTime(`${datePart}T${String(hours).padStart(2, '0')}:${minutes}:00`);
                  setIsSchedule(true);
                }}
                className="bg-gray-900 text-white rounded-lg p-3 border border-gray-700 focus:border-green-500 focus:outline-none"
              >
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
          </div>
        )}
        
        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-500/20 border border-red-500 rounded-lg">
            <div className="flex items-start gap-2">
              <span className="text-red-400">⚠️</span>
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          </div>
        )}
        
        {/* Success Message */}
        {result && (
          <div className="p-4 bg-green-500/20 border border-green-500 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-green-400">✅</span>
              <p className="text-green-400">{result.message || 'Post published successfully!'}</p>
            </div>
          </div>
        )}
        
        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || completionProgress() < 50}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02]"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">⏳</span>
              Processing...
            </span>
          ) : isSchedule ? (
            '📅 Schedule Post'
          ) : (
            '🚀 Publish Now'
          )}
        </button>
        
        {/* Tips */}
        {selectedPlatforms.length > 0 && (
          <div className="text-xs text-gray-500 text-center mt-2">
            Tip: {selectedPlatforms.map(p => PLATFORM_CONFIG[p].label).join(', ')} work best with{' '}
            {getOptimalLength()}-{getCharacterLimit()} characters
          </div>
        )}
      </form>
      
      {/* Media Preview Modal */}
      {previewMedia && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setPreviewMedia(null)}>
          <div className="relative max-w-4xl w-full max-h-[90vh] bg-gray-900 rounded-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Close button */}
            <button
              onClick={() => setPreviewMedia(null)}
              className="absolute top-3 right-3 z-10 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white text-xl transition-colors"
            >
              ✕
            </button>
            
            {/* Media content */}
            {previewMedia.type === 'video' ? (
              <video
                src={previewMedia.url}
                controls
                autoPlay
                className="w-full max-h-[80vh] object-contain"
              />
            ) : (
              <img
                src={previewMedia.url}
                alt={previewMedia.description || 'Preview'}
                className="w-full max-h-[80vh] object-contain"
              />
            )}
            
            {/* Info */}
            <div className="p-4 bg-gray-800">
              <p className="text-white font-medium">
                {previewMedia.type === 'video' ? '🎬 Video' : '🖼️ Image'} from {previewMedia.source}
              </p>
              {previewMedia.description && (
                <p className="text-gray-400 text-sm mt-1">{previewMedia.description}</p>
              )}
              {previewMedia.photographer && (
                <p className="text-gray-500 text-xs mt-1">Photo by {previewMedia.photographer}</p>
              )}
              <p className="text-gray-500 text-xs mt-2">
                💡 Double-click on a media to preview
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
