import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { MessageSquare, User, Loader2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../utils/cn';

const SupportManager = ({ onSelectConversation, selectedUserId }) => {
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchConversations = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/chat/support/conversations');
            if (data.success) {
                setConversations(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch support conversations', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConversations();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center p-20">
            <Loader2 className="h-6 w-6 text-slate-400 animate-spin" />
        </div>
    );

    if (conversations.length === 0) return (
        <div className="flex flex-col items-center justify-center p-20 text-center opacity-50">
            <MessageSquare className="h-10 w-10 text-slate-300 mb-4" />
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500">No active chats</h4>
            <p className="text-[10px] text-slate-400 mt-2">All incoming support requests from users will appear here.</p>
        </div>
    );

    return (
        <div className="space-y-2">
            {conversations.map((conv) => (
                <button
                    key={conv._id}
                    onClick={() => onSelectConversation(conv.user)}
                    className={cn(
                        "w-full flex items-center justify-between p-4 rounded-xl border transition-all group shadow-sm hover:shadow-md",
                        selectedUserId === conv.user._id 
                            ? "bg-slate-100 border-slate-300 ring-1 ring-slate-200" 
                            : "bg-slate-50 border-transparent hover:border-slate-200 hover:bg-white"
                    )}
                >
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center overflow-hidden">
                            {conv.user.profilePicture ? (
                                <img 
                                    src={conv.user.profilePicture} 
                                    alt=""
                                    className="w-full h-full object-cover" 
                                />
                            ) : (
                                <User className="h-5 w-5 text-slate-400" />
                            )}
                        </div>
                        <div className="text-left">
                            <h5 className="text-[11px] font-bold text-slate-900 uppercase tracking-tight">{conv.user.name}</h5>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-[8px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                                    {conv.user.role}
                                </span>
                                <p className="text-[10px] text-slate-500 truncate max-w-[150px] font-medium italic">"{conv.lastMessage.content}"</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                         <span className="text-[9px] font-bold text-slate-400 uppercase">
                            {new Date(conv.lastMessage.createdAt).toLocaleDateString()}
                         </span>
                         <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
                    </div>
                </button>
            ))}
        </div>
    );
};

export default SupportManager;
