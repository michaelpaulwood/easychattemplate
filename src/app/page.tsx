'use client';

import { useState } from 'react';
import ChatInterface from '@/components/ChatInterface';
import SettingsModal from '@/components/SettingsModal';

export default function Home() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [provider, setProvider] = useState<'openai' | 'ollama'>('openai');

  return (
    <main className="flex min-h-screen flex-col items-center bg-gray-100">
      <div className="w-full max-w-4xl p-4 flex flex-col h-screen">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800">AI Chat</h1>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Settings
          </button>
        </div>
        
        <ChatInterface apiKey={apiKey} provider={provider} />
        
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          apiKey={apiKey}
          setApiKey={setApiKey}
          provider={provider}
          setProvider={setProvider}
        />
      </div>
    </main>
  );
}
