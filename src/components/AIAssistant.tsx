import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn } from '../lib/utils';

const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([
    { role: 'assistant', content: "Xin chào! Tôi là Trợ lý AI của Agency. Tôi có thể giúp bạn lên ý tưởng chiến dịch, tóm tắt thông tin khách hàng tiềm năng hoặc đưa ra các mẹo quản lý agency. Tôi có thể giúp gì cho bạn hôm nay?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: userMessage,
        config: {
          systemInstruction: "Bạn là một Chuyên gia Tư vấn Agency Marketing. Bạn giúp các chủ agency quản lý CRM, tối ưu hóa tỷ lệ chuyển đổi lead, lên ý tưởng các chiến dịch marketing (SEO, PPC, Social Media) và cải thiện mối quan hệ với khách hàng. Hãy đưa ra những lời khuyên thực tế, chuyên nghiệp và dựa trên dữ liệu. Trả lời bằng tiếng Việt.",
        },
      });

      setMessages(prev => [...prev, { role: 'assistant', content: response.text || "Xin lỗi, tôi không thể tạo phản hồi vào lúc này." }]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Xin lỗi, tôi đã gặp lỗi. Vui lòng thử lại sau." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] md:h-[calc(100vh-12rem)] bg-card-dark rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden animate-in fade-in duration-500">
      <div className="p-6 border-b border-white/5 bg-white/5 flex items-center gap-4">
        <div className="p-3 bg-accent-yellow text-black rounded-2xl shadow-lg shadow-accent-yellow/10">
          <Sparkles size={20} />
        </div>
        <div>
          <h3 className="font-black text-white uppercase tracking-tight">Cố vấn AI Agency</h3>
          <p className="text-[10px] text-text-muted font-black uppercase tracking-widest">Powered by Gemini AI</p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {messages.map((msg, i) => (
          <div key={i} className={cn(
            "flex gap-4 max-w-[90%] md:max-w-[80%]",
            msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
          )}>
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-white/5",
              msg.role === 'user' ? "bg-white/5 text-text-muted" : "bg-accent-yellow/10 text-accent-yellow"
            )}>
              {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
            </div>
            <div className={cn(
              "p-5 rounded-3xl text-sm leading-relaxed",
              msg.role === 'user' 
                ? "bg-accent-yellow text-black rounded-tr-none font-bold" 
                : "bg-white/5 text-white rounded-tl-none border border-white/5 font-medium"
            )}>
              <div className={cn(
                "prose prose-sm max-w-none",
                msg.role === 'user' ? "prose-black" : "prose-invert"
              )}>
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-4 max-w-[80%]">
            <div className="w-10 h-10 rounded-xl bg-accent-yellow/10 text-accent-yellow flex items-center justify-center shrink-0 border border-white/5">
              <Bot size={20} />
            </div>
            <div className="p-5 rounded-3xl bg-white/5 border border-white/5 flex items-center gap-3">
              <Loader2 size={18} className="animate-spin text-accent-yellow" />
              <span className="text-xs font-black text-text-muted uppercase tracking-widest">Đang suy nghĩ...</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 border-t border-white/5 bg-white/5">
        <div className="relative">
          <input 
            type="text" 
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Hỏi về ý tưởng chiến dịch, tóm tắt lead..."
            className="w-full pl-6 pr-14 py-4 bg-white/5 border border-white/5 rounded-2xl text-sm font-bold text-white focus:bg-white/10 focus:border-accent-yellow outline-none transition-all placeholder:text-text-muted/50"
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-accent-yellow text-black rounded-xl hover:bg-accent-yellow/90 disabled:opacity-50 transition-all shadow-lg shadow-accent-yellow/10"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
