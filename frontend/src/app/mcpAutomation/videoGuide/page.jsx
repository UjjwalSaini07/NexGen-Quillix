'use client';

import { useState, useEffect, use } from 'react';

const platformGuides = {
  facebook: {
    name: 'Facebook',
    icon: '/social/Facebook.png',
    description: 'Connect your Facebook Page and automate posts effortlessly.',
    color: '#1877F2',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    steps: [
      { title: 'Visit Developers Portal', description: 'Go to developers.facebook.com and sign in with your account', icon: '🌐' },
      { title: 'Create New Application', description: 'Click "My Apps" → "Create App" and select "Consumer" type', icon: '➕' },
      { title: 'Add Facebook Login', description: 'Add Facebook Login product from the dashboard and configure settings', icon: '🔐' },
      { title: 'Get Credentials', description: 'Navigate to Settings → Basic to copy your App ID and Secret', icon: '🔑' },
      { title: 'Generate Token', description: 'Use Graph API Explorer to get access token with needed permissions', icon: '🎫' }
    ],
    tips: [
      'Keep your App Secret safe and never expose it',
      'Use long-lived tokens for extended access',
      'Request only necessary permissions',
      'Test with sandbox accounts first'
    ]
  },
  instagram: {
    name: 'Instagram',
    icon: '/social/Instagram.png',
    description: 'Link your Instagram Business account for content automation.',
    color: '#E4405F',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    steps: [
      { title: 'Open Meta Developers', description: 'Visit developers.facebook.com with your connected app', icon: '🌐' },
      { title: 'Enable Basic Display', description: 'Add Instagram Basic Display product to your app', icon: '⚡' },
      { title: 'Add Test Account', description: 'Add your Instagram account as test user in settings', icon: '👤' },
      { title: 'Get Long-Lived Token', description: 'Generate long-lived access token via Graph API Explorer', icon: '🎫' },
      { title: 'Retrieve Account ID', description: 'Use API to fetch your Instagram Business Account ID', icon: '📋' }
    ],
    tips: [
      'Business accounts work best for automation',
      'Long-lived tokens last 60 days',
      'Use Instagram Graph API for insights',
      'Maintain compliance with platform policies'
    ]
  },
  linkedin: {
    name: 'LinkedIn',
    icon: '/social/LinkedIn.png',
    description: 'Automate LinkedIn posts and grow your professional network.',
    color: '#0A66C2',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    steps: [
      { title: 'Access Developer Portal', description: 'Go to developer.linkedin.com and create account', icon: '🌐' },
      { title: 'Build Your App', description: 'Create new app with company page association', icon: '🏢' },
      { title: 'Request Permissions', description: 'Add "Share on LinkedIn" product for posting access', icon: '📝' },
      { title: 'Copy Keys', description: 'Find Client ID and Secret in Authentication tab', icon: '🔑' },
      { title: 'Create OAuth Token', description: 'Generate token with r_liteprofile and w_member_social', icon: '🎫' }
    ],
    tips: [
      'Company page association is required',
      'Personal profile needed for authentication',
      'Review rate limits before publishing',
      'Stay compliant with LinkedIn terms'
    ]
  },
  x: {
    name: 'X',
    icon: '/social/X.png',
    description: 'Post to X (Twitter) programmatically with API integration.',
    color: '#000000',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    steps: [
      { title: 'Join Developer Program', description: 'Apply for developer account at developer.twitter.com', icon: '📝' },
      { title: 'Start New Project', description: 'Create project and select "Writing" as use case', icon: '📁' },
      { title: 'Setup App', description: 'Create app within project to receive API keys', icon: '⚙️' },
      { title: 'Copy Credentials', description: 'Get API Key, Secret, Bearer Token from keys tab', icon: '🔑' },
      { title: 'Generate Tokens', description: 'Create Access Token and Secret for user-level access', icon: '🎫' }
    ],
    tips: [
      'Free tier has rate limits',
      'Elevated access gives more tweets',
      'API v2 is recommended for new apps',
      'Monitor usage in developer portal'
    ]
  },
  youtube: {
    name: 'YouTube',
    icon: '/social/Youtube.png',
    description: 'Manage and publish videos through YouTube Data API.',
    color: '#FF0000',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    steps: [
      { title: 'Open Cloud Console', description: 'Go to console.cloud.google.com and create project', icon: '☁️' },
      { title: 'Enable API', description: 'Search and enable YouTube Data API v3 in library', icon: '📚' },
      { title: 'Create Credentials', description: 'Set up OAuth 2.0 credentials for authentication', icon: '🔐' },
      { title: 'Configure Consent', description: 'Add your email as test user in OAuth consent screen', icon: '✅' },
      { title: 'Download Keys', description: 'Get your client_id and client_secret JSON file', icon: '📥' }
    ],
    tips: [
      'OAuth 2.0 is required for most features',
      'Quota allocation varies by project',
      'Video uploads need larger quotas',
      'Verify app before going public'
    ]
  },
  whatsapp: {
    name: 'WhatsApp',
    icon: '/social/whatsapp.png',
    description: 'Send automated messages via WhatsApp Business API.',
    color: '#25D366',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    steps: [
      { title: 'Access Meta Developers', description: 'Go to developers.facebook.com and select WhatsApp', icon: '🌐' },
      { title: 'Create Business App', description: 'Set up new app specifically for WhatsApp business', icon: '🏢' },
      { title: 'Copy Temporary Token', description: 'Find temporary access token in API Setup tab', icon: '🎫' },
      { title: 'Get Phone ID', description: 'Copy your WhatsApp Business Phone Number ID', icon: '📱' },
      { title: 'Setup Webhook', description: 'Configure webhook URL for incoming message handling', icon: '🔗' }
    ],
    tips: [
      'Temporary tokens expire in 24 hours',
      'Webhooks need SSL verification',
      'Business verification may be required',
      'Message templates need approval'
    ]
  }
};

export default function VideoGuidePage(props) {
  const searchParams = use(props.searchParams);
  const platformParam = searchParams?.platform || 'facebook';
  const [selectedPlatform, setSelectedPlatform] = useState(platformParam);
  const [completedSteps, setCompletedSteps] = useState({});
  const [viewMode, setViewMode] = useState('steps'); // 'steps' or 'tips'
  
  const currentGuide = platformGuides[selectedPlatform];
  
  useEffect(() => {
    setViewMode('steps');
  }, [selectedPlatform]);
  
  const toggleStep = (stepIndex) => {
    setCompletedSteps(prev => ({
      ...prev,
      [selectedPlatform]: {
        ...prev[selectedPlatform],
        [stepIndex]: !prev[selectedPlatform]?.[stepIndex]
      }
    }));
  };
  
  const progress = currentGuide.steps.filter((_, i) => completedSteps[selectedPlatform]?.[i]).length;
  const progressPercent = Math.round((progress / currentGuide.steps.length) * 100);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-black/80 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <button 
                onClick={() => window.location.href = '/mcpAutomation'}
                className="w-11 h-11 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center hover:bg-white/10 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-xl font-bold">Credentials Guide</h1>
                <p className="text-xs text-gray-500">Generate API credentials for each platform</p>
              </div>
            </div>
            
            {/* Platform Tabs */}
            <div className="flex items-center gap-2">
              {Object.entries(platformGuides).map(([key, platform]) => (
                <button
                  key={key}
                  onClick={() => setSelectedPlatform(key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    selectedPlatform === key
                      ? 'bg-white text-black font-medium'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'
                  }`}
                >
                  <img src={platform.icon} alt={platform.name} className="w-4 h-4" />
                  <span className="text-sm">{platform.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* Left Column - 5 cols */}
          <div className="xl:col-span-5 space-y-6">
            {/* Video Card */}
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <div className="aspect-video bg-black">
                <iframe
                  src={currentGuide.videoUrl}
                  title={`${currentGuide.name} Guide`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="p-5">
                <div className="flex items-center gap-3 mb-2">
                  <img src={currentGuide.icon} alt={currentGuide.name} className="w-8 h-8" />
                  <div>
                    <h2 className="text-lg font-semibold">{currentGuide.name}</h2>
                    <p className="text-xs text-gray-500">API Setup Tutorial</p>
                  </div>
                </div>
                <p className="text-sm text-gray-400">{currentGuide.description}</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setViewMode('steps')}
                className={`p-4 rounded-xl border transition-all text-left ${
                  viewMode === 'steps'
                    ? 'bg-white text-black border-white'
                    : 'bg-white/5 text-gray-400 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="text-lg mb-1">📋</div>
                <div className="font-medium">Setup Steps</div>
                <div className="text-xs opacity-70">{currentGuide.steps.length} steps</div>
              </button>
              <button
                onClick={() => setViewMode('tips')}
                className={`p-4 rounded-xl border transition-all text-left ${
                  viewMode === 'tips'
                    ? 'bg-white text-black border-white'
                    : 'bg-white/5 text-gray-400 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="text-lg mb-1">💡</div>
                <div className="font-medium">Tips & Tricks</div>
                <div className="text-xs opacity-70">{currentGuide.tips.length} tips</div>
              </button>
            </div>
          </div>

          {/* Right Column - 7 cols */}
          <div className="xl:col-span-7">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              {viewMode === 'steps' ? (
                <>
                  <h3 className="text-lg font-semibold mb-5">Step-by-Step Guide</h3>
                  <div className="space-y-3">
                    {currentGuide.steps.map((step, index) => {
                      const isCompleted = completedSteps[selectedPlatform]?.[index];
                      
                      return (
                        <div
                          key={index}
                          onClick={() => toggleStep(index)}
                          className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-4 ${
                            isCompleted
                              ? 'border-green-500/30 bg-green-500/5'
                              : 'border-white/10 bg-white/5 hover:border-white/20'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 ${
                            isCompleted ? 'bg-green-500 text-white' : 'bg-white/10'
                          }`}>
                            {isCompleted ? '✓' : index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{step.icon}</span>
                              <h4 className={`font-medium ${isCompleted ? 'text-green-400' : ''}`}>{step.title}</h4>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">{step.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-semibold mb-5">Best Practices & Tips</h3>
                  <div className="space-y-3">
                    {currentGuide.tips.map((tip, index) => (
                      <div key={index} className="p-4 rounded-xl border border-white/10 bg-white/5 flex items-start gap-4">
                        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                          <span className="text-sm">💡</span>
                        </div>
                        <p className="text-sm text-gray-300 mt-1">{tip}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                    <div className="flex items-start gap-3">
                      <span className="text-xl">📚</span>
                      <div>
                        <h4 className="font-medium text-blue-400">Official Documentation</h4>
                        <p className="text-sm text-gray-400 mt-1">Check the official {currentGuide.name} documentation for the most up-to-date information and requirements.</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
