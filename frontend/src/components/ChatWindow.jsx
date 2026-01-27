import React, { useState, useEffect, useRef } from 'react';
import { Send, X, MessageSquare, User, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';

const ChatWindow = ({ pickupId, onClose }) => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef();

  useEffect(() => {
    fetchHistory();
    if (!socket) return;

    socket.emit('join_pickup', pickupId);

    socket.on('receive_message', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.off('receive_message');
    };
  }, [pickupId, socket]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/chat/${pickupId}`);
      if (data.success) {
        setMessages(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch chat history', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket) return;

    const payload = {
      pickupId,
      senderId: user._id,
      content: newMessage,
    };

    socket.emit('send_message', payload);
    setNewMessage('');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      className="fixed bottom-6 right-6 w-[400px] h-[600px] bg-white rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-200 flex flex-col z-[60] overflow-hidden"
    >
      {/* Professional Header */}
      <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
           <div className="bg-white/10 p-2 rounded-lg">
              <MessageSquare className="h-4 w-4" />
           </div>
           <div>
              <h4 className="text-[11px] font-bold uppercase tracking-[1.5px] leading-tight">Secure Channel</h4>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Active Connection</p>
           </div>
        </div>
        <button 
           onClick={onClose}
           className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
        >
           <X className="h-4 w-4" />
        </button>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
        {loading ? (
             <div className="h-full flex items-center justify-center">
                <Loader2 className="h-5 w-5 text-slate-400 animate-spin" />
             </div>
        ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-slate-400" />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Log established. Begin communication.</p>
            </div>
        ) : (
            messages.map((msg, i) => {
                const isMe = msg.sender._id === user._id || msg.sender === user._id;
                return (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={i} 
                        className={cn("flex flex-col", isMe ? "items-end" : "items-start")}
                    >
                        <div className={cn(
                            "max-w-[85%] px-4 py-3 rounded-lg text-xs leading-relaxed font-medium shadow-sm",
                            isMe 
                                ? "bg-slate-900 text-white rounded-tr-none" 
                                : "bg-white text-slate-700 border border-slate-200 rounded-tl-none"
                        )}>
                            {msg.content}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1.5 px-0.5">
                            {!isMe && <span className="text-[9px] font-bold text-slate-900 uppercase">{msg.sender.name.split(' ')[0]}</span>}
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </motion.div>
                );
            })
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-100 flex gap-3 items-center">
        <input 
          type="text" 
          placeholder="Type a message..." 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 bg-slate-50 border border-slate-200 focus:border-slate-900 rounded-lg px-4 py-3 text-xs font-medium outline-none transition-all placeholder:text-slate-400"
        />
        <button 
          type="submit"
          disabled={!newMessage.trim()}
          className="bg-slate-900 text-white p-3 rounded-lg shadow-md hover:bg-slate-800 transition-all disabled:opacity-30 disabled:hover:bg-slate-900"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </motion.div>
  );
};

export default ChatWindow;
