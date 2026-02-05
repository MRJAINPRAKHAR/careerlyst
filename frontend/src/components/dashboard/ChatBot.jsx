import React, { useState, useEffect, useRef } from "react";
import { api } from "../../api/client";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
    X,
    Paperclip,
    ArrowUp,
} from "lucide-react";

export default function ChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState(() => {
        const saved = localStorage.getItem("ai_chat_history");
        return saved ? JSON.parse(saved) : [];
    });
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [files, setFiles] = useState([]);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        localStorage.setItem("ai_chat_history", JSON.stringify(messages));
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
            if (messages.length === 0) {
                setMessages([{
                    text: "Hello! How can I help you today?",
                    sender: "ai"
                }]);
            }
        }
    }, [isOpen]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleFileSelect = (e) => {
        if (e.target.files) {
            const selected = Array.from(e.target.files);
            if (files.length + selected.length > 2) {
                alert("Maximum 2 files allowed.");
                return;
            }
            setFiles(prev => [...prev, ...selected]);
        }
    };

    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSend = async () => {
        if (!input.trim() && files.length === 0) return;

        // Optimistic UI update
        const userMsg = {
            text: input + (files.length > 0 ? `\n\n**Attached Files:**\n${files.map(f => `- ${f.name}`).join("\n")}` : ""),
            sender: "user"
        };
        setMessages(prev => [...prev, userMsg]);

        const currentFiles = [...files];

        setInput("");
        setFiles([]);
        setLoading(true);

        try {
            const history = messages.filter(m => m.sender !== 'system');

            const formData = new FormData();
            formData.append("message", input);
            formData.append("history", JSON.stringify(history));
            currentFiles.forEach(file => {
                formData.append("files", file);
            });

            const res = await api.post("/api/ai/chat", formData);
            const aiMsg = { text: res.data.reply, sender: "ai" };
            setMessages(prev => [...prev, aiMsg]);
        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, { text: "Network error. Please check your connection.", sender: "system" }]);
        } finally {
            setLoading(false);
        }
    };

    const clearChat = () => {
        // Clear storage
        localStorage.removeItem("ai_chat_history");
        // Reset state immediately without closing window
        setMessages([{
            text: "Hello! How can I help you today?",
            sender: "ai"
        }]);
    };

    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible) return null;

    return (
        <>
            <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end pointer-events-auto font-sans antialiased text-slate-200">
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.95 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="w-[340px] md:w-[380px] lg:sm:w-[420px] h-[500px] md:h-[600px] max-h-[80vh] flex flex-col overflow-hidden rounded-2xl shadow-2xl bg-black/40 backdrop-blur-xl border border-white/10 mb-4 ring-1 ring-white/5"
                        >
                            {/* HEADER */}
                            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-white/5 backdrop-blur-md">
                                <div className="flex items-center gap-3">
                                    <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/20 shadow-lg">
                                        <img src="/bot-avatar.jpg" alt="Nova" className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-sm text-white tracking-wide">Nova AI</h3>
                                        <p className="text-[10px] text-white/50 font-medium tracking-wider uppercase">Online</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button onClick={clearChat} className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors" title="Clear Chat">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                    <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors">
                                        <X size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* MESSAGES AREA */}
                            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar space-y-6">
                                {messages.map((msg, i) => (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        key={i}
                                        className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
                                    >
                                        <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden shadow-md border ${msg.sender === 'ai'
                                            ? 'border-white/10'
                                            : 'border-white/5 bg-zinc-800'
                                            }`}>
                                            {msg.sender === 'ai' ? (
                                                <img src="/bot-avatar.jpg" alt="AI" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-xs font-bold text-zinc-400">You</span>
                                            )}
                                        </div>
                                        <div className={`flex-1 max-w-[85%]`}>
                                            <div className={`px-4 py-3 text-sm leading-relaxed shadow-lg backdrop-blur-md ${msg.sender === 'user'
                                                ? 'bg-violet-600/90 text-white rounded-2xl rounded-tr-sm border border-violet-500/50'
                                                : 'bg-zinc-900/60 text-slate-200 rounded-2xl rounded-tl-sm border border-white/10'
                                                }`}>
                                                {msg.sender === 'user' ? (
                                                    msg.text
                                                ) : (
                                                    <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10">
                                                        <ReactMarkdown
                                                            remarkPlugins={[remarkGfm]}
                                                            components={{
                                                                code: ({ node, ...props }) => <code className="bg-white/10 px-1 py-0.5 rounded text-fuchsia-300 font-mono text-xs" {...props} />
                                                            }}
                                                        >
                                                            {msg.text}
                                                        </ReactMarkdown>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                                {loading && (
                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10 shadow-md">
                                            <img src="/bot-avatar.jpg" alt="AI" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="px-4 py-3 bg-zinc-900/60 rounded-2xl rounded-tl-sm border border-white/10 flex items-center gap-1.5 h-[44px]">
                                            <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce"></div>
                                            <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce delay-100"></div>
                                            <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce delay-200"></div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* INPUT AREA */}
                            <div className="p-4 bg-black/20 backdrop-blur-xl border-t border-white/5 z-20">
                                {files.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {files.map((f, i) => (
                                            <div key={i} className="flex items-center gap-1.5 bg-violet-500/20 px-3 py-1.5 rounded-full text-xs text-violet-200 border border-violet-500/30">
                                                <Paperclip size={12} />
                                                <span className="truncate max-w-[120px]">{f.name}</span>
                                                <button onClick={() => removeFile(i)} className="hover:text-white ml-1">
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div className="relative group">
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-full opacity-20 group-hover:opacity-50 transition duration-500 blur-md"></div>
                                    <div className="relative flex items-center gap-2 bg-[#0a0a0a] p-1.5 rounded-full border border-white/10 shadow-xl transition-colors">
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="w-9 h-9 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                                            title="Attach file"
                                        >
                                            <Paperclip size={18} />
                                        </button>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            multiple
                                            accept=".pdf,.txt,.doc,.docx,.json,.js"
                                            onChange={handleFileSelect}
                                        />
                                        <input
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter" && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleSend();
                                                }
                                            }}
                                            placeholder="Ask Nova..."
                                            className="flex-1 bg-transparent !border-none !outline-none !ring-0 focus:!ring-0 focus:!border-transparent placeholder:text-zinc-500 px-2 font-medium"
                                            disabled={loading}
                                        />
                                        <button
                                            onClick={() => handleSend()}
                                            disabled={loading || (!input.trim() && files.length === 0)}
                                            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-lg ${input.trim() || files.length > 0
                                                ? 'bg-violet-600 text-white hover:bg-violet-500 hover:scale-105'
                                                : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                                                }`}
                                        >
                                            <ArrowUp size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* FAB BUTTON & TOOLTIP */}
                <div className="relative group">
                    {/* CLOSE BUTTON (MOBILE) */}
                    {!isOpen && (
                        <button
                            onClick={() => setIsVisible(false)}
                            className="md:hidden absolute -top-2 -right-2 z-[60] bg-zinc-800 text-white border border-white/10 rounded-full p-1 shadow-lg"
                        >
                            <X size={12} />
                        </button>
                    )}

                    <AnimatePresence>
                        {!isOpen && (
                            <motion.div
                                initial={{ opacity: 0, x: 20, scale: 0.8 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="absolute bottom-4 right-12 md:right-16 mr-2 whitespace-nowrap z-50 pointer-events-none"
                            >
                                <div className="bg-white/10 backdrop-blur-xl border border-white/10 text-white px-3 py-1.5 rounded-xl shadow-2xl text-xs font-medium relative">
                                    Hey, I am Nova!
                                    <div className="absolute right-[-4px] bottom-3 w-2 h-2 bg-white/10 border-b border-r border-white/10 rotate-[-45deg] bg-inherit backdrop-blur-xl"></div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="group relative w-10 h-10 md:w-14 md:h-14 flex items-center justify-center focus:outline-none"
                    >
                        <div className={`absolute inset-0 bg-violet-600 rounded-full blur-md opacity-40 group-hover:opacity-80 transition-opacity duration-500 ${isOpen ? 'opacity-0' : ''}`}></div>

                        <div className="relative w-full h-full bg-black/80 backdrop-blur-md rounded-full border border-white/10 flex items-center justify-center shadow-2xl overflow-hidden group-hover:scale-105 transition-transform duration-300">
                            {isOpen ? (
                                <X size={20} className="text-white md:hidden" /> // Smaller closing X on mobile
                            ) : (
                                <img src="/bot-avatar.jpg" className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity" alt="Nova" />
                            )}
                            {/* Larger X for desktop to match original design */}
                            {isOpen && <X size={24} className="text-white hidden md:block" />}
                        </div>
                    </button>
                </div>
            </div>

            <style>{`
                .prose pre {
                    background-color: rgba(0,0,0,0.5) !important;
                    border: 1px solid rgba(255,255,255,0.1);
                }
            `}</style>
        </>
    );
}
