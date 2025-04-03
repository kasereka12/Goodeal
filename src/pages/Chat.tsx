import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, Search, Check, CheckCheck, MessageCircle, AlertCircle, Loader2 } from 'lucide-react';

const ChatList = () => {
    const [conversations, setConversations] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const { user } = useAuth();
    const isAdmin = user?.user_metadata?.role === "admin";

    useEffect(() => {
        if (user?.id) {
            fetchConversations();
        } else {
            setIsLoading(false);
        }
    }, [user]);

    const fetchConversations = async () => {
        if (!user?.id) return;

        try {
            setIsLoading(true);
            setError(null);

            const { data: conversationsData, error: convError } = await supabase
                .rpc('get_user_conversations', { user_id: user.id })
                .order('message_timestamp', { ascending: false });

            if (convError) throw convError;

            if (!conversationsData?.length) {
                setConversations([]);
                return;
            }

            const partnerIds = [...new Set(conversationsData.map(conv =>
                conv.sender_id === user.id ? conv.receiver_id : conv.sender_id
            ))];

            const { data: profilesData, error: profilesError } = await supabase
                .from('profiles')
                .select('user_id, username, avatar_url, online')
                .in('user_id', partnerIds);

            if (profilesError) throw profilesError;

            const formattedConversations = conversationsData.map(conv => {
                const otherUserId = conv.sender_id === user.id ? conv.receiver_id : conv.sender_id;
                const profile = profilesData?.find(p => p.user_id === otherUserId) || {
                    user_id: otherUserId,
                    username: `User ${otherUserId.substring(0, 6)}`,
                    avatar_url: null,
                    online: false
                };

                return {
                    user: {
                        id: profile.user_id,
                        username: profile.username,
                        avatar_url: profile.avatar_url,
                        online: profile.online
                    },
                    lastMessage: {
                        text: conv.message_text,
                        date: conv.message_timestamp,
                        isRead: conv.is_read,
                        isReceived: conv.receiver_id === user.id,
                        isSent: conv.sender_id === user.id
                    },
                    unreadCount: conv.unread_count || 0
                };
            });

            setConversations(formattedConversations);
        } catch (err) {
            console.error('Error:', err);
            setError('Failed to load conversations');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredConversations = conversations.filter(conv =>
        conv.user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();

        if (date.toDateString() === now.toDateString()) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (date.getFullYear() === now.getFullYear()) {
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }
        return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
    };

    // Helper to determine if a conversation is active/unread
    const isActiveConversation = (conversation: any) => {
        return !conversation.lastMessage.isRead || conversation.unreadCount > 0;
    };

    return (
        <div className="flex flex-col h-full bg-gradient-to-br from-white to-blue-50 rounded-lg overflow-hidden shadow-lg">
            {/* Header with search */}
            <div className="p-4 bg-white border-b border-blue-100 sticky top-0 z-10 shadow-sm">
                <h2 className="text-lg font-semibold text-blue-800 mb-3 flex items-center">
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Conversations
                </h2>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-blue-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-4 py-2.5 border border-blue-100 rounded-full bg-blue-50/50 focus:ring-blue-500 focus:border-blue-500 text-sm placeholder-blue-300 transition-all duration-200 focus:bg-white"
                        placeholder="Rechercher une conversation..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Conversations list */}
            <div className="flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-transparent">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                        <AlertCircle className="h-12 w-12 text-red-500 mb-3" />
                        <p className="text-red-600 font-medium">{error}</p>
                        <button
                            onClick={fetchConversations}
                            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-full text-sm hover:bg-blue-600 transition-colors"
                        >
                            Réessayer
                        </button>
                    </div>
                ) : filteredConversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                        <MessageCircle className="h-12 w-12 text-blue-300 mb-3" />
                        <p className="text-blue-400 font-medium">
                            {searchTerm ? 'Aucune conversation trouvée' : 'Aucune conversation'}
                        </p>
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="mt-4 px-4 py-2 bg-blue-100 text-blue-600 rounded-full text-sm hover:bg-blue-200 transition-colors"
                            >
                                Effacer la recherche
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="divide-y divide-blue-50">
                        {filteredConversations.map((conversation) => (
                            <Link
                                to={isAdmin ? `/admin/chat/${conversation.user.id}` : `/chat/${conversation.user.id}`}
                                key={conversation.user.id}
                                className={`block transition-all duration-200 ${isActiveConversation(conversation)
                                    ? 'bg-blue-50 hover:bg-blue-100'
                                    : 'hover:bg-blue-50'
                                    }`}
                            >
                                <div className="flex items-center p-4 sm:p-5">
                                    {/* Avatar with online indicator */}
                                    <div className="relative mr-3 flex-shrink-0">
                                        {conversation.user.avatar_url ? (
                                            <img
                                                src={conversation.user.avatar_url}
                                                alt={conversation.user.username}
                                                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-white shadow-sm"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center border-2 border-white shadow-sm">
                                                <User className="text-blue-500" size={24} />
                                            </div>
                                        )}
                                        {conversation.user.online && (
                                            <span className="absolute bottom-0 right-0 block h-3 w-3 sm:h-4 sm:w-4 rounded-full ring-2 ring-white bg-green-500"></span>
                                        )}
                                    </div>

                                    {/* Conversation details */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center">
                                            <h4 className={`text-sm sm:text-base font-medium ${isActiveConversation(conversation) ? 'text-blue-900' : 'text-gray-800'
                                                } truncate`}>
                                                {conversation.user.username}
                                            </h4>
                                            <span className={`text-xs ${isActiveConversation(conversation) ? 'text-blue-700' : 'text-gray-500'
                                                } whitespace-nowrap ml-2`}>
                                                {formatDate(conversation.lastMessage.date)}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between mt-1 sm:mt-2">
                                            <div className="flex items-center max-w-[80%]">
                                                {conversation.lastMessage.isSent && (
                                                    <span className="mr-1 flex-shrink-0">
                                                        {conversation.lastMessage.isRead ? (
                                                            <CheckCheck className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
                                                        ) : (
                                                            <Check className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                                                        )}
                                                    </span>
                                                )}
                                                <p className={`text-xs sm:text-sm truncate ${isActiveConversation(conversation)
                                                    ? 'font-semibold text-blue-900'
                                                    : 'text-gray-500'
                                                    }`}>
                                                    {conversation.lastMessage.text || 'Nouveau message'}
                                                </p>
                                            </div>

                                            {(conversation.unreadCount > 0) && (
                                                <span className="flex-shrink-0 bg-green-500 h-5 w-5 sm:h-6 sm:w-6 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm">
                                                    {conversation.unreadCount}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatList;