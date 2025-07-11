import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, User, Phone, Bell, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

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

interface ChatSession {
  chatId: string;
  userName: string;
  userPhone: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

const AdminChatPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [totalUnread, setTotalUnread] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetchChatSessions();
      subscribeToNewChats();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat);
      subscribeToMessages(selectedChat);
    }
  }, [selectedChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const total = chatSessions.reduce((sum, session) => sum + session.unreadCount, 0);
    setTotalUnread(total);
  }, [chatSessions]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChatSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('sender_type', 'member')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching chat sessions:', error);
        return;
      }

      // Group messages by sender_id (chat session)
      const sessionsMap = new Map<string, ChatSession>();
      
      data?.forEach(message => {
        const chatId = message.sender_id;
        if (!sessionsMap.has(chatId)) {
          // Extract user info from first message
          const firstMessage = message.message;
          const nameMatch = firstMessage.match(/I'm ([^(]+)/);
          const phoneMatch = firstMessage.match(/\(([^)]+)\)/);
          
          sessionsMap.set(chatId, {
            chatId,
            userName: nameMatch ? nameMatch[1].trim() : 'Unknown User',
            userPhone: phoneMatch ? phoneMatch[1] : 'Unknown Phone',
            lastMessage: message.message,
            lastMessageTime: message.created_at,
            unreadCount: 1
          });
        } else {
          const session = sessionsMap.get(chatId)!;
          if (new Date(message.created_at) > new Date(session.lastMessageTime)) {
            session.lastMessage = message.message;
            session.lastMessageTime = message.created_at;
          }
          session.unreadCount++;
        }
      });

      setChatSessions(Array.from(sessionsMap.values()));
    } catch (error) {
      console.error('Error fetching chat sessions:', error);
    }
  };

  const fetchMessages = async (chatId: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .or(`sender_id.eq.${chatId},receiver_id.eq.${chatId}`)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
      } else {
        setMessages(data || []);
        
        // Mark messages as read
        setChatSessions(prev => 
          prev.map(session => 
            session.chatId === chatId 
              ? { ...session, unreadCount: 0 }
              : session
          )
        );
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const subscribeToNewChats = () => {
    const subscription = supabase
      .channel('admin_new_chats')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: 'sender_type=eq.member'
        },
        (payload) => {
          const newMessage = payload.new as ChatMessage;
          
          setChatSessions(prev => {
            const existingSession = prev.find(s => s.chatId === newMessage.sender_id);
            if (existingSession) {
              return prev.map(session =>
                session.chatId === newMessage.sender_id
                  ? {
                      ...session,
                      lastMessage: newMessage.message,
                      lastMessageTime: newMessage.created_at,
                      unreadCount: selectedChat === newMessage.sender_id ? 0 : session.unreadCount + 1
                    }
                  : session
              );
            } else {
              // New chat session
              const nameMatch = newMessage.message.match(/I'm ([^(]+)/);
              const phoneMatch = newMessage.message.match(/\(([^)]+)\)/);
              
              const newSession: ChatSession = {
                chatId: newMessage.sender_id,
                userName: nameMatch ? nameMatch[1].trim() : 'Unknown User',
                userPhone: phoneMatch ? phoneMatch[1] : 'Unknown Phone',
                lastMessage: newMessage.message,
                lastMessageTime: newMessage.created_at,
                unreadCount: 1
              };
              
              showNotification(`New chat from ${newSession.userName}`, newMessage.message);
              return [newSession, ...prev];
            }
          });
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const subscribeToMessages = (chatId: string) => {
    const subscription = supabase
      .channel(`admin_chat_${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `sender_id=eq.${chatId}`
        },
        (payload) => {
          const newMessage = payload.new as ChatMessage;
          setMessages(prev => [...prev, newMessage]);
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

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    try {
      const messageData = {
        sender_id: 'admin',
        sender_type: 'admin' as const,
        receiver_id: selectedChat,
        receiver_type: 'member' as const,
        message: newMessage,
        is_group_message: false
      };

      const { error } = await supabase
        .from('chat_messages')
        .insert(messageData);

      if (error) {
        console.error('Error sending message:', error);
        return;
      }

      // Add message to local state immediately
      const newMsg: ChatMessage = {
        id: Date.now().toString(),
        ...messageData,
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, newMsg]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const selectChat = (chatId: string) => {
    setSelectedChat(chatId);
    // Mark as read
    setChatSessions(prev =>
      prev.map(session =>
        session.chatId === chatId
          ? { ...session, unreadCount: 0 }
          : session
      )
    );
  };

  return (
    <>
      {/* Floating Admin Chat Button */}
      <div className="fixed bottom-6 left-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110"
        >
          <MessageCircle className="w-6 h-6" />
          {totalUnread > 0 && (
            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {totalUnread > 9 ? '9+' : totalUnread}
            </div>
          )}
        </button>
      </div>

      {/* Admin Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-24 left-6 w-96 h-96 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 z-50 flex">
          {/* Chat Sessions List */}
          <div className="w-1/2 border-r border-gray-200 dark:border-gray-700 flex flex-col">
            <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-purple-600 text-white rounded-tl-lg">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm">Admin Chat</span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:text-gray-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {chatSessions.length === 0 ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">No chats yet</p>
                </div>
              ) : (
                chatSessions.map((session) => (
                  <div
                    key={session.chatId}
                    onClick={() => selectChat(session.chatId)}
                    className={`p-3 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
                      selectedChat === session.chatId ? 'bg-purple-50 dark:bg-purple-900' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm text-gray-900 dark:text-white truncate">
                        {session.userName}
                      </span>
                      {session.unreadCount > 0 && (
                        <div className="bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                          {session.unreadCount}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-1">
                      <Phone className="w-3 h-3 mr-1" />
                      <span className="truncate">{session.userPhone}</span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-300 truncate">
                      {session.lastMessage}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chat Messages */}
          <div className="w-1/2 flex flex-col">
            {selectedChat ? (
              <>
                <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 rounded-tr-lg">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {chatSessions.find(s => s.chatId === selectedChat)?.userName}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {chatSessions.find(s => s.chatId === selectedChat)?.userPhone}
                  </div>
                </div>

                <div className="flex-1 p-3 overflow-y-auto space-y-2">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs px-2 py-1 rounded text-xs ${
                          message.sender_type === 'admin'
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-white'
                        }`}
                      >
                        <p>{message.message}</p>
                        <p className={`text-xs mt-1 ${
                          message.sender_type === 'admin' 
                            ? 'text-purple-100' 
                            : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {new Date(message.created_at).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                  <form onSubmit={sendMessage} className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Type message..."
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="bg-purple-600 text-white p-1 rounded hover:bg-purple-700 focus:ring-1 focus:ring-purple-500 transition-colors disabled:opacity-50"
                    >
                      <Send className="w-3 h-3" />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Select a chat to start</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default AdminChatPanel;