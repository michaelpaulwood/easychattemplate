import { useState, useEffect } from 'react';
import { XMarkIcon, TrashIcon } from '@heroicons/react/24/outline';

interface UserSettings {
  username: string;
  email: string;
  theme: 'light' | 'dark' | 'system';
}

interface ModelConfig {
  id: string;
  name: string;
  provider: string;
  description: string;
  apiKeyPlaceholder: string;
  source: 'env' | 'browser';
  isActive: boolean;
}

interface SettingsModalProps {
  isOpen: boolean;
  setApiKey: (key: string) => void;
  model: string;
  setModel: (model: string) => void;
  userSettings: UserSettings;
  setUserSettings: (settings: UserSettings) => void;
  hasEnvApiKey: boolean;
  setIsSettingsOpen: (isOpen: boolean) => void;
}

export default function SettingsModal({
  isOpen,
  setApiKey,
  model,
  setModel,
  userSettings,
  setUserSettings,
  hasEnvApiKey,
  setIsSettingsOpen,
}: SettingsModalProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [tempApiKey, setTempApiKey] = useState('');
  const [showClearConfirmation, setShowClearConfirmation] = useState(false);
  const [showAddModel, setShowAddModel] = useState(false);
  const [showModelActions, setShowModelActions] = useState<string | null>(null);
  const [addedModels, setAddedModels] = useState<ModelConfig[]>(() => {
    // Initialize with env model if available
    const initialModels: ModelConfig[] = [];
    if (hasEnvApiKey) {
      initialModels.push({
        id: 'gpt-3.5-turbo',
        name: 'GPT-3.5 Turbo',
        provider: 'openai',
        description: 'Fast and efficient for most tasks',
        apiKeyPlaceholder: 'Enter your OpenAI API key for GPT-3.5',
        source: 'env',
        isActive: true  // Env model is active by default if available
      });
    }
    return initialModels;
  });

  const handleModelActivate = (modelId: string) => {
    setAddedModels(prevModels => 
      prevModels.map(m => ({
        ...m,
        isActive: m.id === modelId
      }))
    );
    setModel(modelId);
    setShowModelActions(null);
  };

  // Effect to handle model activation on mount
  useEffect(() => {
    if (addedModels.length > 0) {
      // If env model exists, it should be active
      if (hasEnvApiKey) {
        const envModel = addedModels.find(m => m.source === 'env');
        if (envModel) {
          handleModelActivate(envModel.id);
        }
      } else {
        // If no env model, activate the first available model
        const firstModel = addedModels[0];
        if (firstModel) {
          handleModelActivate(firstModel.id);
        }
      }
    }
  }, []);

  if (!isOpen) return null;

  const models = [
    { 
      id: 'gpt-3.5-turbo',
      name: 'GPT-3.5 Turbo',
      provider: 'openai',
      description: 'Fast and efficient for most tasks',
      apiKeyPlaceholder: 'Enter your OpenAI API key for GPT-3.5'
    },
    { 
      id: 'gpt-4o',
      name: 'GPT-4o',
      provider: 'openai',
      description: 'Most capable model, better at complex tasks',
      apiKeyPlaceholder: 'Enter your OpenAI API key for GPT-4o'
    },
  ];

  const handleModelDelete = (modelId: string) => {
    setAddedModels(prevModels => {
      const newModels = prevModels.filter(m => m.id !== modelId);
      
      // If we're deleting the active model
      if (model === modelId) {
        // If env model exists, activate it
        const envModel = newModels.find(m => m.source === 'env');
        if (envModel) {
          setModel(envModel.id);
          return newModels.map(m => ({
            ...m,
            isActive: m.id === envModel.id
          }));
        }
        // Otherwise activate the first available model
        if (newModels.length > 0) {
          setModel(newModels[0].id);
          return newModels.map((m, index) => ({
            ...m,
            isActive: index === 0
          }));
        }
      }
      
      return newModels;
    });
    setShowModelActions(null);
  };

  const handleAddNewModel = (modelId: string, apiKey: string) => {
    const modelToAdd = models.find(m => m.id === modelId);
    if (modelToAdd) {
      setAddedModels(prevModels => [
        ...prevModels.map(m => ({
          ...m,
          isActive: false  // Deactivate all existing models
        })),
        {
          ...modelToAdd,
          source: 'browser',
          isActive: true  // Make the new model active
        }
      ]);
      setModel(modelId);
      setApiKey(apiKey);
      setShowAddModel(false);
      setTempApiKey('');
    }
  };

  const handleUsernameChange = (username: string) => {
    setUserSettings({ ...userSettings, username });
  };

  const handleEmailChange = (email: string) => {
    setUserSettings({ ...userSettings, email });
  };

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    setUserSettings({ ...userSettings, theme });
  };

  const handleApiKeyChange = async (newKey: string) => {
    setVerificationError(null);
    setTempApiKey(newKey);
    
    if (newKey) {
      setIsVerifying(true);
      try {
        const response = await fetch('/api/check-api-key', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ apiKey: newKey }),
        });
        
        const data = await response.json();
        if (!data.isValid) {
          setVerificationError(data.message || 'Invalid API key');
          setTempApiKey('');
        } else {
          setApiKey(newKey);
          // Don't automatically set model to gpt-3.5-turbo
          // Let the user's selection persist
        }
      } catch {
        setVerificationError('Failed to verify API key');
        setTempApiKey('');
      } finally {
        setIsVerifying(false);
      }
    }
  };

  const handleClearData = () => {
    // Reset user settings
    setUserSettings({
      username: '',
      email: '',
      theme: 'system'
    });
    
    // Reset API key and model settings (except env)
    if (!hasEnvApiKey) {
      setApiKey('');
      setModel('gpt-3.5-turbo');
    }
    
    // Reset other states
    setTempApiKey('');
    
    // Clear localStorage
    localStorage.removeItem('userSettings');
    localStorage.removeItem('apiKey');
    localStorage.removeItem('model');
  };

  const inputClasses = "w-full p-4 text-base border border-gray-700 rounded-xl text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-600 bg-gray-800 shadow-sm";
  const selectClasses = "w-full p-4 text-base border border-gray-700 rounded-xl text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-600 bg-gray-800 shadow-sm appearance-none cursor-pointer";
  const selectWrapperClasses = "relative after:content-[''] after:pointer-events-none after:absolute after:right-4 after:top-1/2 after:-translate-y-1/2 after:border-8 after:border-transparent after:border-t-gray-400 after:transition-colors hover:after:border-t-blue-500";

  return (
    <div className="fixed inset-0 z-50 bg-gray-900">
      {/* Main scrollable container */}
      <div className="h-full overflow-y-auto">
        {/* Content */}
        <div className="max-w-2xl mx-auto p-6 space-y-6">
          {/* Header with close button */}
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">Settings</h1>
            <button
              onClick={() => setIsSettingsOpen(false)}
              className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-full transition-colors"
              aria-label="Close Settings"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Account Settings Card */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <h2 className="text-lg font-medium text-gray-200 mb-4">Account Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  value={userSettings.username}
                  onChange={(e) => handleUsernameChange(e.target.value)}
                  placeholder="Enter your display name"
                  className={inputClasses}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={userSettings.email || ''}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  placeholder="Enter your email address"
                  className={inputClasses}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Theme
                </label>
                <div className={selectWrapperClasses}>
                  <select
                    value={userSettings.theme}
                    onChange={(e) => handleThemeChange(e.target.value as 'light' | 'dark' | 'system')}
                    className={selectClasses}
                  >
                    <option value="system">System Theme</option>
                    <option value="light">Light Theme</option>
                    <option value="dark">Dark Theme</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Model Settings Card */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <h2 className="text-lg font-medium text-gray-200 mb-4">Model Settings</h2>
            <div className="space-y-4">
              {/* List of Added Models */}
              {addedModels.map((m) => (
                <div
                  key={m.id}
                  className={`border rounded-xl p-4 transition-all ${
                    m.isActive
                      ? 'bg-green-900/20 border-green-600/30'
                      : 'bg-amber-900/20 border-amber-600/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <span className={`text-sm font-medium ${
                        m.isActive ? 'text-green-400' : 'text-amber-400'
                      }`}>
                        {m.source === 'env' ? `Local .env - ${m.name}` : m.name}
                      </span>
                      <p className="text-xs text-gray-400">{m.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {showModelActions === m.id ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleModelActivate(m.id)}
                            className={`px-3 py-1 rounded-lg text-xs font-medium ${
                              m.isActive
                                ? 'bg-green-900/30 text-green-400 border border-green-600/30'
                                : 'bg-amber-900/30 text-amber-400 border border-amber-600/30 hover:bg-amber-900/40'
                            }`}
                          >
                            {m.isActive ? 'Active' : 'Activate'}
                          </button>
                          {m.source === 'browser' && (
                            <button
                              onClick={() => handleModelDelete(m.id)}
                              className="p-1 rounded-lg text-red-400 hover:bg-red-900/20"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowModelActions(m.id)}
                          className={`px-3 py-1 rounded-lg text-xs font-medium ${
                            m.isActive
                              ? 'bg-green-900/30 text-green-400 border border-green-600/30'
                              : 'bg-amber-900/30 text-amber-400 border border-amber-600/30'
                          }`}
                        >
                          {m.isActive ? 'Active' : 'Connected'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Add New Model Button */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                {!showAddModel ? (
                  <button
                    onClick={() => setShowAddModel(true)}
                    className="w-full p-4 border-2 border-dashed border-gray-700 rounded-xl text-sm text-gray-400 hover:border-gray-600 hover:text-gray-300 transition-colors flex items-center justify-center gap-2 bg-gray-800/50"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Add New Model
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-200">Add New Model</h3>
                      <button
                        onClick={() => {
                          setShowAddModel(false);
                          setTempApiKey('');
                          setVerificationError(null);
                        }}
                        className="text-gray-400 hover:text-gray-300"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Model
                      </label>
                      <div className={selectWrapperClasses}>
                        <select
                          value={model}
                          onChange={(e) => setModel(e.target.value)}
                          className={selectClasses}
                        >
                          {models.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        API Key
                      </label>
                      <input
                        type="password"
                        value={tempApiKey}
                        onChange={(e) => handleApiKeyChange(e.target.value)}
                        placeholder="Enter your OpenAI API key"
                        className={`${inputClasses} ${verificationError ? 'border-red-500' : ''}`}
                      />
                      {isVerifying && (
                        <p className="mt-2 text-sm text-blue-400">
                          Verifying API key...
                        </p>
                      )}
                      {verificationError && (
                        <p className="mt-2 text-sm text-red-400">
                          {verificationError}
                        </p>
                      )}
                    </div>

                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => {
                          setShowAddModel(false);
                          setTempApiKey('');
                          setVerificationError(null);
                        }}
                        className="px-4 py-2 bg-gray-800 text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors border border-gray-700"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleAddNewModel(model, tempApiKey)}
                        disabled={!tempApiKey || !!verificationError || isVerifying}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                          !tempApiKey || !!verificationError || isVerifying
                            ? 'bg-gray-800 text-gray-600 cursor-not-allowed border border-gray-700'
                            : 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-600/30'
                        }`}
                      >
                        Add Model
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Coming Soon Section */}
              <div className="bg-blue-900/20 border border-blue-600/30 rounded-xl p-4">
                <h3 className="text-sm font-medium text-blue-400 mb-1">Coming Soon</h3>
                <p className="text-sm text-blue-400/80">
                  Support for additional AI models and providers will be added in future updates.
                </p>
              </div>
            </div>
          </div>

          {/* Clear Data Button */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <h2 className="text-lg font-medium text-gray-200 mb-4">Clear Data</h2>
            <div className="space-y-4">
              <p className="text-sm text-gray-400">
                This will reset all your settings and remove any stored API keys from your browser.
                {hasEnvApiKey && ' Your environment API key will not be affected.'}
              </p>
              {!showClearConfirmation ? (
                <button
                  onClick={() => setShowClearConfirmation(true)}
                  className="px-4 py-2 bg-red-600/20 text-red-400 text-sm font-medium rounded-lg hover:bg-red-600/30 transition-colors border border-red-600/30"
                >
                  Clear All Data
                </button>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-red-400">
                    Are you absolutely sure? This action cannot be undone.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowClearConfirmation(false)}
                      className="flex-1 px-4 py-2 bg-gray-800 text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors border border-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        handleClearData();
                        setShowClearConfirmation(false);
                      }}
                      className="flex-1 px-4 py-2 bg-red-600/20 text-red-400 text-sm font-medium rounded-lg hover:bg-red-600/30 transition-colors border border-red-600/30"
                    >
                      Yes, Clear All Data
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 