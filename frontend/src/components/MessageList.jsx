import React from 'react';
import { MessageSquare, User, Clock, ChevronRight, Recycle } from 'lucide-react';
import { cn } from '../utils/cn';

const MessageList = ({ pickups, onSelectConversation, selectedId }) => {
  const chatablePickups = pickups.filter(p => !!p.collector);

  return (
    <div className="space-y-3">
      {chatablePickups.length === 0 ? (
        <div className="bg-white rounded-xl p-16 border border-slate-100 flex flex-col items-center justify-center text-center space-y-4">
             <div className="p-4 bg-slate-50 rounded-full text-slate-300">
                <MessageSquare className="h-8 w-8" />
             </div>
             <div>
                <h4 className="text-sm font-bold text-slate-900">Communication channel pending</h4>
                <p className="text-xs text-slate-400 font-medium max-w-[240px] mt-1 mx-auto">Conversations will be initiated once personnel are dispatched to your location.</p>
             </div>
        </div>
      ) : (
        chatablePickups.map((pickup) => (
          <button
            key={pickup._id}
            onClick={() => onSelectConversation(pickup._id)}
            className={cn(
                "w-full bg-white p-4 rounded-xl border transition-all flex items-center gap-4 text-left",
                selectedId === pickup._id 
                    ? "border-slate-900 shadow-sm bg-slate-50 ring-1 ring-slate-900/5" 
                    : "border-slate-100 hover:border-slate-300 shadow-sm"
            )}
          >
            <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden shrink-0 border border-emerald-100">
               {pickup.images && pickup.images[0] ? (
                  <img 
                      src={pickup.images[0]} 
                      className="w-full h-full object-cover grayscale-[0.3]"
                      alt={`${pickup.wasteType} waste`}
                      onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center"><svg class="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg></div>';
                      }}
                  />
               ) : (
                  <Recycle className="h-5 w-5 text-slate-400" />
               )}
            </div>

            <div className="flex-1 min-w-0">
               <div className="flex justify-between items-start mb-0.5">
                  <h4 className="text-[13px] font-bold text-slate-900 tracking-tight truncate capitalize">
                    {pickup.wasteType} Collection
                  </h4>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                    {new Date(pickup.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
               </div>
               <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold text-emerald-600/80 truncate flex items-center gap-1.5 min-w-0">
                     <User className="h-3 w-3 text-slate-300 shrink-0" /> <span className="truncate" title={pickup.collector?.name || 'Unknown'}>{pickup.collector?.name || 'Unknown'}</span>
                  </span>
                  <span className="w-1 h-1 bg-slate-200 rounded-full shrink-0 hidden sm:block" />
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter shrink-0">
                     ID: {pickup._id?.slice(-4) || 'N/A'}
                  </span>
               </div>
            </div>

            <div className={cn(
                "p-1.5 rounded-lg transition-all",
                selectedId === pickup._id ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-300"
            )}>
               <ChevronRight className="h-4 w-4" />
            </div>
          </button>
        ))
      )}
    </div>
  );
};

export default MessageList;
