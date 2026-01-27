import React, { useState } from 'react';
import SupportManager from './SupportManager';
import ChatWindow from './ChatWindow';
import { MessageSquare, ShieldCheck, Zap } from 'lucide-react';

const SupportCenter = () => {
    const [selectedUser, setSelectedUser] = useState(null);

    return (
        <div className="flex h-[600px] overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm">
            {/* Left: Sidebar (List) */}
            <div className="w-[350px] border-r border-slate-100 flex flex-col bg-slate-50/50">
                <div className="p-6 border-b border-slate-100 bg-white">
                    <div className="flex items-center gap-2 mb-1">
                        <Zap className="h-3 w-3 text-emerald-600" />
                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[2px]">Query Queue</h3>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-1">
                    <SupportManager 
                        onSelectConversation={(u) => setSelectedUser(u)} 
                        selectedUserId={selectedUser?._id} 
                    />
                </div>
            </div>

            {/* Right: Chat Area */}
            <div className="flex-1 flex flex-col bg-slate-50 relative">
                {selectedUser ? (
                    <div className="flex-1">
                        <ChatWindow 
                            mode="inline"
                            isSupport={true}
                            supportUserId={selectedUser._id}
                            onClose={() => setSelectedUser(null)}
                        />
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-6">
                        <div className="w-20 h-20 bg-white rounded-3xl border border-slate-200 shadow-sm flex items-center justify-center relative">
                             <MessageSquare className="h-8 w-8 text-slate-200" />
                             <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
                        </div>
                        <div className="max-w-[200px] space-y-2">
                            <h4 className="text-sm font-bold text-slate-900 tracking-tight">Select a Chat</h4>
                            <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                                Choose an active inquiry from the sidebar to begin coordination.
                            </p>
                        </div>
                        
                        <div className="absolute bottom-8 flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-slate-100 shadow-sm">
                            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Secure Admin Portal</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SupportCenter;
