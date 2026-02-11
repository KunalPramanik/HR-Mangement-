'use client';

import { useState } from 'react';

export default function AiAssistant() {
    const [query, setQuery] = useState('');
    const [messages, setMessages] = useState<{ role: 'user' | 'assistant', text: string }[]>([
        { role: 'assistant', text: "Hello! I'm your HR Assistant. Ask me about policies, leave balance, or finding a colleague." }
    ]);
    const [loading, setLoading] = useState(false);

    const handleSend = () => {
        if (!query.trim()) return;

        const userMsg = query;
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setQuery('');
        setLoading(true);

        // Simulate AI Response
        setTimeout(() => {
            let response = "I'm not sure about that yet. Please contact HR directly.";
            if (userMsg.toLowerCase().includes('leave')) response = "You have 12 days of Annual Leave remaining. To apply, go to the Leave Request page.";
            if (userMsg.toLowerCase().includes('policy')) response = "Our core policies include: Remote Work, Anti-Harassment, and Data Security. You can view the full handbook in the Documents section.";
            if (userMsg.toLowerCase().includes('contact')) response = "You can reach HR at hr@company.com or call extension 404.";

            setMessages(prev => [...prev, { role: 'assistant', text: response }]);
            setLoading(false);
        }, 1500);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] w-full max-w-4xl mx-auto p-4 bg-white rounded-2xl shadow-xl mt-4 border border-gray-100">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/30 animate-pulse">
                        <span className="material-symbols-outlined">auto_awesome</span>
                    </div>
                    <div>
                        <h3 className="font-bold text-[#111827]">AI HR Assistant</h3>
                        <p className="text-xs text-green-500 font-bold flex items-center gap-1">
                            <span className="size-1.5 rounded-full bg-green-500"></span> Online
                        </p>
                    </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                    <span className="material-symbols-outlined">close</span>
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`p-4 rounded-2xl max-w-[80%] text-sm font-medium leading-relaxed 
                            ${msg.role === 'user' ? 'bg-[#3b82f6] text-white rounded-br-none' : 'bg-gray-100 text-gray-700 rounded-bl-none'}
                        `}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-gray-50 p-4 rounded-2xl rounded-bl-none flex items-center gap-2">
                            <span className="size-2 bg-gray-400 rounded-full animate-bounce"></span>
                            <span className="size-2 bg-gray-400 rounded-full animate-bounce delay-75"></span>
                            <span className="size-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 border-t border-gray-100">
                <div className="relative">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Type your question..."
                        className="w-full pl-6 pr-14 py-4 rounded-full bg-gray-50 border-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all shadow-inner"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!query.trim() || loading}
                        className="absolute right-2 top-1/2 -translate-y-1/2 size-10 rounded-full bg-[#111827] text-white flex items-center justify-center hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span className="material-symbols-outlined text-[20px]">send</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
