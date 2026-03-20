"use client";

import React, { useState } from 'react';
import * as api from '@/lib/dynamic-automation-api';
import { toast } from 'react-toastify';

// Platform icons - Using public social logo images
const PLATFORM_CONFIG = {
  facebook: {
    name: 'Facebook',
    description: 'Connect your Facebook page for posting',
    color: 'from-blue-600 to-blue-700',
    icon: <img src="/social/Facebook.png" alt="Facebook" className="w-8 h-8" />,
    fields: [
      { id: 'access_token', label: 'Access Token', type: 'password', placeholder: 'Enter your Facebook access token' },
      { id: 'page_id', label: 'Page ID', type: 'text', placeholder: 'Enter your Facebook Page ID' },
    ],
    instructions: 'Go to Facebook Developers > My Apps > Tools > Graph API Explorer to get your access token.',
  },
  instagram: {
    name: 'Instagram',
    description: 'Connect your Instagram business account',
    color: 'from-pink-600 via-purple-600 to-orange-500',
    icon: <img src="/social/Instagram.png" alt="Instagram" className="w-8 h-8" />,
    fields: [
      { id: 'access_token', label: 'Access Token', type: 'password', placeholder: 'Enter your Instagram access token' },
      { id: 'ig_user_id', label: 'Instagram User ID', type: 'text', placeholder: 'Enter your Instagram User ID' },
    ],
    instructions: 'Get access token from Facebook Developers with instagram_basic and instagram_manage_messages permissions.',
  },
  linkedin: {
    name: 'LinkedIn',
    description: 'Connect your LinkedIn profile or company page',
    color: 'from-blue-700 to-blue-800',
    icon: <img src="/social/LinkedIn.png" alt="LinkedIn" className="w-8 h-8" />,
    fields: [
      { id: 'access_token', label: 'Access Token', type: 'password', placeholder: 'Enter your LinkedIn access token' },
    ],
    instructions: 'Create an app in LinkedIn Developer Portal and get OAuth 2.0 access token.',
  },
  x: {
    name: 'X (Twitter)',
    description: 'Connect your X account for posting',
    color: 'from-gray-700 to-gray-900',
    icon: <img src="/social/X.png" alt="X" className="w-8 h-8" />,
    fields: [
      { id: 'bearer_token', label: 'Bearer Token (Required)', type: 'password', placeholder: 'Enter your X Bearer Token' },
      { id: 'api_key', label: 'API Key', type: 'text', placeholder: 'Enter your API Key (Optional)' },
      { id: 'api_secret', label: 'API Secret', type: 'password', placeholder: 'Enter your API Secret (Optional)' },
      { id: 'access_token', label: 'Access Token', type: 'password', placeholder: 'Enter your Access Token (Optional)' },
      { id: 'access_token_secret', label: 'Access Token Secret', type: 'password', placeholder: 'Enter your Access Token Secret (Optional)' },
    ],
    instructions: 'Create a project in X Developer Portal. For posting: Get Bearer Token (App Auth) AND Access Token (User Auth).',
  },
  youtube: {
    name: 'YouTube',
    description: 'Connect your YouTube channel',
    color: 'from-red-600 to-red-700',
    icon: <img src="/social/Youtube.png" alt="YouTube" className="w-8 h-8" />,
    fields: [
      { id: 'access_token', label: 'Access Token', type: 'password', placeholder: 'Enter your YouTube access token' },
    ],
    instructions: 'Use Google Cloud Console to create OAuth credentials for YouTube API.',
  },
  whatsapp: {
    name: 'WhatsApp',
    description: 'Connect your WhatsApp Business API',
    color: 'from-green-500 to-green-600',
    icon: <img src="/social/whatsapp.png" alt="WhatsApp" className="w-8 h-8" />,
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
  const [showToken, setShowToken] = useState({});

  const config = PLATFORM_CONFIG[platform];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // First validate credentials with the backend
      setError('Validating credentials...');
      toast.info('Validating credentials...');
      
      try {
        console.log('Validating credentials for platform:', platform);
        console.log('Form data being sent:', JSON.stringify(formData));
        const validation = await api.validatePlatformCredentials(platform, formData);
        console.log('Validation response:', validation);
        
        if (!validation.valid) {
          const errorMsg = validation.error || 'Invalid credentials';
          console.error('Validation failed:', errorMsg);
          toast.error(errorMsg);
          setError(errorMsg);
          setLoading(false);
          return;
        }
        
        // Add validated username to formData
        const validatedData = {
          ...formData,
          platform_username: validation.username,
        };
        
        // Now connect with validated credentials
        console.log('Connecting platform:', platform);
        await onConnect(platform, validatedData);
        toast.success(`${platform} account connected successfully!`);
        console.log('Platform connected successfully');
        onClose();
      } catch (validationErr) {
        // Handle validation error
        const errMsg = validationErr.message || 'Failed to validate credentials';
        console.error('Validation error:', errMsg);
        toast.error(errMsg);
        setError(errMsg);
        setLoading(false);
        return;
      }
    } catch (err) {
      console.error('Connection error:', err);
      const errorMsg = err.message || 'Failed to connect account';
      toast.error(errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (fieldId, value) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
  };

  const toggleShowToken = (fieldId) => {
    setShowToken(prev => ({ ...prev, [fieldId]: !prev[fieldId] }));
  };

  if (!config) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="relative w-full max-w-md max-h-[90vh] bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Decorative gradient border */}
        <div className="absolute inset-0 rounded-3xl p-[1px] bg-gradient-to-r from-green-500/30 via-blue-500/30 to-purple-500/30 -z-10" />
        
        {/* Header */}
        <div className="relative p-6 pb-4 bg-gradient-to-b from-white/5 to-transparent flex-shrink-0">
          <div className="flex items-center gap-4">
            {/* Platform Icon */}
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${config.color} flex items-center justify-center text-white shadow-lg`}>
              {config.icon}
            </div>
            
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white">Connect {config.name}</h2>
              <p className="text-gray-400 text-sm mt-1">{config.description}</p>
            </div>
            
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all pointer-events-auto z-10"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content - Scrollable for X/Twitter with many fields */}
        <form onSubmit={handleSubmit} className="p-6 pt-2 pr-6 space-y-4 overflow-y-auto max-h-[60vh]">
          {/* Show Instructions Toggle */}
          <button
            type="button"
            onClick={() => setShowInstructions(!showInstructions)}
            className="flex items-center gap-2 text-blue-400 text-sm hover:text-blue-300 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {showInstructions ? 'Hide' : 'Show'} how to get credentials
          </button>

          {/* Instructions */}
          {showInstructions && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <div>
                  <p className="font-medium text-white text-sm mb-1">How to get your credentials:</p>
                  <p className="text-gray-300 text-sm">{config.instructions}</p>
                </div>
              </div>
            </div>
          )}

          {/* Form Fields */}
          {config.fields.map((field) => (
            <div key={field.id} className="space-y-2">
              <label className="text-xs font-medium text-gray-300 ml-1">
                {field.label}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {field.type === 'password' ? (
                    <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                    </svg>
                  )}
                </div>
                <input
                  type={showToken[field.id] ? "text" : field.type}
                  value={formData[field.id] || ''}
                  onChange={(e) => handleChange(field.id, e.target.value)}
                  placeholder={field.placeholder}
                  required
                  className="w-full pl-10 pr-10 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                />
                {field.type === 'password' && (
                  <button
                    type="button"
                    onClick={() => toggleShowToken(field.id)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors"
                  >
                    {showToken[field.id] ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl animate-shake">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Security Notice */}
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <div>
                <p className="text-green-400 font-medium text-sm">Secure Encryption</p>
                <p className="text-green-400/70 text-xs mt-1">
                  Your credentials are encrypted and stored securely. We never share your data with third parties.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3.5 bg-white/5 border border-white/10 text-gray-300 rounded-xl hover:bg-white/10 hover:text-white transition-all font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3.5 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white rounded-xl transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-green-500/20"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Validating...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  <span>Connect Account</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Decorative elements */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-green-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl" />
      </div>

      {/* Inline styles for shake animation */}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}
