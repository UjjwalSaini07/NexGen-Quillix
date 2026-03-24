'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

const platformGuides = {
  facebook: {
    name: 'Facebook',
    icon: '/social/Facebook.png',
    color: 'from-blue-600 to-blue-800',
    bgGlow: 'bg-blue-500/20',
    description: 'Connect your Facebook Page',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    docsUrl: 'https://developers.facebook.com/docs/development',
    steps: [
      { 
        title: 'Go to Developers Portal', 
        desc: 'developers.facebook.com', 
        time: '1 min', 
        icon: '1',
        details: 'Open your browser and visit developers.facebook.com. Click "My Apps" then "Create App". Select "Consumer" as the app type and give your app a name.'
      },
      { 
        title: 'Add Facebook Login', 
        desc: 'Enable login product', 
        time: '2 min', 
        icon: '2',
        details: 'In your app dashboard, scroll to "Add products to your app". Find "Facebook Login" and click "Set Up". This enables OAuth for your app.'
      },
      { 
        title: 'Configure Settings', 
        desc: 'Set valid OAuth URLs', 
        time: '2 min', 
        icon: '3',
        details: 'Go to Facebook Login > Settings. Add your website URL in "Valid OAuth redirect URIs". For local testing, add http://localhost:3000/'
      },
      { 
        title: 'Get Credentials', 
        desc: 'App ID & Secret', 
        time: '1 min', 
        icon: '4',
        details: 'In the left menu, go to "App Settings" > "Basic". You will find your App ID (copy this) and App Secret. Click "Show" to reveal the secret.'
      },
      { 
        title: 'Generate Access Token', 
        desc: 'Via Graph API Explorer', 
        time: '3 min', 
        icon: '5',
        details: 'Go to Graph API Explorer (developers.facebook.com/tools/explorer). Select your app, click "Get Token" > "Get User Access Token". Grant permissions and copy the token.'
      }
    ],
    moreInfo: [
      'Your access token expires in ~1 hour. Implement token refresh for long-term use.',
      'To get a permanent page token, use the Graph API with your user token and page permissions.',
      'Add "pages_manage_posts" permission to post to your Facebook Page.',
      'Test your setup by making a simple API call to /me/accounts.'
    ]
  },
  instagram: {
    name: 'Instagram',
    icon: '/social/Instagram.png',
    color: 'from-purple-600 to-pink-600',
    bgGlow: 'bg-pink-500/20',
    description: 'Link Instagram Business',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    docsUrl: 'https://developers.facebook.com/docs/instagram',
    steps: [
      { 
        title: 'Open Meta Developers', 
        desc: 'developers.facebook.com', 
        time: '1 min', 
        icon: '1',
        details: 'Navigate to developers.facebook.com and log in with your Facebook account. If you don\'t have one, create a new developer account.'
      },
      { 
        title: 'Create or Select App', 
        desc: 'Choose existing or new', 
        time: '2 min', 
        icon: '2',
        details: 'Click "My Apps" and either create a new app or select an existing one. The app must be linked to your Instagram Business account.'
      },
      { 
        title: 'Add Instagram Basic Display', 
        desc: 'In app products', 
        time: '2 min', 
        icon: '3',
        details: 'In your app dashboard, find "Add products to your app". Search for "Instagram Basic Display" and click "Set Up".'
      },
      { 
        title: 'Add Test User', 
        desc: 'Your Instagram account', 
        time: '2 min', 
        icon: '4',
        details: 'Go to Instagram Basic Display > Test Users. Add your Instagram username as a test user. You must follow your own account from the Instagram app.'
      },
      { 
        title: 'Generate Token', 
        desc: 'Long-lived access token', 
        time: '2 min', 
        icon: '5',
        details: 'Click "Generate Token" for your test user. This token lasts 60 days. Use /refresh_access_token endpoint to extend it.'
      }
    ],
    moreInfo: [
      'Instagram Basic Display API allows reading profile, media, and insights.',
      'For posting, you need Instagram Graph API (Business account required).',
      'Convert to a business account in Instagram Settings > Account > Switch to professional account.',
      'Your Instagram account must be a Business or Creator account to use the API.'
    ]
  },
  linkedin: {
    name: 'LinkedIn',
    icon: '/social/LinkedIn.png',
    color: 'from-blue-700 to-blue-900',
    bgGlow: 'bg-blue-500/20',
    description: 'Automate LinkedIn posts',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    docsUrl: 'https://developer.linkedin.com/',
    steps: [
      { 
        title: 'Visit Developer Portal', 
        desc: 'developer.linkedin.com', 
        time: '1 min', 
        icon: '1',
        details: 'Go to developer.linkedin.com and sign in with your LinkedIn account. Click "Create App" to start.'
      },
      { 
        title: 'Create New App', 
        desc: 'App details & company', 
        time: '3 min', 
        icon: '2',
        details: 'Fill in your app name, upload a logo, and link it to a Company Page. You must be an admin of the Company Page.'
      },
      { 
        title: 'Request Product Access', 
        desc: 'Share on LinkedIn', 
        time: '5 min', 
        icon: '3',
        details: 'In the "Products" tab, find "Share on LinkedIn" and "Sign In with LinkedIn". Request access for each. This may require verification.'
      },
      { 
        title: 'Copy API Keys', 
        desc: 'Client ID & Secret', 
        time: '1 min', 
        icon: '4',
        details: 'Go to "Auth" tab. Copy your Client ID. For Client Secret, you may need to create one. Keep these secure!'
      },
      { 
        title: 'Generate OAuth Token', 
        desc: 'User authorization flow', 
        time: '3 min', 
        icon: '5',
        details: 'Build the OAuth authorization URL with your Client ID and required scopes. User visits URL, grants permission, you exchange code for token.'
      }
    ],
    moreInfo: [
      'Required scope: r_liteprofile, r_emailaddress, w_member_social for posting.',
      'Tokens expire in ~365 days. Implement refresh before expiration.',
      'LinkedIn requires app verification before going live with posting.',
      'Your Company Page must have at least 10 followers for some features.'
    ]
  },
  x: {
    name: 'X',
    icon: '/social/X.png',
    color: 'from-gray-600 to-black',
    bgGlow: 'bg-gray-500/20',
    description: 'Post to X (Twitter)',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    docsUrl: 'https://developer.twitter.com/en/docs',
    steps: [
      { 
        title: 'Join Developer Portal', 
        desc: 'developer.twitter.com', 
        time: '2 min', 
        icon: '1',
        details: 'Go to developer.twitter.com and apply for a developer account. Select "Making a bot" or "Building apps" as your use case.'
      },
      { 
        title: 'Create Project', 
        desc: 'Select API v2', 
        time: '3 min', 
        icon: '2',
        details: 'Create a new project and select "Twitter API v2". Give it a name and description. This gives you access to the latest APIs.'
      },
      { 
        title: 'Create App', 
        desc: 'Get API keys', 
        time: '2 min', 
        icon: '3',
        details: 'Within your project, create an app. Go to "Keys and Tokens" to see your API Key, API Secret, Bearer Token, and Access Token.'
      },
      { 
        title: 'Setup Authentication', 
        desc: 'OAuth 2.0', 
        time: '3 min', 
        icon: '4',
        details: 'Configure OAuth 2.0 in app settings. Set callback URL and website URL. Generate access tokens with the required scopes.'
      },
      { 
        title: 'Get Access Token', 
        desc: 'For API calls', 
        time: '2 min', 
        icon: '5',
        details: 'Use your API Key and Secret to get a Bearer Token. For user actions, implement OAuth 1.0a or OAuth 2.0 with PKCE.'
      }
    ],
    moreInfo: [
      'Essential scopes: tweet.read, tweet.write, users.read for posting.',
      'Free tier: 1,500 tweets per month. Check your rate limits.',
      'Apply for Elevated access for more features and higher limits.',
      'Always handle rate limit errors - implement exponential backoff.'
    ]
  },
  youtube: {
    name: 'YouTube',
    icon: '/social/Youtube.png',
    color: 'from-red-600 to-red-800',
    bgGlow: 'bg-red-500/20',
    description: 'Manage YouTube videos',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    docsUrl: 'https://developers.google.com/youtube/v3',
    steps: [
      { 
        title: 'Open Cloud Console', 
        desc: 'console.cloud.google.com', 
        time: '1 min', 
        icon: '1',
        details: 'Go to console.cloud.google.com. Create a new project or select an existing one for your YouTube integration.'
      },
      { 
        title: 'Enable YouTube API', 
        desc: 'API Library', 
        time: '2 min', 
        icon: '2',
        details: 'Search for "YouTube Data API v3" in the API Library and enable it. Also enable "YouTube Analytics API" if needed.'
      },
      { 
        title: 'Create Credentials', 
        desc: 'OAuth 2.0 Client', 
        time: '2 min', 
        icon: '3',
        details: 'Go to "Credentials" > "Create Credentials" > "OAuth client ID". Select "Web application" as the type.'
      },
      { 
        title: 'Configure Consent', 
        desc: 'OAuth consent screen', 
        time: '5 min', 
        icon: '4',
        details: 'Set up OAuth consent screen with your app name and email. Add test users who can access the app (required for external testing).'
      },
      { 
        title: 'Download Keys', 
        desc: 'JSON credentials', 
        time: '1 min', 
        icon: '5',
        details: 'Download the JSON file with your client ID and secret. For server-to-server, create a Service Account instead.'
      }
    ],
    moreInfo: [
      'Required scope: youtube.force-ssl for basic operations.',
      'For uploading: youtube.upload scope and quota > 10,000 units.',
      'Service accounts don\'t work with YouTube - use OAuth 2.0 for user data.',
      'Default quota: 10,000 units/day. Request increase for production.'
    ]
  },
  whatsapp: {
    name: 'WhatsApp',
    icon: '/social/whatsapp.png',
    color: 'from-green-500 to-green-700',
    bgGlow: 'bg-green-500/20',
    description: 'WhatsApp Business API',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    docsUrl: 'https://developers.facebook.com/docs/whatsapp',
    steps: [
      { 
        title: 'Access Meta Developers', 
        desc: 'developers.facebook.com', 
        time: '1 min', 
        icon: '1',
        details: 'Open developers.facebook.com and create a new app. Select "Other" > "Business" as the app type.'
      },
      { 
        title: 'Add WhatsApp Product', 
        desc: 'Setup WhatsApp', 
        time: '2 min', 
        icon: '2',
        details: 'In the app dashboard, find "WhatsApp" in the products list and click "Set Up". This enables the WhatsApp API.'
      },
      { 
        title: 'Get Temporary Token', 
        desc: 'For testing', 
        time: '1 min', 
        icon: '3',
        details: 'In the WhatsApp > API Setup tab, copy the temporary access token. It\'s valid for 24 hours and for test numbers only.'
      },
      { 
        title: 'Get Phone Number ID', 
        desc: 'Business number ID', 
        time: '1 min', 
        icon: '4',
        details: 'In the same section, find your "Phone Number ID". This identifies your WhatsApp Business phone number.'
      },
      { 
        title: 'Setup Webhook', 
        desc: 'For incoming messages', 
        time: '5 min', 
        icon: '5',
        details: 'Configure a webhook URL to receive messages. Verify your webhook with the challenge code. Subscribe to webhook fields.'
      }
    ],
    moreInfo: [
      'Use the temporary token only for testing with test numbers.',
      'Request production access to use with real phone numbers.',
      'Incoming messages are free. Outgoing messages cost per conversation.',
      'You need pre-approved message templates for proactive messages.'
    ]
  }
};

export default function VideoGuidePage() {
  const searchParams = useSearchParams();
  const platformParam = searchParams?.get('platform') || 'facebook';
  const [selectedPlatform, setSelectedPlatform] = useState(platformParam);
  const [completedSteps, setCompletedSteps] = useState({});
  const [viewMode, setViewMode] = useState('steps');
  const [expandedStep, setExpandedStep] = useState(null);
  
  const currentGuide = platformGuides[selectedPlatform];
  
  useEffect(() => {
    setViewMode('steps');
    setExpandedStep(null);
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

  const toggleExpand = (stepIndex) => {
    setExpandedStep(expandedStep === stepIndex ? null : stepIndex);
  };

  const completedCount = Object.values(completedSteps[selectedPlatform] || {}).filter(Boolean).length;
  const totalSteps = currentGuide.steps.length;

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className={`absolute top-0 left-1/4 w-96 h-96 ${currentGuide.bgGlow} rounded-full blur-3xl opacity-30`} />
        <div className={`absolute bottom-0 right-1/4 w-96 h-96 ${currentGuide.bgGlow} rounded-full blur-3xl opacity-30`} />
      </div>

      {/* Header */}
      <div className="relative bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => window.close()}
                className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center hover:bg-white/10 hover:scale-105 transition-all"
              >
                ✕
              </button>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${currentGuide.color} flex items-center justify-center`}>
                  <img src={currentGuide.icon} alt={currentGuide.name} className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-lg font-bold">{currentGuide.name}</h1>
                  <p className="text-xs text-gray-500">{currentGuide.description}</p>
                </div>
              </div>
            </div>

            {/* Platform Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto">
              {Object.entries(platformGuides).map(([key, platform]) => (
                <button
                  key={key}
                  onClick={() => setSelectedPlatform(key)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all whitespace-nowrap ${
                    selectedPlatform === key
                      ? `bg-gradient-to-r ${platform.color} text-white shadow-lg`
                      : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'
                  }`}
                >
                  <img src={platform.icon} alt={platform.name} className="w-4 h-4" />
                  <span className="text-sm font-medium">{platform.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left - Video & Stats */}
          <div className="lg:col-span-7 space-y-4">
            {/* Video Player */}
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
              <div className="aspect-video bg-black relative">
                <iframe
                  src={currentGuide.videoUrl}
                  title={`${currentGuide.name} Guide`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="p-4 flex items-center justify-between border-t border-white/5">
                <div className="flex items-center gap-3">
                  <img src={currentGuide.icon} alt={currentGuide.name} className="w-10 h-10" />
                  <div>
                    <h2 className="font-semibold">{currentGuide.name} Setup</h2>
                    <p className="text-xs text-gray-500">Step-by-step credentials guide</p>
                  </div>
                </div>
                <a
                  href={currentGuide.docsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm flex items-center gap-2 transition-all"
                >
                  📖 Docs
                </a>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                <div className="text-2xl font-bold">{totalSteps}</div>
                <div className="text-xs text-gray-500">Total Steps</div>
              </div>
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                <div className="text-2xl font-bold text-green-400">{completedCount}</div>
                <div className="text-xs text-gray-500">Completed</div>
              </div>
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                <div className="text-2xl font-bold">{totalSteps - completedCount}</div>
                <div className="text-xs text-gray-500">Remaining</div>
              </div>
            </div>
          </div>

          {/* Right - Steps/Details */}
          <div className="lg:col-span-5 space-y-4">
            {/* Toggle */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setViewMode('steps')}
                className={`p-3 rounded-xl border text-center text-sm font-medium transition-all ${
                  viewMode === 'steps'
                    ? 'bg-white text-black border-white'
                    : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
                }`}
              >
                📋 {currentGuide.steps.length} Steps
              </button>
              <button
                onClick={() => setViewMode('details')}
                className={`p-3 rounded-xl border text-center text-sm font-medium transition-all ${
                  viewMode === 'details'
                    ? 'bg-white text-black border-white'
                    : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
                }`}
              >
                📖 More Details
              </button>
            </div>

            {/* Content Cards */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
              {viewMode === 'steps' ? (
                currentGuide.steps.map((step, index) => {
                  const isCompleted = completedSteps[selectedPlatform]?.[index];
                  const isExpanded = expandedStep === index;
                  
                  return (
                    <div key={index}>
                      <div
                        onClick={() => {
                          toggleStep(index);
                          toggleExpand(index);
                        }}
                        className={`group p-3 rounded-xl border cursor-pointer transition-all hover:scale-[1.02] ${
                          isCompleted
                            ? 'border-green-500/30 bg-green-500/5'
                            : 'border-white/10 bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${
                            isCompleted 
                              ? 'bg-green-500 text-white' 
                              : `bg-gradient-to-br ${currentGuide.color} text-white`
                          }`}>
                            {isCompleted ? '✓' : step.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={`text-sm font-medium ${isCompleted ? 'text-green-400' : ''}`}>
                              {step.title}
                            </div>
                            <div className="text-xs text-gray-500">{step.desc}</div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs text-gray-600 bg-white/5 px-2 py-1 rounded">
                              ⏱ {step.time}
                            </span>
                            <span className={`text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                              ▼
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="mt-2 p-3 rounded-xl bg-black/30 border border-white/5 animate-fadeIn">
                          <div className="text-sm text-gray-300 leading-relaxed">
                            {step.details}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="space-y-3">
                  <div className="text-sm text-gray-400 mb-4">
                    Additional important information for {currentGuide.name}:
                  </div>
                  {currentGuide.moreInfo.map((info, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-xl bg-white/5 border border-white/10"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${currentGuide.color} flex items-center justify-center text-xs shrink-0`}>
                          ℹ️
                        </div>
                        <div className="text-sm text-gray-300">{info}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
