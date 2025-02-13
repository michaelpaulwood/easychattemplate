export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  model?: string;  // Optional because user messages don't need it
} 