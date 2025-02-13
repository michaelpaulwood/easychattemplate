import { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  disabled: boolean;
  theme: 'light' | 'dark';
  onHeightChange: (height: number) => void;
}

export default function MessageInput({ onSendMessage, disabled, theme, onHeightChange }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 200);
      textarea.style.height = `${newHeight}px`;
      onHeightChange(newHeight + 16); // Add extra padding to the height
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        onHeightChange(48); // Reset to default height (32 + 16 padding)
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder={disabled ? "Please configure API key in Settings" : "Type your message..."}
        className={`w-full pl-5 pr-14 py-2.5 text-sm font-normal rounded-2xl focus:ring-1 focus:ring-blue-500/50 focus:outline-none transition-all resize-none min-h-[44px] max-h-[200px] hide-scrollbar leading-relaxed ${
          theme === 'dark'
            ? 'bg-gray-800/50 text-gray-100 placeholder:text-gray-600 backdrop-blur-sm'
            : 'bg-gray-100/50 text-gray-900 placeholder:text-gray-500 backdrop-blur-sm'
        }`}
        disabled={disabled}
        rows={1}
      />
      <div className="absolute right-3 bottom-[8px]">
        <button
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          className={`p-2 rounded-xl transition-all ${
            message.trim() && !disabled
              ? theme === 'dark'
                ? 'text-blue-400 hover:bg-blue-600/20'
                : 'text-blue-600 hover:bg-blue-500/20'
              : theme === 'dark'
                ? 'text-gray-600'
                : 'text-gray-400'
          }`}
          aria-label="Send message"
        >
          <PaperAirplaneIcon className="h-5 w-5 -rotate-45" />
        </button>
      </div>
    </div>
  );
} 