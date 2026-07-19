import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { X, Send, Sparkles, ShoppingBag, ArrowRight } from 'lucide-react';
import { toggleAIAssistant } from '../store/slices/uiSlice.js';
import API from '../utils/api.js';

// Clean, simple custom markdown parser to convert model replies into HTML
const parseMarkdown = (text) => {
  if (!text) return '';
  
  let html = text;
  
  // Escapes HTML tags
  html = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
    
  // Headers (e.g. ### Header)
  html = html.replace(/^### (.*$)/gim, '<h4 class="text-sm font-black text-slate-800 dark:text-slate-100 mt-3 mb-1">$1</h4>');
  html = html.replace(/^## (.*$)/gim, '<h3 class="text-base font-black text-slate-800 dark:text-slate-100 mt-4 mb-1.5">$1</h3>');
  html = html.replace(/^# (.*$)/gim, '<h2 class="text-lg font-black text-slate-800 dark:text-slate-100 mt-4 mb-2">$1</h2>');
  
  // Bold (e.g. **bold**)
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-extrabold text-slate-800 dark:text-white">$1</strong>');
  
  // Bullet lists
  html = html.replace(/^\s*-\s+(.*$)/gim, '<li class="ml-4 list-disc text-slate-600 dark:text-slate-350">$1</li>');
  
  // Linebreaks
  html = html.replace(/\n/g, '<br />');

  // Simple table parser
  if (html.includes('|')) {
    const lines = html.split('<br />');
    let inTable = false;
    let tableHtml = '<div class="overflow-x-auto my-3"><table class="w-full text-xs text-left border border-slate-200 dark:border-slate-800 rounded-lg"><tbody>';
    
    lines.forEach((line) => {
      if (line.trim().startsWith('|')) {
        inTable = true;
        const cols = line.split('|').map(c => c.trim()).filter(c => c !== '');
        
        // Skip separator row |---|---|
        if (cols[0] && cols[0].includes('---')) return;
        
        tableHtml += '<tr class="border-b border-slate-200 dark:border-slate-850 hover:bg-slate-100/50 dark:hover:bg-slate-900/40">';
        cols.forEach((col) => {
          tableHtml += `<td class="py-2 px-3 text-slate-700 dark:text-slate-300 font-medium">${col}</td>`;
        });
        tableHtml += '</tr>';
      } else {
        if (inTable) {
          inTable = false;
          tableHtml += '</tbody></table></div>';
          tableHtml += line; // Add back non-table content
        }
      }
    });
    
    if (inTable) {
      tableHtml += '</tbody></table></div>';
      html = tableHtml;
    }
  }
  
  return html;
};

const AIAssistantDrawer = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { aiAssistantOpen } = useSelector((state) => state.ui);

  // Auto-detect product context from location pathname
  const currentProductId = useMemo(() => {
    const match = location.pathname.match(/\/product\/([a-f0-9]+)/);
    return match ? match[1] : null;
  }, [location.pathname]);

  // Auto-detect search queries context from query parameters
  const currentSearchQuery = useMemo(() => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get('q') || null;
  }, [location.search]);
  
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: "Hiee! I'm your Shopino Shopping Agent. Ask me anything about deals, comparisons, specifications, or pricing advice!",
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef(null);

  // Quick prompt templates
  const quickPrompts = [
    "Compare iPhone 16 vs Galaxy S25",
    "Which laptop is the best under ₹60,000?",
    "Should I buy now or wait for price drops?"
  ];

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, aiAssistantOpen]);

  if (!aiAssistantOpen) return null;

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    // Clear input if sending from main keyboard
    if (!textToSend) setInputText('');

    // Add user message to UI
    const userMsg = {
      sender: 'user',
      text,
      timestamp: new Date()
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // Gather current context
      const context = {};
      if (currentProductId) context.productId = currentProductId;
      if (currentSearchQuery) context.searchQuery = currentSearchQuery;

      const { data } = await API.post('/ai/chat', {
        message: text,
        context
      });

      if (data.success) {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'ai',
            text: data.reply,
            timestamp: new Date()
          }
        ]);
      }
    } catch (error) {
      console.error('Error talking to AI:', error);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: "I'm sorry, I'm having trouble connecting to my brain right now. Please check if the server is active or try again.",
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-sm transition-opacity duration-300">
      
      {/* Click outside to close overlay */}
      <div 
        className="flex-1 cursor-pointer"
        onClick={() => dispatch(toggleAIAssistant(false))}
      />

      {/* Slide-in drawer container */}
      <div className="w-full max-w-md h-full glass-card border-l flex flex-col shadow-2xl relative animate-slide-in">
        
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/40">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-brand-primary/10 text-brand-primary">
              <Sparkles size={18} className="animate-spin-slow" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-100">Shopino AI Agent</h3>
              <p className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                Online & ready
              </p>
            </div>
          </div>
          <button
            onClick={() => dispatch(toggleAIAssistant(false))}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {messages.map((m, idx) => {
            const isAI = m.sender === 'ai';
            return (
              <div 
                key={idx} 
                className={`flex gap-3 max-w-[85%] ${
                  isAI ? 'mr-auto text-left' : 'ml-auto flex-row-reverse text-right'
                }`}
              >
                {/* Bubble avatar */}
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 font-bold ${
                  isAI 
                    ? 'bg-brand-primary/10 text-brand-primary' 
                    : 'bg-gradient-to-tr from-brand-primary to-brand-secondary text-white'
                }`}>
                  {isAI ? <Sparkles size={12} /> : 'U'}
                </div>

                {/* Bubble details */}
                <div className="flex flex-col gap-1">
                  <div 
                    className={`p-3.5 rounded-2xl text-xs leading-relaxed text-left ${
                      isAI 
                        ? 'bg-slate-50 dark:bg-slate-850 text-slate-700 dark:text-slate-350 rounded-tl-none border border-slate-100 dark:border-slate-800/40' 
                        : 'bg-brand-primary/10 border border-brand-primary/15 text-slate-800 dark:text-slate-100 rounded-tr-none'
                    }`}
                    dangerouslySetInnerHTML={{ __html: parseMarkdown(m.text) }}
                  />
                  <span className="text-[9px] text-slate-400 px-1">
                    {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Typing Loading Indicator */}
          {isLoading && (
            <div className="flex gap-3 max-w-[80%] mr-auto text-left">
              <div className="w-7 h-7 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center text-xs shrink-0">
                <Sparkles size={12} className="animate-spin-slow" />
              </div>
              <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-2xl rounded-tl-none border border-slate-100 dark:border-slate-800/40">
                <div className="flex space-x-1.5 items-center">
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts & Suggestions */}
        {messages.length === 1 && (
          <div className="px-4 pb-2 text-left">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">Suggestions</p>
            <div className="flex flex-col gap-1.5">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSendMessage(prompt)}
                  className="w-full text-left p-2.5 rounded-xl border border-slate-100 dark:border-slate-850/60 bg-slate-50/50 hover:bg-brand-primary/5 dark:bg-slate-900/30 hover:border-brand-primary/30 text-xs font-semibold text-slate-600 dark:text-slate-300 transition-all flex items-center justify-between group cursor-pointer"
                >
                  {prompt}
                  <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-brand-primary" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-4 border-t bg-slate-50/50 dark:bg-slate-900/20">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask about prices, features, wait-times..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 text-slate-850 dark:text-slate-100 placeholder-slate-450 focus:outline-none focus:ring-1.5 focus:ring-brand-primary disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="p-2.5 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-white hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
            >
              <Send size={14} />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default AIAssistantDrawer;
