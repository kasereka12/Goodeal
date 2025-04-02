import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, Search, Check, CheckCheck } from 'lucide-react';

const ChatList = () => {
    const [conversations, setConversations] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const { user } = useAuth();

    useEffect(() => {
        if (user?.id) {
            fetchConversations();
        } else {
            setIsLoading(false);
        }
    }, [user]);
    const isAdmin = user?.user_metadata?.role === "admin";

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
                    unreadCount: conv.unread_count || 0 // Ajout du compteur de messages non lus
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

    return (
        <div className="bg-white h-full overflow-y-auto">
            {/* En-tête avec recherche */}
            <div className="p-3 bg-gray-50 sticky top-0 z-10 border-b border-gray-200">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500 text-sm"
                        placeholder="Rechercher une conversation"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Liste des conversations */}
            <div className="divide-y divide-gray-100">
                {filteredConversations.map((conversation) => (
                    <Link
                        to={isAdmin ? `/admin/chat/${conversation.user.id}` : `/chat/${conversation.user.id}`}
                        key={conversation.user.id}
                        className="block hover:bg-gray-50 transition-colors"
                    >
                        <div className="flex items-center p-3">
                            {/* Avatar avec indicateur en ligne */}
                            <div className="relative mr-3">
                                {conversation.user.avatar_url ? (
                                    <img
                                        src={conversation.user.avatar_url}
                                        alt={conversation.user.username}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                                        <User className="text-gray-500" size={20} />
                                    </div>
                                )}
                                {conversation.user.online && (
                                    <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full border-2 border-white bg-green-500"></span>
                                )}
                            </div>

                            {/* Détails de la conversation */}
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center">
                                    <h4 className="text-sm font-semibold text-gray-900 truncate">
                                        {conversation.user.username}
                                    </h4>
                                    <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                                        {formatDate(conversation.lastMessage.date)}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between mt-1">
                                    <div className="flex items-center max-w-[80%]">
                                        {conversation.lastMessage.isSent && (
                                            <span className="mr-1">
                                                {conversation.lastMessage.isRead ? (
                                                    <CheckCheck className="h-3 w-3 text-blue-500" />
                                                ) : (
                                                    <Check className="h-3 w-3 text-gray-400" />
                                                )}
                                            </span>
                                        )}
                                        <p className={`text-sm truncate ${(!conversation.lastMessage.isRead || conversation.unreadCount > 0) ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>
                                            {conversation.lastMessage.text || 'Nouveau message'}
                                        </p>
                                    </div>

                                    {(conversation.unreadCount > 0) && (
                                        <span className="flex-shrink-0 bg-green-500 h-5 w-5 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                            {conversation.unreadCount}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default ChatList;