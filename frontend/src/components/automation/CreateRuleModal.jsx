"use client";

import React, { useState } from 'react';
import { toast } from 'react-toastify';

// Platform configuration
const PLATFORMS = [
  { id: 'instagram', name: 'Instagram', color: 'from-pink-600 to-purple-600', icon: '📸' },
  { id: 'facebook', name: 'Facebook', color: 'from-blue-600 to-blue-700', icon: '📘' },
  { id: 'linkedin', name: 'LinkedIn', color: 'from-blue-700 to-blue-800', icon: '💼' },
  { id: 'x', name: 'X (Twitter)', color: 'from-gray-700 to-gray-900', icon: '🐦' },
  { id: 'youtube', name: 'YouTube', color: 'from-red-600 to-red-700', icon: '▶️' },
  { id: 'whatsapp', name: 'WhatsApp', color: 'from-green-500 to-green-600', icon: '💬' },
];

// Trigger options with descriptions
const TRIGGERS = [
  { id: 'new_follower', name: 'New Follower', description: 'When someone follows your account', icon: '👤' },
  { id: 'new_comment', name: 'New Comment', description: 'When someone comments on your post', icon: '💭' },
  { id: 'mention', name: 'Mention', description: 'When someone mentions you', icon: '@' },
  { id: 'scheduled', name: 'Scheduled Time', description: 'Run at specific times', icon: '⏰' },
  { id: 'new_post', name: 'New Post', description: 'When you create a new post', icon: '📝' },
  { id: 'new_like', name: 'New Like', description: 'When someone likes your post', icon: '❤️' },
  { id: 'new_share', name: 'New Share', description: 'When someone shares your post', icon: '🔄' },
  { id: 'new_message', name: 'New Message', description: 'When you receive a new message', icon: '✉️' },
];

// Action options with descriptions
const ACTIONS = [
  { id: 'auto_reply', name: 'Auto Reply', description: 'Send an automatic reply', icon: '🤖' },
  { id: 'auto_like', name: 'Auto Like', description: 'Like the triggering content', icon: '👍' },
  { id: 'auto_follow_back', name: 'Auto Follow Back', description: 'Follow the user back', icon: '👥' },
  { id: 'publish_post', name: 'Publish Post', description: 'Publish a scheduled post', icon: '📤' },
  { id: 'send_dm', name: 'Send DM', description: 'Send a direct message', icon: '📩' },
  { id: 'send_email', name: 'Send Email', description: 'Send an email notification', icon: '📧' },
  { id: 'webhook', name: 'Webhook', description: 'Trigger a webhook URL', icon: '🔗' },
  { id: 'schedule_post', name: 'Schedule Post', description: 'Schedule a post for later', icon: '📅' },
];

// Schedule presets
const SCHEDULE_PRESETS = [
  { id: 'hourly', name: 'Every Hour', value: '0 * * * *' },
  { id: 'daily_morning', name: 'Daily (Morning 9AM)', value: '0 9 * * *' },
  { id: 'daily_evening', name: 'Daily (Evening 6PM)', value: '0 18 * * *' },
  { id: 'weekly_monday', name: 'Weekly (Monday)', value: '0 9 * * 1' },
  { id: 'custom', name: 'Custom', value: 'custom' },
];

export default function CreateRuleModal({ onClose, onSubmit, accounts, isLoading }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    platform: '',
    trigger: '',
    action: '',
    message_template: '',
    schedule: '',
    custom_schedule: '',
    conditions: {},
    is_active: true,
    priority: 5,
  });
  const [errors, setErrors] = useState({});

  const connectedPlatforms = accounts?.map(a => a.platform) || [];
  const availablePlatforms = PLATFORMS.filter(p => connectedPlatforms.includes(p.id));

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateStep = (currentStep) => {
    const newErrors = {};
    
    if (currentStep === 1) {
      if (!formData.name.trim()) newErrors.name = 'Rule name is required';
      if (!formData.platform) newErrors.platform = 'Please select a platform';
    }
    
    if (currentStep === 2) {
      if (!formData.trigger) newErrors.trigger = 'Please select a trigger';
      if (!formData.action) newErrors.action = 'Please select an action';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      console.log(`Moving to step ${step + 1}`);
      setStep(prev => Math.min(prev + 1, 4));
    } else {
      // Show validation errors as toast
      if (step === 1) {
        if (!formData.name.trim()) {
          toast.error('Please enter a rule name');
        }
        if (!formData.platform) {
          toast.error('Please select a platform');
        }
      }
      if (step === 2) {
        if (!formData.trigger) {
          toast.error('Please select a trigger');
        }
        if (!formData.action) {
          toast.error('Please select an action');
        }
      }
    }
  };

  const handleBack = () => {
    console.log(`Moving back to step ${step - 1}`);
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    // Final validation
    if (!formData.name.trim() || !formData.platform || !formData.trigger || !formData.action) {
      toast.error('Please complete all required fields');
      return;
    }

    console.log('Creating automation rule with data:', {
      name: formData.name,
      platform: formData.platform,
      trigger: formData.trigger,
      action: formData.action,
    });

    try {
      await onSubmit(ruleData);
      console.log('Automation rule created successfully');
      toast.success('Automation rule created successfully!');
    } catch (err) {
      console.error('Failed to create automation rule:', err);
      toast.error(err.message || 'Failed to create automation rule');
    }
  };

  const getTriggerForAction = (actionId) => {
    // Suggest compatible triggers based on action
    const compatible = {
      auto_reply: ['new_comment', 'new_message', 'mention'],
      auto_like: ['new_post', 'new_follower'],
      auto_follow_back: ['new_follower'],
      publish_post: ['scheduled'],
      send_dm: ['new_follower', 'new_message'],
      send_email: ['new_comment', 'new_message', 'new_follower'],
      webhook: ['new_comment', 'new_message', 'new_follower', 'new_post'],
      schedule_post: ['scheduled'],
    };
    return compatible[actionId] || [];
  };

  const getActionForTrigger = (triggerId) => {
    // Suggest compatible actions based on trigger
    const compatible = {
      new_follower: ['auto_reply', 'auto_follow_back', 'send_dm', 'send_email'],
      new_comment: ['auto_reply', 'auto_like', 'send_email', 'webhook'],
      mention: ['auto_reply', 'auto_like'],
      scheduled: ['publish_post', 'schedule_post'],
      new_post: ['auto_like', 'webhook'],
      new_like: ['auto_like'],
      new_share: [],
      new_message: ['auto_reply', 'send_email'],
    };
    return compatible[triggerId] || [];
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="relative w-full max-w-2xl bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 border border-white/10 rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Decorative gradient border */}
        <div className="absolute inset-0 rounded-3xl p-[1px] bg-gradient-to-r from-purple-500/30 via-blue-500/30 to-green-500/30 -z-10" />
        
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-b from-gray-900 to-transparent p-6 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-white">Create Automation Rule</h2>
              <p className="text-gray-400 text-sm mt-1">Set up automated actions for your social accounts</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex-1 flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                  step >= s 
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' 
                    : 'bg-white/10 text-gray-500'
                }`}>
                  {step > s ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : s}
                </div>
                {s < 4 && (
                  <div className={`flex-1 h-0.5 rounded ${step > s ? 'bg-gradient-to-r from-purple-600 to-blue-600' : 'bg-white/10'}`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>Basic Info</span>
            <span>Trigger</span>
            <span>Action</span>
            <span>Settings</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 pt-2 space-y-6">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-5">
              {/* Rule Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 ml-1">
                  Rule Name <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="e.g., Welcome New Followers"
                    className={`w-full pl-12 pr-4 py-3.5 bg-white/5 border ${errors.name ? 'border-red-500' : 'border-white/10'} rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all`}
                  />
                </div>
                {errors.name && <p className="text-red-400 text-sm ml-1">{errors.name}</p>}
              </div>

              {/* Platform Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 ml-1">
                  Select Platform <span className="text-red-400">*</span>
                </label>
                {availablePlatforms.length === 0 ? (
                  <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-yellow-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <div>
                        <p className="text-yellow-400 font-medium">No accounts connected</p>
                        <p className="text-yellow-400/70 text-sm">Connect at least one social account to create automation rules</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {availablePlatforms.map((platform) => (
                      <button
                        key={platform.id}
                        type="button"
                        onClick={() => handleChange('platform', platform.id)}
                        className={`p-4 rounded-xl border transition-all flex items-center gap-3 ${
                          formData.platform === platform.id
                            ? 'bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-purple-500'
                            : 'bg-white/5 border-white/10 hover:border-white/30'
                        }`}
                      >
                        <span className="text-2xl">{platform.icon}</span>
                        <span className="text-white font-medium">{platform.name}</span>
                        {formData.platform === platform.id && (
                          <svg className="w-5 h-5 text-purple-400 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                )}
                {errors.platform && <p className="text-red-400 text-sm ml-1">{errors.platform}</p>}
              </div>
            </div>
          )}

          {/* Step 2: Trigger */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 ml-1">
                  What should trigger this rule? <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {TRIGGERS.map((trigger) => {
                    const isCompatible = formData.action ? getTriggerForAction(formData.action).includes(trigger.id) : true;
                    return (
                      <button
                        key={trigger.id}
                        type="button"
                        onClick={() => handleChange('trigger', trigger.id)}
                        disabled={formData.action && !isCompatible}
                        className={`p-4 rounded-xl border transition-all text-left ${
                          formData.trigger === trigger.id
                            ? 'bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-purple-500'
                            : isCompatible 
                              ? 'bg-white/5 border-white/10 hover:border-white/30'
                              : 'bg-white/5 border-white/5 opacity-50 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xl">{trigger.icon}</span>
                          <span className="text-white font-medium">{trigger.name}</span>
                        </div>
                        <p className="text-gray-400 text-xs">{trigger.description}</p>
                      </button>
                    );
                  })}
                </div>
                {errors.trigger && <p className="text-red-400 text-sm ml-1">{errors.trigger}</p>}
              </div>
            </div>
          )}

          {/* Step 3: Action */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 ml-1">
                  What should happen? <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {ACTIONS.map((action) => {
                    const isCompatible = formData.trigger ? getActionForTrigger(formData.trigger).includes(action.id) : true;
                    return (
                      <button
                        key={action.id}
                        type="button"
                        onClick={() => handleChange('action', action.id)}
                        disabled={formData.trigger && !isCompatible}
                        className={`p-4 rounded-xl border transition-all text-left ${
                          formData.action === action.id
                            ? 'bg-gradient-to-r from-green-600/20 to-emerald-600/20 border-green-500'
                            : isCompatible 
                              ? 'bg-white/5 border-white/10 hover:border-white/30'
                              : 'bg-white/5 border-white/5 opacity-50 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xl">{action.icon}</span>
                          <span className="text-white font-medium">{action.name}</span>
                        </div>
                        <p className="text-gray-400 text-xs">{action.description}</p>
                      </button>
                    );
                  })}
                </div>
                {errors.action && <p className="text-red-400 text-sm ml-1">{errors.action}</p>}
              </div>

              {/* Message Template (for reply actions) */}
              {(formData.action === 'auto_reply' || formData.action === 'send_dm') && (
                <div className="space-y-2 animate-fadeIn">
                  <label className="text-sm font-medium text-gray-300 ml-1">
                    Message Template
                  </label>
                  <textarea
                    value={formData.message_template}
                    onChange={(e) => handleChange('message_template', e.target.value)}
                    placeholder="Hi! Thanks for {{trigger_type}}. {{custom_message}}"
                    rows={4}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none"
                  />
                  <p className="text-gray-500 text-xs ml-1">
                    Use {'{{trigger_type}}'} and {'{{user_name}}'} for dynamic content
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Settings */}
          {step === 4 && (
            <div className="space-y-5">
              {/* Schedule */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 ml-1">
                  Schedule (optional)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {SCHEDULE_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleChange('schedule', preset.value)}
                      className={`p-3 rounded-xl border transition-all text-sm ${
                        formData.schedule === preset.value
                          ? 'bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-purple-500 text-white'
                          : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/30'
                      }`}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
                {formData.schedule === 'custom' && (
                  <input
                    type="text"
                    value={formData.custom_schedule}
                    onChange={(e) => handleChange('custom_schedule', e.target.value)}
                    placeholder="Cron expression (e.g., 0 * * * *)"
                    className="w-full px-4 py-3 mt-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  />
                )}
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 ml-1">
                  Priority (1-10)
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={formData.priority}
                    onChange={(e) => handleChange('priority', parseInt(e.target.value))}
                    className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-white font-medium w-8 text-center">{formData.priority}</span>
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl">
                <div>
                  <p className="text-white font-medium">Enable Rule</p>
                  <p className="text-gray-400 text-sm">Rule will run immediately when activated</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => handleChange('is_active', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-green-500 peer-checked:to-emerald-500"></div>
                </label>
              </div>

              {/* Summary */}
              <div className="p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl">
                <p className="text-white font-medium mb-3">Rule Summary</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Name:</span>
                    <span className="text-white">{formData.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Platform:</span>
                    <span className="text-white capitalize">{formData.platform}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Trigger:</span>
                    <span className="text-white capitalize">{TRIGGERS.find(t => t.id === formData.trigger)?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Action:</span>
                    <span className="text-white capitalize">{ACTIONS.find(a => a.id === formData.action)?.name}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gradient-to-t from-gray-900 to-transparent p-6 pt-4">
          <div className="flex gap-3">
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="px-6 py-3.5 bg-white/5 border border-white/10 text-gray-300 rounded-xl hover:bg-white/10 hover:text-white transition-all font-medium"
              >
                ← Back
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3.5 bg-white/5 border border-white/10 text-gray-300 rounded-xl hover:bg-white/10 hover:text-white transition-all font-medium"
            >
              Cancel
            </button>
            {step < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 px-6 py-3.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl transition-all font-medium flex items-center justify-center gap-2"
              >
                Continue →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading || availablePlatforms.length === 0}
                className="flex-1 px-6 py-3.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Create Rule
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl" />
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
