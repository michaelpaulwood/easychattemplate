'use client';

import { useState, useEffect } from 'react';
import ChatInterface from '@/components/ChatInterface';
import SettingsModal from '@/components/SettingsModal';
import { Cog6ToothIcon, XMarkIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

interface UserSettings {
  username: string;
  email: string;
  theme: 'light' | 'dark' | 'system';
}

export default function Home() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState(process.env.OPENAI_MODEL || 'gpt-3.5-turbo');
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light');
  const [hasEnvApiKey, setHasEnvApiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [userSettings, setUserSettings] = useState<UserSettings>({
    username: '',
    email: '',
    theme: 'system',
  });

  // Handle scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setShowHeader(currentScrollY < lastScrollY || currentScrollY < 50);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Check for API key on mount
  useEffect(() => {
    const checkApiKey = async () => {
      try {
        const response = await fetch('/api/check-api-key');
        const data = await response.json();
        setHasEnvApiKey(data.hasApiKey);
      } catch (error) {
        console.error('Failed to check API key:', error);
        setHasEnvApiKey(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkApiKey();
  }, []);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      setUserSettings(JSON.parse(savedSettings));
    }
    const savedApiKey = localStorage.getItem('apiKey');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
    const savedModel = localStorage.getItem('model');
    if (savedModel) {
      setModel(savedModel);
    }
  }, []);

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('userSettings', JSON.stringify(userSettings));
  }, [userSettings]);

  useEffect(() => {
    localStorage.setItem('apiKey', apiKey);
  }, [apiKey]);

  useEffect(() => {
    localStorage.setItem('model', model);
  }, [model]);

  // Update theme when it changes or system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const updateTheme = () => {
      const isDark = userSettings.theme === 'dark' || 
        (userSettings.theme === 'system' && mediaQuery.matches);
      document.documentElement.classList.toggle('dark', isDark);
      setCurrentTheme(isDark ? 'dark' : 'light');
    };

    updateTheme();
    mediaQuery.addEventListener('change', updateTheme);

    return () => mediaQuery.removeEventListener('change', updateTheme);
  }, [userSettings.theme]);

  if (isLoading) {
    return (
      <main className={`flex min-h-screen flex-col items-center justify-center ${currentTheme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </main>
    );
  }

  return (
    <main className={`flex min-h-screen flex-col items-center ${currentTheme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <div className="w-full max-w-5xl flex flex-col h-screen relative">
        {/* Header */}
        <div className={`fixed top-0 left-0 right-0 z-30 transition-transform duration-300 ${
          showHeader ? 'translate-y-0' : '-translate-y-full'
        } ${currentTheme === 'dark' ? 'bg-gray-900/80' : 'bg-gray-100/80'} backdrop-blur-sm`}>
          <div className="max-w-5xl mx-auto p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <ChatBubbleLeftRightIcon className="h-8 w-8 text-blue-500" />
              <h1 className={`text-xl font-bold ${currentTheme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                {isSettingsOpen ? 'Settings' : (userSettings.username ? `Welcome, ${userSettings.username}` : 'Chat with AI')}
              </h1>
            </div>
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className={`p-2 ${
                currentTheme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-600 hover:bg-gray-700'
              } text-white rounded-full transition-colors`}
              aria-label="Settings"
            >
              {isSettingsOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Cog6ToothIcon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Main content with padding for header */}
        <div className="flex-1 pt-16">
          <ChatInterface 
            apiKey={apiKey} 
            model={model} 
            theme={currentTheme}
            hasEnvApiKey={hasEnvApiKey}
          />
        </div>
        
        <SettingsModal
          isOpen={isSettingsOpen}
          apiKey={apiKey}
          setApiKey={setApiKey}
          model={model}
          setModel={setModel}
          userSettings={userSettings}
          setUserSettings={setUserSettings}
          hasEnvApiKey={hasEnvApiKey}
          setIsSettingsOpen={setIsSettingsOpen}
        />
      </div>
    </main>
  );
}
