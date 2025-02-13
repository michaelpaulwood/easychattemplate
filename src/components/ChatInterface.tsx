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
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: hasActiveKey 
        ? "Hello! 👋 How can I help you today?"
        : "Please add your API key in settings to start chatting.",
      timestamp: Date.now()
    }]);
  }, [hasActiveKey]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      role: 'user',
      content: content.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          apiKey,
          model,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        role: 'assistant',
        content: data.reply || data.message || 'No response from AI',
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
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
        {!hasActiveKey && (
          <div className="flex justify-center items-center h-full">
            <div className="text-center p-4 rounded-lg bg-yellow-50 text-yellow-800">
              <p>Please add your API key in settings to start chatting.</p>
            </div>
          </div>
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start space-x-4 ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`relative group max-w-[85%] p-4 rounded-2xl cursor-pointer transition-all hover:shadow-lg ${
                message.role === 'user'
                  ? `${theme === 'dark' ? 'bg-blue-600/20 text-blue-100' : 'bg-blue-100 text-blue-900'}`
                  : `${theme === 'dark' ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'}`
              } ${copiedMessageId === message.id ? (
                theme === 'dark' 
                  ? 'ring-1 ring-white/30 bg-opacity-90' 
                  : 'ring-1 ring-gray-900/30 bg-opacity-90'
              ) : ''}`}
              onClick={() => copyToClipboard(message.content, message.id)}
            >
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <ClipboardDocumentIcon className={`h-4 w-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
              </div>
              {copiedMessageId === message.id && (
                <div className={`absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 text-xs rounded-full backdrop-blur-sm ${
                  theme === 'dark'
                    ? 'bg-white/10 text-white/90 border border-white/20'
                    : 'bg-gray-900/10 text-gray-900/90 border border-gray-900/20'
                }`}>
                  Copied!
                </div>
              )}
              <p className="text-sm font-normal whitespace-pre-wrap">{message.content}</p>
              <span className={`text-[10px] ${
                theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
              } mt-1 block`}>
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
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