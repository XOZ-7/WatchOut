import React, { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, X, Loader2, ShieldAlert, ShieldCheck, AlertTriangle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { analyzeMedicalContent } from '../services/gemini';
import { Message, AnalysisResult } from '../types';
import Markdown from 'react-markdown';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I am the WatchOut AI assistant. I can help you verify medical claims, analyze prescriptions, or check for medical misinformation. How can I assist you today?',
      timestamp: Date.now(),
    }
  ]);
  const [input, setInput] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async () => {
    if ((!input.trim() && !image) || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      image: image || undefined,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setImage(null);
    setIsLoading(true);

    try {
      const result = await analyzeMedicalContent(input, image || undefined);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: typeof result === 'string' ? result : result.explanation,
        analysis: typeof result === 'string' ? undefined : result,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your request. Please try again later.',
        timestamp: Date.now(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] text-white">
      {/* Header */}
      <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/40 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <h2 className="text-lg font-semibold tracking-tight">Medical Verification AI</h2>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium text-white/40 uppercase tracking-widest">
          <span>Real-time Analysis</span>
          <div className="w-px h-4 bg-white/10" />
          <span>Gemini 3.0 Flash</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "flex flex-col max-w-[85%]",
              message.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
            )}
          >
            <div className={cn(
              "p-4 rounded-2xl text-sm leading-relaxed",
              message.role === 'user' 
                ? "bg-emerald-600 text-white rounded-tr-none" 
                : "bg-white/5 border border-white/10 text-white/90 rounded-tl-none"
            )}>
              {message.image && (
                <img 
                  src={message.image} 
                  alt="Uploaded content" 
                  className="max-w-xs rounded-lg mb-3 border border-white/10"
                  referrerPolicy="no-referrer"
                />
              )}
              <div className="prose prose-invert prose-sm max-w-none">
                <Markdown>{message.content}</Markdown>
              </div>
            </div>

            {/* Analysis Card */}
            {message.analysis && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-3 w-full bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
              >
                <div className={cn(
                  "px-4 py-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider",
                  message.analysis.flag === 'Misinformation' ? "bg-red-500/20 text-red-400" :
                  message.analysis.flag === 'Verified' ? "bg-emerald-500/20 text-emerald-400" :
                  "bg-amber-500/20 text-amber-400"
                )}>
                  {message.analysis.flag === 'Misinformation' ? <ShieldAlert className="w-3 h-3" /> :
                   message.analysis.flag === 'Verified' ? <ShieldCheck className="w-3 h-3" /> :
                   <AlertTriangle className="w-3 h-3" />}
                  {message.analysis.flag} • {message.analysis.confidenceScore}% Confidence
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <Info className="w-4 h-4 text-white/40 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-white/60 leading-relaxed italic">
                      {message.analysis.reasoning}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
            
            <span className="text-[10px] text-white/20 mt-1 px-1">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </motion.div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 text-white/40 text-xs animate-pulse">
            <Loader2 className="w-3 h-3 animate-spin" />
            AI is analyzing medical data...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-6 bg-black/40 border-t border-white/10 backdrop-blur-xl">
        <AnimatePresence>
          {image && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mb-4 relative inline-block"
            >
              <img src={image} alt="Preview" className="h-20 w-20 object-cover rounded-xl border border-white/20" />
              <button
                onClick={() => setImage(null)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative flex items-center gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-3 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all"
          >
            <ImageIcon className="w-5 h-5" />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about a medical claim or upload a prescription..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-white/20"
          />
          <button
            onClick={handleSend}
            disabled={(!input.trim() && !image) || isLoading}
            className="p-3 rounded-xl bg-emerald-500 text-black hover:bg-emerald-400 disabled:opacity-50 disabled:hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-500/20"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-[10px] text-center text-white/20 mt-4 uppercase tracking-widest font-medium">
          WatchOut AI can make mistakes. Always consult a medical professional.
        </p>
      </div>
    </div>
  );
}
