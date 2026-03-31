// @/app/_components/ChatComponent.jsx
"use client"
import React, { useState, useEffect, useRef } from 'react';
import GlobalApi from '@/app/_services/GlobalApi';
import { Send, Loader2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import moment from 'moment';

function ChatComponent({ bookingId, currentUserEmail, recipientName }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const lastMessageRef = useRef(null);

    useEffect(() => {
        if (bookingId) {
            fetchMessages();
            const interval = setInterval(fetchMessages, 3000);
            return () => clearInterval(interval);
        }
    }, [bookingId]);

    useEffect(() => {
        lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const fetchMessages = async () => {
        try {
            const resp = await GlobalApi.getMessagesByBookingId(bookingId);
            if (resp && resp.messages) {
                setMessages(resp.messages);
            }
        } catch (error) {
            console.error("Fetch Error:", error);
        } finally {
            setFetching(false);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || loading) return;
        setLoading(true);
        try {
            await GlobalApi.createNewMessage(
                bookingId, 
                currentUserEmail, 
                newMessage, 
                currentUserEmail.split('@')[0] 
            );
            setNewMessage('');
            fetchMessages();
        } catch (e) {
            console.error("Send Error:", e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[500px] md:h-[450px] bg-white">
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between bg-slate-50">
                <div className='flex items-center gap-2'>
                    <div className='p-2 bg-blue-100 rounded-full'>
                        <User size={16} className='text-blue-600'/>
                    </div>
                    <div>
                        <h3 className="font-bold text-sm text-slate-800">{recipientName}</h3>
                        <p className='text-[10px] text-green-500 font-medium'>Live Chat</p>
                    </div>
                </div>
            </div>
            
            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
                {fetching && messages.length === 0 ? (
                    <div className='flex justify-center items-center h-full'>
                        <Loader2 className='animate-spin text-slate-300' />
                    </div>
                ) : messages.length === 0 ? (
                    <div className='text-center mt-10'>
                        <p className='text-xs text-slate-400'>No messages yet.</p>
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        /**
                         * LOGIC EXPLANATION:
                         * 1. Since this is the Provider Dashboard, 'currentUserEmail' belongs to the ARTISAN.
                         * 2. If msg.senderEmail === currentUserEmail, it's the Service Provider.
                         * 3. Otherwise, it's the Customer.
                         */
                        const isServiceProvider = msg.senderEmail === currentUserEmail;

                        return (
                            <div key={index} className={`flex ${isServiceProvider ? 'justify-start' : 'justify-end'}`}>
                                <div className={`flex flex-col ${isServiceProvider ? 'items-start' : 'items-end'} max-w-[85%]`}>
                                    <div className={`p-3 rounded-2xl text-sm shadow-md ${
                                        isServiceProvider 
                                        ? 'bg-blue-600 text-white rounded-tl-none' // Provider: BLUE on the LEFT
                                        : 'bg-emerald-500 text-white rounded-tr-none' // Customer: GREEN on the RIGHT
                                    }`}>
                                        {msg.content}
                                    </div>
                                    <span className='text-[9px] text-slate-400 mt-1 px-1'>
                                        {moment(msg.createdAt).format('LT')}
                                    </span>
                                </div>
                            </div>
                        )
                    })
                )}
                <div ref={lastMessageRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t bg-white">
                <div className="flex gap-2 items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <Input 
                        placeholder="Type your message..." 
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                        className="border-none bg-transparent focus-visible:ring-0 text-sm h-9"
                    />
                    <Button 
                        size="icon" 
                        className="rounded-lg bg-blue-600 h-9 w-9 shrink-0 hover:bg-blue-700 transition-all" 
                        onClick={sendMessage} 
                        disabled={loading || !newMessage.trim()}
                    >
                        {loading ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default ChatComponent;