"use client";

import React, { useState } from 'react';
import { useAutomation } from '@/components/hooks/useAutomation';
import { toast } from 'react-toastify';

const PLATFORMS = [
  { id: 'instagram', label: 'Instagram', color: 'pink' },
  { id: 'facebook', label: 'Facebook', color: 'blue' },
  { id: 'linkedin', label: 'LinkedIn', color: 'blue' },
  { id: 'x', label: 'X (Twitter)', color: 'black' },
  { id: 'youtube', label: 'YouTube', color: 'red' },
  { id: 'whatsapp', label: 'WhatsApp', color: 'green' },
];

export default function PostCreator() {
  const [content, setContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [mediaUrl, setMediaUrl] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [isSchedule, setIsSchedule] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const { createPost, publishPost, schedulePost, generatePost } = useAutomation();

  const togglePlatform = (platformId) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platformId)
        ? prev.filter((p) => p !== platformId)
        : [...prev, platformId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      if (!content.trim()) {
        toast.error('Please enter some content for your post');
        throw new Error('Please enter some content');
      }

      if (selectedPlatforms.length === 0) {
        toast.error('Please select at least one platform to post to');
        throw new Error('Please select at least one platform');
      }

      // Prepare post data for the API
      const postData = {
        content: content,
        platforms: selectedPlatforms,
        media_urls: mediaUrl ? [mediaUrl] : [],
        media_type: mediaUrl ? 'image' : null,
        is_draft: !isSchedule && !scheduleTime, // If not scheduling, create as draft
      };

      // Add scheduled time if scheduling is enabled
      if (isSchedule && scheduleTime) {
        postData.scheduled_time = new Date(scheduleTime).toISOString();
        postData.is_draft = false;
      }

      console.log('Creating post with data:', postData);
      const response = await createPost(postData);
      console.log('Post created successfully:', response);
      
      toast.success('Post created successfully!');
      setResult(response);
      setContent('');
      setMediaUrl('');
      setScheduleTime('');
      setSelectedPlatforms([]);
    } catch (err) {
      console.error('Error creating post:', err);
      const errorMessage = err.message || 'Failed to create post';
      
      // Check for specific error messages and show user-friendly toasts
      if (errorMessage.includes('account not connected')) {
        toast.error('Please connect your social media accounts first before creating posts');
      } else if (errorMessage.includes('Unsupported platform')) {
        toast.error('Please select a supported platform');
      } else {
        toast.error(errorMessage);
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateContent = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await generatePost({ niche: 'tech', tone: 'professional' });
      if (response && response.content) {
        setContent(response.content);
      } else {
        setError('Failed to generate content');
      }
    } catch (err) {
      setError(err.message || 'Failed to generate content');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <h2 className="text-xl font-bold text-white mb-6">Create New Post</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Platform Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Select Platforms
          </label>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map((platform) => (
              <button
                key={platform.id}
                type="button"
                onClick={() => togglePlatform(platform.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedPlatforms.includes(platform.id)
                    ? `bg-${platform.color}-600 text-white`
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {platform.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Post Content
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full h-40 bg-gray-900 text-white rounded-lg p-4 border border-gray-700 focus:border-blue-500 focus:outline-none resize-none"
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-gray-500">
              {content.length} characters
            </span>
            <button
              type="button"
              onClick={handleGenerateContent}
              disabled={loading}
              className="text-sm text-blue-400 hover:text-blue-300 disabled:opacity-50"
            >
              ✨ Generate with AI
            </button>
          </div>
        </div>

        {/* Media URL */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Media URL (Optional)
          </label>
          <input
            type="url"
            value={mediaUrl}
            onChange={(e) => setMediaUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="w-full bg-gray-900 text-white rounded-lg p-3 border border-gray-700 focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Schedule Toggle */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="schedule"
            checked={isSchedule}
            onChange={(e) => setIsSchedule(e.target.checked)}
            className="w-4 h-4 rounded bg-gray-700 border-gray-600"
          />
          <label htmlFor="schedule" className="text-gray-300">
            Schedule for later
          </label>
        </div>

        {/* Schedule Time */}
        {isSchedule && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Schedule Time
            </label>
            <input
              type="datetime-local"
              value={scheduleTime}
              onChange={(e) => setScheduleTime(e.target.value)}
              className="w-full bg-gray-900 text-white rounded-lg p-3 border border-gray-700 focus:border-blue-500 focus:outline-none"
            />
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Success Message */}
        {result && (
          <div className="p-3 bg-green-500/20 border border-green-500 rounded-lg text-green-400 text-sm">
            {result.message || 'Post published successfully!'}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Processing...' : isSchedule ? 'Schedule Post' : 'Publish Now'}
        </button>
      </form>
    </div>
  );
}
