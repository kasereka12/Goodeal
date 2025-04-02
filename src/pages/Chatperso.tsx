import { useEffect, useState, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { Send, ChevronLeft, ChevronDown, ChevronUp, MapPin, Info, Phone, MessageCircle } from "lucide-react";

type Message = {
    id: string;
    sender_id: string;
    receiver_id: string;
    text: string;
    listing_id: string | null;
    created_at: string;
    read: boolean;
    isDivider?: boolean;
};

type ListingDetails = {
    id: string;
    title: string;
    price: number;
    images: string[];
    description: string;
    city?: string;
    region?: string;
    phone?: string;
};

const Chatperso = () => {
    const { userId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const urlListingId = queryParams.get("listingId");

    const user = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [listingDetails, setListingDetails] = useState<ListingDetails | null>(null);
    const [receiverProfile, setReceiverProfile] = useState<{ username?: string; avatar_url?: string; phone?: string } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [showListingDetails, setShowListingDetails] = useState(false);
    const [activeListingId, setActiveListingId] = useState<string | null>(urlListingId);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messageContainerRef = useRef<HTMLDivElement>(null);
    const lastListingIdRef = useRef<string | null>(urlListingId);

    // Fetch listing details
    const fetchListingDetails = async (id: string) => {
        if (!id) return;
        try {
            const { data, error } = await supabase
                .from("listings")
                .select("*")
                .eq("id", id)
                .single();

            if (error) throw error;
            setListingDetails(data);
        } catch (err) {
            console.error("Error fetching listing:", err);
        }
    };

    // Fetch receiver profile
    useEffect(() => {
        if (!userId) return;

        const fetchProfile = async () => {
            try {
                const { data, error } = await supabase
                    .from("profiles")
                    .select("username, avatar_url, phone")
                    .eq("user_id", userId)
                    .single();

                if (!error) setReceiverProfile(data);
            } catch (err) {
                console.error("Error fetching profile:", err);
            }
        };

        fetchProfile();
    }, [userId]);

    // Setup chat and handle listing changes
    useEffect(() => {
        if (!userId || !user?.user?.id) return;

        const setupChat = async () => {
            setIsLoading(true);
            try {
                // Load messages (oldest first)
                const { data, error } = await supabase
                    .from("messages")
                    .select("*")
                    .or(
                        `and(sender_id.eq.${user.user.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${user.user.id})`
                    )
                    .order("created_at", { ascending: true });

                if (error) throw error;

                // Process messages and track listing changes
                let currentListingId = urlListingId;
                const processedMessages: Message[] = [];

                if (data && data.length > 0) {
                    // Find the most recent listing_id if not provided in URL
                    if (!currentListingId) {
                        const lastWithListing = [...data].reverse().find(m => m.listing_id);
                        currentListingId = lastWithListing?.listing_id || null;
                    }

                    // Add messages with dividers when listing changes
                    let prevListingId: string | null = null;
                    data.forEach((msg, index) => {
                        if (msg.listing_id && msg.listing_id !== prevListingId && index > 0) {
                            processedMessages.push({
                                id: `divider-${msg.id}`,
                                listing_id: msg.listing_id,
                                created_at: msg.created_at,
                                isDivider: true,
                                text: "Ce message concerne une autre annonce. Consultez l'en-tête pour plus de détails."
                            });
                        }
                        processedMessages.push(msg);
                        prevListingId = msg.listing_id || prevListingId;
                    });

                    setActiveListingId(currentListingId);
                    lastListingIdRef.current = currentListingId;
                }

                setMessages(processedMessages);

                // Load listing details if needed
                if (currentListingId) {
                    await fetchListingDetails(currentListingId);
                }

                // Mark messages as read
                await supabase
                    .from("messages")
                    .update({ read: true })
                    .eq("receiver_id", user.user.id)
                    .eq("read", false);

                // Setup realtime updates
                const channel = supabase
                    .channel(`chat_${user.user.id}_${userId}`)
                    .on(
                        'postgres_changes',
                        {
                            event: 'INSERT',
                            schema: 'public',
                            table: 'messages',
                        },
                        async (payload) => {
                            const newMessage = payload.new as Message;

                            // Handle new listing context
                            if (newMessage.listing_id && newMessage.listing_id !== lastListingIdRef.current) {
                                setMessages(prev => [
                                    ...prev,
                                    {
                                        id: `divider-${Date.now()}`,
                                        listing_id: newMessage.listing_id,
                                        created_at: new Date().toISOString(),
                                        isDivider: true,
                                        text: "Ce message concerne une autre annonce. Consultez l'en-tête pour plus de détails."
                                    },
                                    newMessage
                                ]);
                                lastListingIdRef.current = newMessage.listing_id;
                                setActiveListingId(newMessage.listing_id);
                                await fetchListingDetails(newMessage.listing_id);
                            } else {
                                setMessages(prev => [...prev, newMessage]);
                            }
                        }
                    )
                    .subscribe();

            } catch (err) {
                console.error("Chat setup error:", err);
            } finally {
                setIsLoading(false);
                setTimeout(() => {
                    scrollToBottom();
                }, 100);
            }
        };

        setupChat();

        return () => {
            supabase.removeChannel(supabase.channel(`chat_${user?.user?.id}_${userId}`));
        };
    }, [userId, user?.user?.id, urlListingId]);

    // Scroll to bottom function
    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "auto" });
        }
    };

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Handle WhatsApp click
    const handleWhatsAppClick = () => {
        const phoneNumber = receiverProfile?.phone || listingDetails?.phone;
        if (phoneNumber) {
            window.open(`https://wa.me/${phoneNumber}`, '_blank');
        }
    };

    // Handle phone call
    const handlePhoneClick = () => {
        const phoneNumber = receiverProfile?.phone || listingDetails?.phone;
        if (phoneNumber) {
            window.open(`tel:${phoneNumber}`, '_blank');
        }
    };

    // Send message with current listing context
    const sendMessage = async () => {
        if (!newMessage.trim() || !user?.user?.id || !userId || isSending) return;

        setIsSending(true);
        const messageToSend = newMessage;
        setNewMessage("");

        try {
            const { data, error } = await supabase
                .from("messages")
                .insert({
                    sender_id: user.user.id,
                    receiver_id: userId,
                    sender_email: user?.user?.email,
                    text: messageToSend,
                    listing_id: activeListingId,
                    read: false
                })
                .select()
                .single();

            if (error) throw error;

        } catch (err) {
            console.error("Error sending message:", err);
            setNewMessage(messageToSend); // Restore message if failed
        } finally {
            setIsSending(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen w-full">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen max-h-screen overflow-hidden bg-gray-50">
            {/* Header with listing info */}
            <div className="flex items-center p-3 border-b border-gray-200 bg-white z-10">
                <button
                    onClick={() => navigate(-1)}
                    className="mr-3 p-1 rounded-full hover:bg-gray-100"
                >
                    <ChevronLeft className="h-5 w-5 text-gray-600" />
                </button>

                <div className="flex-1 min-w-0">
                    {listingDetails ? (
                        <>
                            <h2 className="font-semibold truncate text-gray-800">{listingDetails.title}</h2>
                            <p className="text-sm text-gray-500 truncate flex items-center">
                                <span className="font-medium text-blue-600">{listingDetails.price} MAD</span>
                                {listingDetails.city && (
                                    <span className="flex items-center ml-2">
                                        <span className="mx-1 text-gray-400">•</span>
                                        {listingDetails.city}
                                    </span>
                                )}
                            </p>
                        </>
                    ) : (
                        <div className="flex items-center gap-2">
                            {receiverProfile?.avatar_url && (
                                <img
                                    src={receiverProfile.avatar_url}
                                    alt="Avatar"
                                    className="w-8 h-8 rounded-full border border-gray-200"
                                />
                            )}
                            <h2 className="font-semibold text-gray-800">
                                Conversation avec {receiverProfile?.username || "l'utilisateur"}
                            </h2>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-1 ml-2">
                    {(receiverProfile?.phone || listingDetails?.phone) && (
                        <>
                            <button
                                onClick={handleWhatsAppClick}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-full"
                                title="Contacter via WhatsApp"
                            >
                                <MessageCircle className="h-5 w-5" />
                            </button>
                            <button
                                onClick={handlePhoneClick}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                                title="Appeler"
                            >
                                <Phone className="h-5 w-5" />
                            </button>
                        </>
                    )}

                    {listingDetails && (
                        <button
                            onClick={() => setShowListingDetails(!showListingDetails)}
                            className="ml-1 p-2 hover:bg-gray-100 rounded-full"
                        >
                            {showListingDetails ? (
                                <ChevronUp className="h-5 w-5 text-gray-600" />
                            ) : (
                                <ChevronDown className="h-5 w-5 text-gray-600" />
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* Listing details toggle */}
            {showListingDetails && listingDetails && (
                <div className="p-3 border-b bg-white">
                    <div className="flex gap-3">
                        {listingDetails.images?.[0] && (
                            <img
                                src={listingDetails.images[0]}
                                alt={listingDetails.title}
                                className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                            />
                        )}
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold truncate text-gray-800">{listingDetails.title}</h3>
                            <p className="text-blue-600 font-bold">{listingDetails.price} MAD</p>
                            {(listingDetails.city || listingDetails.region) && (
                                <div className="flex items-center text-sm text-gray-500 mt-1">
                                    <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                                    <span className="truncate">
                                        {listingDetails.city}{listingDetails.region && `, ${listingDetails.region}`}
                                    </span>
                                </div>
                            )}
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {listingDetails.description}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Messages area */}
            <div
                ref={messageContainerRef}
                className="flex-1 overflow-y-auto pb-4 px-3 scrollbar-thin scrollbar-thumb-gray-300"
            >
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-4">
                        <p className="text-gray-500 mb-4">
                            {listingDetails
                                ? "Vous contactez l'annonceur à propos de cette annonce"
                                : "Commencez la conversation"}
                        </p>
                        {listingDetails && (
                            <div className="max-w-md w-full bg-white p-4 rounded-lg border border-gray-200">
                                <h3 className="font-semibold text-gray-800">{listingDetails.title}</h3>
                                <p className="text-blue-600 font-bold">{listingDetails.price} MAD</p>
                                <p className="text-sm text-gray-600 line-clamp-2 mt-2">
                                    {listingDetails.description}
                                </p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="pt-3 space-y-2">
                        {messages.map((message) => {
                            if (message.isDivider) {
                                return (
                                    <div key={message.id} className="flex justify-center my-3">
                                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-medium">
                                            <Info className="h-3 w-3 mr-1 flex-shrink-0" />
                                            {message.text}
                                        </div>
                                    </div>
                                );
                            }

                            const isUserMessage = message.sender_id === user?.user?.id;

                            return (
                                <div
                                    key={message.id}
                                    className={`flex ${isUserMessage ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${isUserMessage
                                                ? "bg-blue-600 text-white rounded-br-sm"
                                                : "bg-white border border-gray-200 rounded-bl-sm"
                                            }`}
                                    >
                                        <p className="text-sm break-words leading-relaxed">{message.text}</p>
                                        <p className={`text-xs mt-1 text-right ${isUserMessage
                                                ? "text-blue-100"
                                                : "text-gray-400"
                                            }`}>
                                            {new Date(message.created_at).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Message input */}
            <div className="bg-white border-t border-gray-200 px-3 py-2">
                <div className="flex items-center">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                        placeholder="Écrire un message..."
                        disabled={isSending}
                    />
                    <button
                        onClick={sendMessage}
                        disabled={!newMessage.trim() || isSending}
                        className={`ml-2 p-2 ${!newMessage.trim() || isSending ? 'bg-gray-300' : 'bg-blue-600'} text-white rounded-full`}
                    >
                        <Send className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Chatperso;