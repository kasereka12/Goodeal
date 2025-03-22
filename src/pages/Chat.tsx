import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MessageSquare, User, Search } from 'lucide-react';

const ChatList = () => {
    const [userIds, setUserIds] = useState<any[]>([]); // Liste des IDs d'utilisateurs avec qui on a échangé
    const [userProfiles, setUserProfiles] = useState<any[]>([]); // Profils des utilisateurs
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const user = useAuth(); // Récupère l'utilisateur connecté

    useEffect(() => {
        if (user.user?.id) {
            fetchUserIdsWithMessages();
        } else {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (userIds.length > 0) {
            fetchUserProfiles();
        }
    }, [userIds]);

    const fetchUserIdsWithMessages = async () => {
        if (!user.user?.id) return;

        try {
            setError(null);
            setIsLoading(true);

            const { data: messagesData, error: messagesError } = await supabase
                .from('messages')
                .select('sender_id, receiver_id, created_at, text')
                .or(`sender_id.eq.${user.user.id},receiver_id.eq.${user.user.id}`)
                .order('created_at', { ascending: false });

            if (messagesError) {
                setError('Error fetching messages');
                console.error('Error fetching messages:', messagesError);
                throw messagesError;
            }

            // Extraire les IDs des utilisateurs avec qui l'utilisateur connecté a interagi
            const userIds = messagesData
                ?.map((message: any) =>
                    message.sender_id === user.user.id ? message.receiver_id : message.sender_id
                )
                .filter((id) => id !== user.user.id) || []; // Exclure l'utilisateur connecté

            // Supprimer les doublons
            const uniqueUserIds = [...new Set(userIds)];

            setUserIds(uniqueUserIds);
        } catch (err: any) {
            setError('Error fetching users');
            console.error('Error fetching users:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchUserProfiles = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, full_name, avatar_url, online')
                .in('id', userIds);

            if (error) {
                console.error('Error fetching profiles:', error);
                return;
            }

            // Combiner les données de profil avec les derniers messages
            setUserProfiles(data || []);
        } catch (err) {
            console.error('Error fetching profiles:', err);
        }
    };

    // Fonction pour obtenir le nom d'utilisateur à afficher
    const getUserName = (userId: string) => {
        const profile = userProfiles.find(p => p.id === userId);
        return profile?.full_name || `User ${userId}`;
    };

    // Fonction pour obtenir l'avatar à afficher
    const getUserAvatar = (userId: string) => {
        const profile = userProfiles.find(p => p.id === userId);
        return profile?.avatar_url || null;
    };

    // Fonction pour obtenir le statut en ligne
    const getUserOnlineStatus = (userId: string) => {
        const profile = userProfiles.find(p => p.id === userId);
        return profile?.online || false;
    };

    // Filtrer les utilisateurs en fonction de la recherche
    const filteredUserIds = userIds.filter(id => {
        const name = getUserName(id).toLowerCase();
        return name.includes(searchTerm.toLowerCase());
    });

    return (
        <div className="flex flex-col h-screen w-full bg-gray-50">
            {/* Header avec dégradé comme dans le chat */}
            {/* Header avec style plus subtil */}
            <div className="bg-white p-4 border-b border-gray-200 shadow-sm">
                <h1 className="text-lg font-medium text-gray-800">Conversations</h1>
                <p className="text-xs text-gray-500">
                    {userIds.length} contacts
                </p>
            </div>

            {/* Barre de recherche */}
            <div className="bg-white p-3 shadow-sm border-b border-gray-200">
                <div className="relative rounded-full bg-gray-100 flex items-center p-1">
                    <span className="pl-3 text-gray-400">
                        <Search size={18} />
                    </span>
                    <input
                        type="text"
                        placeholder="Rechercher un contact..."
                        className="flex-1 bg-transparent border-none focus:ring-0 outline-none px-3 py-2 text-gray-800"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Liste des conversations */}
            <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                    <div className="flex justify-center items-center h-full">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : error ? (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded m-4 shadow-sm">
                        <p>{error}</p>
                    </div>
                ) : filteredUserIds.length === 0 ? (
                    <div className="flex flex-col justify-center items-center h-full">
                        <div className="bg-blue-100 rounded-full p-6 mb-4">
                            <MessageSquare size={32} className="text-blue-500" />
                        </div>
                        {searchTerm ? (
                            <p className="text-gray-500 text-center">Aucun résultat pour "{searchTerm}"</p>
                        ) : (
                            <>
                                <p className="text-gray-500 text-center">Aucune conversation</p>
                                <p className="text-gray-400 text-sm text-center mt-2">
                                    Commencez à discuter avec quelqu'un
                                </p>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {filteredUserIds.map((id, index) => (
                            <Link
                                to={`/chat/${id}`}
                                key={index}
                                className="block hover:bg-gray-100 transition-colors"
                            >
                                <div className="p-4 flex items-center">
                                    <div className="relative">
                                        {getUserAvatar(id) ? (
                                            <img
                                                src={getUserAvatar(id)}
                                                alt={getUserName(id)}
                                                className="w-12 h-12 rounded-full border border-gray-200 object-cover"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                                                {getUserName(id).charAt(0).toUpperCase()}
                                            </div>
                                        )}

                                        {/* Indicateur de statut en ligne */}
                                        <div className={`absolute bottom-0 right-0 w-3 h-3 ${getUserOnlineStatus(id) ? 'bg-green-400' : 'bg-gray-400'
                                            } rounded-full border-2 border-white`}></div>
                                    </div>

                                    <div className="ml-3 flex-1">
                                        <div className="flex justify-between items-center">
                                            <p className="font-medium text-gray-800">{getUserName(id)}</p>
                                            <p className="text-xs text-gray-400">Aujourd'hui</p>
                                        </div>
                                        <p className="text-sm text-gray-500 truncate mt-1">
                                            {/* Dernier message */}
                                            Cliquez pour voir la conversation
                                        </p>
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