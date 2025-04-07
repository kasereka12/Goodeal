import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';
import {
  MessageSquare,
  Send,
  Search,
  User,
  Star,
  Clock,
  Archive,
  Trash2,
  ChevronDown,
  AlertCircle,
  Home
} from 'lucide-react';

export default function SellerMessages() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [conversations, setConversations] = useState([]);
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);

  useEffect(() => {
    const fetchConversations = async () => {
      if (!user) return;

      setIsLoading(true);
      try {
        // In a real app, you would fetch conversations from your database
        // For this example, we'll create mock data
        const mockConversations = [
          {
            id: 1,
            listing_id: 101,
            listing_title: 'Appartement T3 Centre Ville',
            other_user_id: 'user1',
            other_user_name: 'Jean Dupont',
            last_message: 'Bonjour, est-ce que l\'appartement est toujours disponible ?',
            last_message_date: '2025-04-01T14:30:00Z',
            unread_count: 2,
            is_favorite: false,
            is_archived: false
          },
          {
            id: 2,
            listing_id: 102,
            listing_title: 'Voiture Peugeot 208',
            other_user_id: 'user2',
            other_user_name: 'Marie Martin',
            last_message: 'Quel est le kilométrage exact de la voiture ?',
            last_message_date: '2025-04-01T10:15:00Z',
            unread_count: 0,
            is_favorite: true,
            is_archived: false
          },
          {
            id: 3,
            listing_id: 103,
            listing_title: 'MacBook Pro 2021',
            other_user_id: 'user3',
            other_user_name: 'Pierre Durand',
            last_message: 'Je suis intéressé. Pouvons-nous convenir d\'un rendez-vous pour le voir ?',
            last_message_date: '2025-03-31T18:45:00Z',
            unread_count: 1,
            is_favorite: false,
            is_archived: false
          },
          {
            id: 4,
            listing_id: 104,
            listing_title: 'Table en bois massif',
            other_user_id: 'user4',
            other_user_name: 'Sophie Leroy',
            last_message: 'Merci pour les informations. Je vais y réfléchir.',
            last_message_date: '2025-03-30T09:20:00Z',
            unread_count: 0,
            is_favorite: false,
            is_archived: true
          }
        ];

        setConversations(mockConversations);
        setFilteredConversations(mockConversations);
      } catch (error) {
        console.error('Error fetching conversations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversations();

    // Set up real-time listener for new messages
    if (user) {
      const channel = supabase
        .channel('messages-changes')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
          if (payload.new.receiver_id === user.id) {
            // Update conversations with new message
            setConversations(prevConversations => {
              const updatedConversations = [...prevConversations];
              const conversationIndex = updatedConversations.findIndex(
                conv => conv.other_user_id === payload.new.sender_id
              );

              if (conversationIndex !== -1) {
                updatedConversations[conversationIndex] = {
                  ...updatedConversations[conversationIndex],
                  last_message: payload.new.content,
                  last_message_date: payload.new.created_at,
                  unread_count: updatedConversations[conversationIndex].unread_count + 1
                };
              }

              return updatedConversations;
            });

            // If the active conversation is with this sender, add the message to the messages list
            if (activeConversation?.other_user_id === payload.new.sender_id) {
              setMessages(prevMessages => [...prevMessages, payload.new]);
            }
          }
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  // Apply search and filters to conversations
  useEffect(() => {
    let filtered = [...conversations];

    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        conv =>
          conv.other_user_name.toLowerCase().includes(term) ||
          conv.listing_title.toLowerCase().includes(term) ||
          conv.last_message.toLowerCase().includes(term)
      );
    }

    // Apply filter
    switch (filter) {
      case 'unread':
        filtered = filtered.filter(conv => conv.unread_count > 0);
        break;
      case 'favorites':
        filtered = filtered.filter(conv => conv.is_favorite);
        break;
      case 'archived':
        filtered = filtered.filter(conv => conv.is_archived);
        break;
      case 'all':
      default:
        filtered = filtered.filter(conv => !conv.is_archived);
        break;
    }

    // Sort by date (most recent first)
    filtered.sort((a, b) => new Date(b.last_message_date) - new Date(a.last_message_date));

    setFilteredConversations(filtered);
  }, [conversations, searchTerm, filter]);

  // Fetch messages when active conversation changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!activeConversation) return;

      try {
        // In a real app, you would fetch messages from your database
        // For this example, we'll create mock data
        const mockMessages = [
          {
            id: 1,
            conversation_id: activeConversation.id,
            sender_id: activeConversation.other_user_id,
            receiver_id: user.id,
            content: 'Bonjour, je suis intéressé par votre annonce.',
            created_at: new Date(new Date().getTime() - 3600000 * 24).toISOString(),
            read: true
          },
          {
            id: 2,
            conversation_id: activeConversation.id,
            sender_id: user.id,
            receiver_id: activeConversation.other_user_id,
            content: 'Bonjour, merci pour votre intérêt. Avez-vous des questions spécifiques ?',
            created_at: new Date(new Date().getTime() - 3600000 * 23).toISOString(),
            read: true
          },
          {
            id: 3,
            conversation_id: activeConversation.id,
            sender_id: activeConversation.other_user_id,
            receiver_id: user.id,
            content: 'Oui, est-ce que l\'article est toujours disponible ? Et quel est son état exact ?',
            created_at: new Date(new Date().getTime() - 3600000 * 22).toISOString(),
            read: true
          },
          {
            id: 4,
            conversation_id: activeConversation.id,
            sender_id: user.id,
            receiver_id: activeConversation.other_user_id,
            content: 'Oui, il est toujours disponible. Il est en très bon état, pratiquement neuf.',
            created_at: new Date(new Date().getTime() - 3600000 * 20).toISOString(),
            read: true
          },
          {
            id: 5,
            conversation_id: activeConversation.id,
            sender_id: activeConversation.other_user_id,
            receiver_id: user.id,
            content: activeConversation.last_message,
            created_at: activeConversation.last_message_date,
            read: activeConversation.unread_count === 0
          }
        ];

        setMessages(mockMessages);

        // Mark messages as read
        if (activeConversation.unread_count > 0) {
          // In a real app, you would update the database
          setConversations(prevConversations => {
            return prevConversations.map(conv =>
              conv.id === activeConversation.id ? { ...conv, unread_count: 0 } : conv
            );
          });
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
  }, [activeConversation, user?.id]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation) return;

    try {
      // In a real app, you would save the message to your database
      const newMsg = {
        id: Date.now(),
        conversation_id: activeConversation.id,
        sender_id: user.id,
        receiver_id: activeConversation.other_user_id,
        content: newMessage,
        created_at: new Date().toISOString(),
        read: false
      };

      // Add message to the messages list
      setMessages(prevMessages => [...prevMessages, newMsg]);

      // Update conversation with new message
      setConversations(prevConversations => {
        return prevConversations.map(conv =>
          conv.id === activeConversation.id
            ? {
                ...conv,
                last_message: newMessage,
                last_message_date: new Date().toISOString()
              }
            : conv
        );
      });

      // Clear input
      setNewMessage('');
      
      // Focus on input field again
      messageInputRef.current?.focus();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleToggleFavorite = (conversationId) => {
    setConversations(prevConversations => {
      return prevConversations.map(conv =>
        conv.id === conversationId ? { ...conv, is_favorite: !conv.is_favorite } : conv
      );
    });
  };

  const handleToggleArchive = (conversationId) => {
    setConversations(prevConversations => {
      return prevConversations.map(conv =>
        conv.id === conversationId ? { ...conv, is_archived: !conv.is_archived } : conv
      );
    });

    // If the active conversation is being archived, clear it
    if (activeConversation?.id === conversationId) {
      setActiveConversation(null);
    }
  };

  const formatMessageDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      // Today: show time
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      // Yesterday
      return 'Hier';
    } else if (diffDays < 7) {
      // This week: show day name
      return date.toLocaleDateString('fr-FR', { weekday: 'long' });
    } else {
      // Older: show date
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-12rem)]">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {t('sellerDashboard.messages') || 'Messages'}
        </h1>
        <Link
          to="/"
          className="flex items-center text-sm font-medium text-primary hover:text-primary-dark"
        >
          <Home className="h-4 w-4 mr-1" />
          {t('common.backToHome') || 'Retour à l\'accueil'}
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden h-full">
        <div className="flex h-full">
          {/* Conversations list */}
          <div className="w-full md:w-1/3 border-r border-gray-200 flex flex-col h-full">
            {/* Search and filter */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  placeholder={t('common.searchMessages') || 'Rechercher...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="mt-2 flex">
                <button
                  className={`px-3 py-1 text-sm rounded-md mr-2 ${
                    filter === 'all'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setFilter('all')}
                >
                  {t('common.all') || 'Tous'}
                </button>
                <button
                  className={`px-3 py-1 text-sm rounded-md mr-2 ${
                    filter === 'unread'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setFilter('unread')}
                >
                  {t('common.unread') || 'Non lus'}
                </button>
                <button
                  className={`px-3 py-1 text-sm rounded-md mr-2 ${
                    filter === 'favorites'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setFilter('favorites')}
                >
                  {t('common.favorites') || 'Favoris'}
                </button>
                <button
                  className={`px-3 py-1 text-sm rounded-md ${
                    filter === 'archived'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setFilter('archived')}
                >
                  {t('common.archived') || 'Archivés'}
                </button>
              </div>
            </div>

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length > 0 ? (
                filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`border-b border-gray-200 cursor-pointer ${
                      activeConversation?.id === conversation.id ? 'bg-gray-50' : ''
                    }`}
                  >
                    <div
                      className="p-4 hover:bg-gray-50"
                      onClick={() => setActiveConversation(conversation)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate flex items-center">
                            {conversation.other_user_name}
                            {conversation.unread_count > 0 && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary text-white">
                                {conversation.unread_count}
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {conversation.listing_title}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500 whitespace-nowrap">
                          {formatMessageDate(conversation.last_message_date)}
                        </p>
                      </div>
                      <p className="mt-1 text-sm text-gray-600 truncate">
                        {conversation.last_message}
                      </p>
                      <div className="mt-2 flex justify-end space-x-2">
                        <button
                          className={`p-1 rounded-full ${
                            conversation.is_favorite ? 'text-amber-500' : 'text-gray-400 hover:text-gray-500'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleFavorite(conversation.id);
                          }}
                          title={conversation.is_favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                        >
                          <Star className="h-4 w-4" />
                        </button>
                        <button
                          className="p-1 rounded-full text-gray-400 hover:text-gray-500"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleArchive(conversation.id);
                          }}
                          title={conversation.is_archived ? 'Désarchiver' : 'Archiver'}
                        >
                          {conversation.is_archived ? (
                            <Archive className="h-4 w-4" />
                          ) : (
                            <Archive className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                  <MessageSquare className="h-12 w-12 text-gray-300 mb-2" />
                  <p className="text-gray-500">
                    {searchTerm || filter !== 'all'
                      ? t('sellerDashboard.noMessagesFound') || 'Aucun message trouvé'
                      : t('sellerDashboard.noMessages') || 'Vous n\'avez pas encore de messages'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Conversation detail */}
          <div className="hidden md:flex md:w-2/3 flex-col h-full">
            {activeConversation ? (
              <>
                {/* Conversation header */}
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                      <User className="h-6 w-6 text-gray-400" />
                    </div>
                    <div>
                      <h2 className="text-lg font-medium text-gray-900">
                        {activeConversation.other_user_name}
                      </h2>
                      <p className="text-sm text-gray-500">
                        {activeConversation.listing_title}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      className={`p-2 rounded-full ${
                        activeConversation.is_favorite ? 'text-amber-500' : 'text-gray-400 hover:text-gray-500'
                      }`}
                      onClick={() => handleToggleFavorite(activeConversation.id)}
                      title={activeConversation.is_favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                    >
                      <Star className="h-5 w-5" />
                    </button>
                    <button
                      className="p-2 rounded-full text-gray-400 hover:text-gray-500"
                      onClick={() => handleToggleArchive(activeConversation.id)}
                      title={activeConversation.is_archived ? 'Désarchiver' : 'Archiver'}
                    >
                      <Archive className="h-5 w-5" />
                    </button>
                    <div className="relative">
                      <button
                        className="p-2 rounded-full text-gray-400 hover:text-gray-500"
                        title="Plus d'options"
                      >
                        <ChevronDown className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender_id === user.id ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-xs md:max-w-md lg:max-w-lg rounded-lg px-4 py-2 ${
                          message.sender_id === user.id
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p
                          className={`text-xs mt-1 ${
                            message.sender_id === user.id ? 'text-primary-100' : 'text-gray-500'
                          }`}
                        >
                          {formatMessageDate(message.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message input */}
                <div className="p-4 border-t border-gray-200">
                  <form onSubmit={handleSendMessage} className="flex items-center">
                    <input
                      type="text"
                      className="flex-1 border border-gray-300 rounded-l-md py-2 px-4 focus:outline-none focus:ring-primary focus:border-primary"
                      placeholder={t('common.typeMessage') || 'Tapez votre message...'}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      ref={messageInputRef}
                    />
                    <button
                      type="submit"
                      className="bg-primary text-white rounded-r-md px-4 py-2 hover:bg-primary/90"
                      disabled={!newMessage.trim()}
                    >
                      <Send className="h-5 w-5" />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                <MessageSquare className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  {t('sellerDashboard.selectConversation') || 'Sélectionnez une conversation'}
                </h3>
                <p className="text-gray-500 max-w-md">
                  {t('sellerDashboard.selectConversationHint') || 'Choisissez une conversation dans la liste pour afficher les messages'}
                </p>
              </div>
            )}
          </div>

          {/* Mobile view: Show only active conversation if selected */}
          {activeConversation && (
            <div className="fixed inset-0 z-50 md:hidden bg-white">
              <div className="flex flex-col h-full">
                {/* Header with back button */}
                <div className="p-4 border-b border-gray-200 flex items-center">
                  <button
                    className="mr-3 text-gray-500"
                    onClick={() => setActiveConversation(null)}
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <div className="flex items-center flex-1">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                      <User className="h-6 w-6 text-gray-400" />
                    </div>
                    <div>
                      <h2 className="text-lg font-medium text-gray-900">
                        {activeConversation.other_user_name}
                      </h2>
                      <p className="text-sm text-gray-500">
                        {activeConversation.listing_title}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <button
                      className={`p-2 rounded-full ${
                        activeConversation.is_favorite ? 'text-amber-500' : 'text-gray-400'
                      }`}
                      onClick={() => handleToggleFavorite(activeConversation.id)}
                    >
                      <Star className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender_id === user.id ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-xs rounded-lg px-4 py-2 ${
                          message.sender_id === user.id
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p
                          className={`text-xs mt-1 ${
                            message.sender_id === user.id ? 'text-primary-100' : 'text-gray-500'
                          }`}
                        >
                          {formatMessageDate(message.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message input */}
                <div className="p-4 border-t border-gray-200">
                  <form onSubmit={handleSendMessage} className="flex items-center">
                    <input
                      type="text"
                      className="flex-1 border border-gray-300 rounded-l-md py-2 px-4 focus:outline-none focus:ring-primary focus:border-primary"
                      placeholder={t('common.typeMessage') || 'Tapez votre message...'}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <button
                      type="submit"
                      className="bg-primary text-white rounded-r-md px-4 py-2 hover:bg-primary/90"
                      disabled={!newMessage.trim()}
                    >
                      <Send className="h-5 w-5" />
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
