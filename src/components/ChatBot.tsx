import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, User, Phone, Bell } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface ChatMessage {
  id: string;
  sender_id: string;
  sender_type: 'admin' | 'member';
  receiver_id?: string;
  receiver_type?: 'admin' | 'member';
  message: string;
  is_group_message: boolean;
  created_at: string;
}

interface UserInfo {
  name: string;
  phone: string;
}

const ChatBot: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [userInfo, setUserInfo] = useState<UserInfo>({ name: '', phone: '' });
  const [isInfoProvided, setIsInfoProvided] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatId = useRef<string>('');

  useEffect(() => {
    if (isOpen && isInfoProvided) {
      fetchMessages();
      subscribeToMessages();
    }
  }, [isOpen, isInfoProvided]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const generateChatId = (userInfo: UserInfo) => {
    return `chat_${userInfo.phone.replace(/\D/g, '')}_${Date.now()}`;
  };

  const fetchMessages = async () => {
    if (!chatId.current) return;

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .or(`sender_id.eq.${chatId.current},receiver_id.eq.${chatId.current}`)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
      } else {
        setMessages(data || []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const subscribeToMessages = () => {
    if (!chatId.current) return;

    const subscription = supabase
      .channel('chat_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `receiver_id=eq.${chatId.current}`
        },
        (payload) => {
          const newMessage = payload.new as ChatMessage;
          setMessages(prev => [...prev, newMessage]);
          
          // Show notification if chat is closed
          if (!isOpen) {
            setHasNewMessages(true);
            showNotification('New message from admin', newMessage.message);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const showNotification = (title: string, body: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/vite.svg' });
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  const handleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInfo.name.trim() || !userInfo.phone.trim()) return;

    setLoading(true);
    chatId.current = generateChatId(userInfo);
    setIsInfoProvided(true);
    await requestNotificationPermission();
    
    // Send initial message to admin
    await sendMessage(`Hello! I'm ${userInfo.name} (${userInfo.phone}). I'd like to chat with an admin.`, true);
    setLoading(false);
  };

  const sendMessage = async (messageText: string, isInitial = false) => {
    if (!messageText.trim() || !chatId.current) return;

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          sender_id: chatId.current,
          sender_type: 'member',
          receiver_type: 'admin',
          message: messageText,
          is_group_message: false
        });

      if (error) {
        console.error('Error sending message:', error);
      } else {
        if (!isInitial) {
          setNewMessage('');
        }
        
        // Send notification to admin
        await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/notify-admin`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userName: userInfo.name,
            userPhone: userInfo.phone,
            message: messageText,
            chatId: chatId.current
          })
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(newMessage);
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setHasNewMessages(false);
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={toggleChat}
          className="relative bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110"
        >
          <MessageCircle className="w-6 h-6" />
          {hasNewMessages && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          )}
        </button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 h-96 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 z-50 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-blue-600 text-white rounded-t-lg">
            <div className="flex items-center space-x-2">
              <MessageCircle className="w-5 h-5" />
              <span className="font-semibold">Chat with Admin</span>
            </div>
            <button
              onClick={toggleChat}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col">
            {!isInfoProvided ? (
              /* User Info Form */
              <div className="p-4 flex-1 flex flex-col justify-center">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Let's get started!
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Please provide your details to chat with our admin
                  </p>
                </div>

                <form onSubmit={handleInfoSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Your Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        value={userInfo.name}
                        onChange={(e) => setUserInfo(prev => ({ ...prev, name: e.target.value }))}
                        className="pl-10 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="Enter your name"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="tel"
                        value={userInfo.phone}
                        onChange={(e) => setUserInfo(prev => ({ ...prev, phone: e.target.value }))}
                        className="pl-10 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="Enter your phone number"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Starting Chat...' : 'Start Chat'}
                  </button>
                </form>
              </div>
            ) : (
              /* Chat Messages */
              <>
                <div className="flex-1 p-4 overflow-y-auto space-y-3">
                  {messages.length === 0 ? (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                      <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender_type === 'member' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                            message.sender_type === 'member'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                          }`}
                        >
                          <p>{message.message}</p>
                          <p className={`text-xs mt-1 ${
                            message.sender_type === 'member' 
                              ? 'text-blue-100' 
                              : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            {new Date(message.created_at).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  <form onSubmit={handleSendMessage} className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Type your message..."
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;