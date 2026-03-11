"use client";

import React, { useState } from 'react';

const PLATFORM_CONFIG = {
  facebook: {
    name: 'Facebook',
    description: 'Connect your Facebook page for posting',
    fields: [
      { id: 'access_token', label: 'Access Token', type: 'password', placeholder: 'Enter your Facebook access token' },
      { id: 'page_id', label: 'Page ID', type: 'text', placeholder: 'Enter your Facebook Page ID' },
    ],
    instructions: 'Go to Facebook Developers > My Apps > Tools > Graph API Explorer to get your access token.',
  },
  instagram: {
    name: 'Instagram',
    description: 'Connect your Instagram business account',
    fields: [
      { id: 'access_token', label: 'Access Token', type: 'password', placeholder: 'Enter your Instagram access token' },
      { id: 'ig_user_id', label: 'Instagram User ID', type: 'text', placeholder: 'Enter your Instagram User ID' },
    ],
    instructions: 'Get access token from Facebook Developers with instagram_basic and instagram_manage_messages permissions.',
  },
  linkedin: {
    name: 'LinkedIn',
    description: 'Connect your LinkedIn profile or company page',
    fields: [
      { id: 'access_token', label: 'Access Token', type: 'password', placeholder: 'Enter your LinkedIn access token' },
    ],
    instructions: 'Create an app in LinkedIn Developer Portal and get OAuth 2.0 access token.',
  },
  x: {
    name: 'X (Twitter)',
    description: 'Connect your X account for posting',
    fields: [
      { id: 'access_token', label: 'Bearer Token', type: 'password', placeholder: 'Enter your X Bearer Token' },
    ],
    instructions: 'Create a project in X Developer Portal and get your Bearer Token.',
  },
  youtube: {
    name: 'YouTube',
    description: 'Connect your YouTube channel',
    fields: [
      { id: 'access_token', label: 'Access Token', type: 'password', placeholder: 'Enter your YouTube access token' },
    ],
    instructions: 'Use Google Cloud Console to create OAuth credentials for YouTube API.',
  },
  whatsapp: {
    name: 'WhatsApp',
    description: 'Connect your WhatsApp Business API',
    fields: [
      { id: 'access_token', label: 'Access Token', type: 'password', placeholder: 'Enter your WhatsApp access token' },
      { id: 'phone_number_id', label: 'Phone Number ID', type: 'text', placeholder: 'Enter your Phone Number ID' },
    ],
    instructions: 'Get credentials from Facebook Business Manager for WhatsApp Business API.',
  },
};

export default function ConnectAccountModal({ platform, onClose, onConnect }) {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showInstructions, setShowInstructions] = useState(false);

  const config = PLATFORM_CONFIG[platform];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await onConnect(platform, formData);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to connect account');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (fieldId, value) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
  };

  if (!config) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl w-full max-w-md border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Connect {config.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <p className="text-gray-400 text-sm">{config.description}</p>

          {/* Show Instructions Toggle */}
          <button
            type="button"
            onClick={() => setShowInstructions(!showInstructions)}
            className="text-blue-400 text-sm hover:underline"
          >
            {showInstructions ? 'Hide' : 'Show'} how to get credentials
          </button>

          {/* Instructions */}
          {showInstructions && (
            <div className="bg-gray-800 p-3 rounded-lg text-sm text-gray-300">
              <p className="font-medium mb-2 text-white">How to get your credentials:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>{config.instructions}</li>
              </ol>
            </div>
          )}

          {/* Form Fields */}
          {config.fields.map((field) => (
            <div key={field.id}>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                {field.label}
              </label>
              <input
                type={field.type}
                value={formData[field.id] || ''}
                onChange={(e) => handleChange(field.id, e.target.value)}
                placeholder={field.placeholder}
                required
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700 focus:border-blue-500 focus:outline-none"
              />
            </div>
          ))}

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Security Notice */}
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <p className="text-xs text-green-400">
                Your credentials are encrypted and stored securely. We never share your data with third parties.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Connecting...' : 'Connect Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
