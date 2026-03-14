"use client";

import React, { useState } from 'react';
import * as api from '@/lib/dynamic-automation-api';
import { toast } from 'react-toastify';

// Platform icons and colors
const PLATFORM_CONFIG = {
  facebook: {
    name: 'Facebook',
    description: 'Connect your Facebook page for posting',
    color: 'from-blue-600 to-blue-700',
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
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
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    ),
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
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
    fields: [
      { id: 'access_token', label: 'Access Token', type: 'password', placeholder: 'Enter your LinkedIn access token' },
    ],
    instructions: 'Create an app in LinkedIn Developer Portal and get OAuth 2.0 access token.',
  },
  x: {
    name: 'X (Twitter)',
    description: 'Connect your X account for posting',
    color: 'from-gray-700 to-gray-900',
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
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
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    ),
    fields: [
      { id: 'access_token', label: 'Access Token', type: 'password', placeholder: 'Enter your YouTube access token' },
    ],
    instructions: 'Use Google Cloud Console to create OAuth credentials for YouTube API.',
  },
  whatsapp: {
    name: 'WhatsApp',
    description: 'Connect your WhatsApp Business API',
    color: 'from-green-500 to-green-600',
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085-.719 2 1.758.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    ),
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
