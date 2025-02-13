import { useState, useRef, useEffect } from 'react';
import { Message } from '@/types/chat';
import { ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import MessageInput from './MessageInput';

interface ChatInterfaceProps {
  apiKey: string;
  model: string;
  theme: 'light' | 'dark';
  hasEnvApiKey: boolean;
}

export default function ChatInterface({ apiKey, model, theme, hasEnvApiKey }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [inputHeight, setInputHeight] = useState(44); // Default height
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);

  const hasActiveKey = apiKey || hasEnvApiKey;

  const isNearBottom = () => {
    const container = messagesContainerRef.current;
    if (!container) return true;
    
    const threshold = 100; // pixels from bottom
    return container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
  };

  const scrollToBottom = (force = false) => {
    if (messagesEndRef.current && (force || isNearBottom())) {
      setIsAutoScrolling(true);
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      // Reset the flag after animation
      setTimeout(() => setIsAutoScrolling(false), 300);
    }
  };

  // Handle input height changes
  useEffect(() => {
    if (isNearBottom() || isAutoScrolling) {
      scrollToBottom(true);
    }
  }, [inputHeight]);

  // Scroll to bottom when messages change or loading state changes
  useEffect(() => {
    scrollToBottom(true);
  }, [messages, isLoading]);

  // Initialize welcome message
  useEffect(() => {
    const welcomeMessage = {
      id: 'welcome',
      role: 'assistant' as const,
      content: hasActiveKey 
        ? "Hello! 👋 How can I help you today?"
        : "Please add your API key in settings to start chatting.",
      timestamp: Date.now(),
      model: hasEnvApiKey ? 'gpt-3.5-turbo' : undefined
    };
    setMessages([welcomeMessage]);
  }, [hasActiveKey, hasEnvApiKey]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content, apiKey, model }),
      });

      const data = await response.json();
      if (response.ok) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.reply,
          timestamp: Date.now(),
          model: model  // Always include the current model for assistant messages
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        setError(data.error || 'Failed to get response');
      }
    } catch {
      setError('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full relative bg-gradient-to-b from-transparent via-transparent to-transparent">
      <div className={`absolute inset-0 ${
        theme === 'dark'
          ? 'bg-gray-900'
          : 'bg-white'
      }`} />
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto space-y-4 relative scroll-smooth"
        style={{ 
          paddingTop: '1rem',
          paddingLeft: '1rem',
          paddingRight: '1rem',
          paddingBottom: `${inputHeight + 24}px`
        }}
      >
        {!hasActiveKey ? (
          <div className="flex justify-center items-center h-full">
            <div className="text-center p-4 rounded-lg bg-yellow-50 text-yellow-800">
              <p>Please add your API key in settings to start chatting.</p>
              <p className="text-sm mt-2 text-yellow-600">No models available.</p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                onClick={() => copyToClipboard(message.content, message.id)}
                className={`relative group max-w-[80%] cursor-pointer transition-all ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : theme === 'dark' 
                      ? 'bg-gray-800 text-gray-100 hover:bg-gray-700' 
                      : 'bg-white text-gray-900 hover:bg-gray-50'
                } p-3 rounded-xl ring-1 ring-transparent hover:ring-opacity-50 ${
                  message.role === 'user' 
                    ? 'hover:ring-blue-400' 
                    : theme === 'dark'
                      ? 'hover:ring-gray-600'
                      : 'hover:ring-gray-300'
                }`}
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-grow whitespace-pre-wrap">{message.content}</div>
                    <div className={`opacity-0 group-hover:opacity-100 transition-opacity ml-2 ${
                      copiedMessageId === message.id ? 'text-green-400' : message.role === 'user' ? 'text-white/70' : 'text-gray-400'
                    }`}>
                      {copiedMessageId === message.id ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <ClipboardDocumentIcon className="h-4 w-4" />
                      )}
                    </div>
                  </div>
                  <div className={`text-[10px] ${message.role === 'assistant' && message.model ? 'flex items-center gap-2' : ''} ${
                    message.role === 'user' ? 'text-white/50' : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {new Date(message.timestamp).toLocaleTimeString()}
                    {message.role === 'assistant' && message.model && (
                      <>
                        <span className="opacity-50">•</span>
                        <span>{message.model === 'gpt-4o' ? 'GPT-4O' : message.model}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className={`p-4 rounded-xl ${
              theme === 'dark' ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'
            }`}>
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        {error && (
          <div className="flex justify-center">
            <div className="p-4 bg-red-100 text-red-900 rounded-xl">
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} className="h-1" />
      </div>
      
      <div className="fixed bottom-0 left-0 right-0 z-20">
        <div className={`absolute inset-0 bg-gradient-to-t ${
          theme === 'dark'
            ? 'from-gray-900 via-gray-900/95 to-transparent'
            : 'from-white via-white/95 to-transparent'
        }`} 
        style={{ height: `${inputHeight + 24}px` }}
        />
        <div className="max-w-5xl mx-auto relative">
          <div className="mx-4 mb-2">
            <MessageInput 
              onSendMessage={handleSendMessage} 
              disabled={isLoading || (!apiKey && !hasEnvApiKey)} 
              theme={theme}
              onHeightChange={setInputHeight}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 