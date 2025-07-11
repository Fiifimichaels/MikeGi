import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, 
  Send, 
  User, 
  Phone, 
  X, 
  Search,
  Clock,
  CheckCircle2,
  AlertCircle,
  Minimize2,
  Maximize2,
  Archive,
  Star,
  MoreVertical,
  Trash2,
  UserCheck
} from 'lucide-react';
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
  isOnline: boolean;
  priority: 'low' | 'normal' | 'high';
  status: 'active' | 'resolved' | 'archived';
  tags: string[];
}

const AdminChatPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<ChatSession[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [totalUnread, setTotalUnread] = useState(0);
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'priority'>('all');
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const quickReplies = [
    "Thank you for contacting us! How can I help you today?",
    "I'll look into this for you right away.",
    "Could you please provide more details about your request?",
    "Your order has been processed successfully.",
    "We apologize for any inconvenience. Let me resolve this for you.",
    "Is there anything else I can help you with?",
    "Thank you for your patience. Your issue has been resolved.",
    "I'll escalate this to our technical team for further assistance."
  ];

  useEffect(() => {
    if (isOpen) {
      fetchChatSessions();
      subscribeToNewChats();
      // Request notification permission
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat);
      subscribeToMessages(selectedChat);
      markAsRead(selectedChat);
    }
  }, [selectedChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const total = chatSessions.reduce((sum, session) => sum + session.unreadCount, 0);
    setTotalUnread(total);
  }, [chatSessions]);

  useEffect(() => {
    filterSessions();
  }, [chatSessions, searchQuery, activeFilter]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const filterSessions = () => {
    let filtered = chatSessions;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(session =>
        session.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.userPhone.includes(searchQuery) ||
        session.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    switch (activeFilter) {
      case 'unread':
        filtered = filtered.filter(session => session.unreadCount > 0);
        break;
      case 'priority':
        filtered = filtered.filter(session => session.priority === 'high');
        break;
    }

    // Sort by priority and last message time
    filtered.sort((a, b) => {
      const priorityOrder = { high: 3, normal: 2, low: 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime();
    });

    setFilteredSessions(filtered);
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

      const sessionsMap = new Map<string, ChatSession>();
      
      data?.forEach(message => {
        const chatId = message.sender_id;
        if (!sessionsMap.has(chatId)) {
          const firstMessage = message.message;
          const nameMatch = firstMessage.match(/I'm ([^(]+)/);
          const phoneMatch = firstMessage.match(/\(([^)]+)\)/);
          
          sessionsMap.set(chatId, {
            chatId,
            userName: nameMatch ? nameMatch[1].trim() : 'Unknown User',
            userPhone: phoneMatch ? phoneMatch[1] : 'Unknown Phone',
            lastMessage: message.message,
            lastMessageTime: message.created_at,
            unreadCount: 1,
            isOnline: Math.random() > 0.5, // Simulate online status
            priority: Math.random() > 0.8 ? 'high' : 'normal',
            status: 'active',
            tags: []
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
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const markAsRead = (chatId: string) => {
    setChatSessions(prev => 
      prev.map(session => 
        session.chatId === chatId 
          ? { ...session, unreadCount: 0 }
          : session
      )
    );
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
              const nameMatch = newMessage.message.match(/I'm ([^(]+)/);
              const phoneMatch = newMessage.message.match(/\(([^)]+)\)/);
              
              const newSession: ChatSession = {
                chatId: newMessage.sender_id,
                userName: nameMatch ? nameMatch[1].trim() : 'Unknown User',
                userPhone: phoneMatch ? phoneMatch[1] : 'Unknown Phone',
                lastMessage: newMessage.message,
                lastMessageTime: newMessage.created_at,
                unreadCount: 1,
                isOnline: true,
                priority: 'normal',
                status: 'active',
                tags: []
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
          
          // Show typing indicator briefly
          setIsTyping(true);
          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
          }
          typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
          }, 1000);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const showNotification = (title: string, body: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(title, { 
        body, 
        icon: '/vite.svg',
        badge: '/vite.svg'
      });
      
      notification.onclick = () => {
        window.focus();
        setIsOpen(true);
        notification.close();
      };
    }
  };

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || !selectedChat) return;

    try {
      const messageData = {
        sender_id: 'admin',
        sender_type: 'admin' as const,
        receiver_id: selectedChat,
        receiver_type: 'member' as const,
        message: messageText,
        is_group_message: false
      };

      const { error } = await supabase
        .from('chat_messages')
        .insert(messageData);

      if (error) {
        console.error('Error sending message:', error);
        return;
      }

      const newMsg: ChatMessage = {
        id: Date.now().toString(),
        ...messageData,
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, newMsg]);
      setNewMessage('');
      setShowQuickReplies(false);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(newMessage);
  };

  const handleQuickReply = (reply: string) => {
    sendMessage(reply);
  };

  const selectChat = (chatId: string) => {
    setSelectedChat(chatId);
    markAsRead(chatId);
  };

  const updateChatPriority = (chatId: string, priority: 'low' | 'normal' | 'high') => {
    setChatSessions(prev =>
      prev.map(session =>
        session.chatId === chatId
          ? { ...session, priority }
          : session
      )
    );
  };

  const updateChatStatus = (chatId: string, status: 'active' | 'resolved' | 'archived') => {
    setChatSessions(prev =>
      prev.map(session =>
        session.chatId === chatId
          ? { ...session, status }
          : session
      )
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'normal': return 'text-blue-600 bg-blue-100';
      case 'low': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'resolved': return 'text-blue-600 bg-blue-100';
      case 'archived': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <>
      {/* Floating Admin Chat Button */}
      <div className="fixed bottom-6 left-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110"
        >
          <MessageCircle className="w-6 h-6" />
          {totalUnread > 0 && (
            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold animate-pulse">
              {totalUnread > 99 ? '99+' : totalUnread}
            </div>
          )}
        </button>
      </div>

      {/* Enhanced Admin Chat Panel */}
      {isOpen && (
        <div className={`fixed bottom-24 left-2 sm:left-6 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 z-50 transition-all duration-300 ${
          isMinimized 
            ? 'w-72 sm:w-80 h-16' 
            : 'w-[calc(100vw-16px)] sm:w-[600px] lg:w-[800px] h-[calc(100vh-120px)] sm:h-[500px] lg:h-[600px]'
        }`}>
          {/* Enhanced Header */}
          <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg flex-shrink-0">
            <div className="flex items-center space-x-3">
              <MessageCircle className="w-5 h-5" />
              <div>
                <span className="font-semibold text-sm sm:text-base">Admin Chat Center</span>
                <div className="text-xs text-purple-100 hidden sm:block">
                  {filteredSessions.length} conversations • {totalUnread} unread
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-white hover:text-gray-200 transition-colors"
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <div className="flex flex-col sm:flex-row h-[calc(100%-56px)] sm:h-[calc(100%-64px)]">
              {/* Enhanced Chat Sessions List */}
              <div className="w-full sm:w-72 lg:w-80 border-b sm:border-b-0 sm:border-r border-gray-200 dark:border-gray-700 flex flex-col max-h-48 sm:max-h-none">
                {/* Search and Filters */}
                <div className="p-3 border-b border-gray-200 dark:border-gray-700 space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Search conversations..."
                    />
                  </div>
                  
                  <div className="flex space-x-1">
                    {[
                      { key: 'all', label: 'All', count: chatSessions.length },
                      { key: 'unread', label: 'Unread', count: totalUnread },
                      { key: 'priority', label: 'Priority', count: chatSessions.filter(s => s.priority === 'high').length }
                    ].map(filter => (
                      <button
                        key={filter.key}
                        onClick={() => setActiveFilter(filter.key as any)}
                        className={`flex-1 px-1 sm:px-2 py-1 text-xs rounded-md transition-colors ${
                          activeFilter === filter.key
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                            : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                        }`}
                      >
                        <span className="hidden sm:inline">{filter.label} ({filter.count})</span>
                        <span className="sm:hidden">{filter.label.charAt(0)} {filter.count}</span>
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Chat Sessions */}
                <div className="flex-1 overflow-y-auto">
                  {filteredSessions.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                      <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-xs sm:text-sm">
                        {searchQuery ? 'No conversations found' : 'No chats yet'}
                      </p>
                    </div>
                  ) : (
                    filteredSessions.map((session) => (
                      <div
                        key={session.chatId}
                        onClick={() => selectChat(session.chatId)}
                        className={`p-3 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                          selectedChat === session.chatId ? 'bg-purple-50 dark:bg-purple-900 border-l-4 border-l-purple-500' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between mb-1 sm:mb-2">
                          <div className="flex items-center space-x-2">
                            <div className="relative">
                              <div className="w-6 sm:w-8 h-6 sm:h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                                <User className="w-3 sm:w-4 h-3 sm:h-4 text-white" />
                              </div>
                              {session.isOnline && (
                                <div className="absolute -bottom-1 -right-1 w-2 sm:w-3 h-2 sm:h-3 bg-green-500 rounded-full border-2 border-white"></div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-xs sm:text-sm text-gray-900 dark:text-white truncate">
                                  {session.userName}
                                </span>
                                <span className={`px-1 sm:px-1.5 py-0.5 text-xs rounded-full hidden sm:inline ${getPriorityColor(session.priority)}`}>
                                  {session.priority}
                                </span>
                              </div>
                              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 hidden sm:flex">
                                <Phone className="w-2 sm:w-3 h-2 sm:h-3 mr-1" />
                                <span className="truncate">{session.userPhone}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end space-y-1">
                            {session.unreadCount > 0 && (
                              <div className="bg-red-500 text-white text-xs rounded-full w-4 sm:w-5 h-4 sm:h-5 flex items-center justify-center">
                                {session.unreadCount > 9 ? '9+' : session.unreadCount}
                              </div>
                            )}
                            <span className="text-xs text-gray-400 hidden sm:inline">
                              {formatTime(session.lastMessageTime)}
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-xs text-gray-600 dark:text-gray-300 truncate mb-1 sm:mb-2 hidden sm:block">
                          {session.lastMessage}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <span className={`px-1 sm:px-2 py-1 text-xs rounded-full ${getStatusColor(session.status)}`}>
                            {session.status}
                          </span>
                          <div className="flex items-center space-x-1 hidden sm:flex">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateChatPriority(session.chatId, session.priority === 'high' ? 'normal' : 'high');
                              }}
                              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                            >
                              <Star className={`w-3 h-3 ${session.priority === 'high' ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateChatStatus(session.chatId, session.status === 'resolved' ? 'active' : 'resolved');
                              }}
                              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                            >
                              <CheckCircle2 className={`w-3 h-3 ${session.status === 'resolved' ? 'text-green-500' : 'text-gray-400'}`} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Enhanced Chat Messages */}
              <div className="flex-1 flex flex-col">
                {selectedChat ? (
                  <>
                    {/* Chat Header */}
                    <div className="p-2 sm:p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 flex-shrink-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <div className="w-8 sm:w-10 h-8 sm:h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                              <User className="w-4 sm:w-5 h-4 sm:h-5 text-white" />
                            </div>
                            {chatSessions.find(s => s.chatId === selectedChat)?.isOnline && (
                              <div className="absolute -bottom-1 -right-1 w-2 sm:w-3 h-2 sm:h-3 bg-green-500 rounded-full border-2 border-white"></div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-sm sm:text-base text-gray-900 dark:text-white">
                              {chatSessions.find(s => s.chatId === selectedChat)?.userName}
                            </div>
                            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex items-center space-x-2">
                              <Phone className="w-2 sm:w-3 h-2 sm:h-3" />
                              <span>{chatSessions.find(s => s.chatId === selectedChat)?.userPhone}</span>
                              {chatSessions.find(s => s.chatId === selectedChat)?.isOnline && (
                                <span className="text-green-500 hidden sm:inline">• Online</span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-1 sm:space-x-2">
                          <button
                            onClick={() => updateChatStatus(selectedChat, 'resolved')}
                            className="p-1 sm:p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900 rounded-lg transition-colors"
                            title="Mark as resolved"
                          >
                            <CheckCircle2 className="w-3 sm:w-4 h-3 sm:h-4" />
                          </button>
                          <button
                            onClick={() => updateChatStatus(selectedChat, 'archived')}
                            className="p-1 sm:p-2 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            title="Archive chat"
                          >
                            <Archive className="w-3 sm:w-4 h-3 sm:h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 p-2 sm:p-4 overflow-y-auto space-y-2 sm:space-y-3 bg-gray-50 dark:bg-gray-900">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[80%] sm:max-w-xs lg:max-w-md px-3 sm:px-4 py-2 rounded-2xl shadow-sm ${
                            message.sender_type === 'admin'
                              ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                              : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600'
                          }`}>
                            <p className="text-xs sm:text-sm">{message.message}</p>
                            <div className="flex items-center justify-between mt-1">
                              <p className={`text-xs ${
                                message.sender_type === 'admin' 
                                  ? 'text-purple-100' 
                                  : 'text-gray-500 dark:text-gray-400'
                              }`}>
                                {new Date(message.created_at).toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </p>
                              {message.sender_type === 'admin' && (
                                <CheckCircle2 className="w-2 sm:w-3 h-2 sm:h-3 text-purple-200" />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {isTyping && (
                        <div className="flex justify-start">
                          <div className="bg-white dark:bg-gray-700 px-3 sm:px-4 py-2 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-600">
                            <div className="flex space-x-1">
                              <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-gray-400 rounded-full animate-bounce"></div>
                              <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Replies */}
                    {showQuickReplies && (
                      <div className="p-2 sm:p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex-shrink-0">
                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">Quick Replies:</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                          {quickReplies.map((reply, index) => (
                            <button
                              key={index}
                              onClick={() => handleQuickReply(reply)}
                              className="text-left p-1.5 sm:p-2 text-xs bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900 transition-colors"
                            >
                              {reply}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Enhanced Message Input */}
                    <div className="p-2 sm:p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0">
                      <form onSubmit={handleSendMessage} className="space-y-3">
                        <div className="flex space-x-2">
                          <div className="flex-1 relative">
                            <input
                              type="text"
                              value={newMessage}
                              onChange={(e) => setNewMessage(e.target.value)}
                              className="w-full px-3 sm:px-4 py-2 pr-10 sm:pr-12 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                              placeholder="Type your message..."
                            />
                            <button
                              type="button"
                              onClick={() => setShowQuickReplies(!showQuickReplies)}
                              className="absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                              title="Quick replies"
                            >
                              <MoreVertical className="w-3 sm:w-4 h-3 sm:h-4" />
                            </button>
                          </div>
                          <button
                            type="submit"
                            disabled={!newMessage.trim()}
                            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-2 rounded-lg hover:from-purple-700 hover:to-blue-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                          >
                            <Send className="w-3 sm:w-4 h-3 sm:h-4" />
                          </button>
                        </div>
                      </form>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900">
                    <div className="text-center">
                      <MessageCircle className="w-8 sm:w-12 h-8 sm:h-12 mx-auto mb-4 opacity-50" />
                      <h3 className="text-base sm:text-lg font-medium mb-2">Admin Chat Center</h3>
                      <p className="text-xs sm:text-sm px-4">Select a conversation to start chatting with customers</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default AdminChatPanel;