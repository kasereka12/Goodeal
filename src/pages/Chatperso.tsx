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
                    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
                }, 100);
            }
        };

        setupChat();

        return () => {
            supabase.removeChannel(supabase.channel(`chat_${user?.user?.id}_${userId}`));
        };
    }, [userId, user?.user?.id, urlListingId]);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            {/* Header with listing info */}
            <div className="flex items-center p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
                <button onClick={() => navigate(-1)} className="mr-2">
                    <ChevronLeft className="h-5 w-5" />
                </button>

                <div className="flex-1 min-w-0">
                    {listingDetails ? (
                        <>
                            <h2 className="font-semibold truncate">{listingDetails.title}</h2>
                            <p className="text-sm text-gray-500 truncate">
                                {listingDetails.price} MAD
                                {listingDetails.city && ` • ${listingDetails.city}`}
                            </p>
                        </>
                    ) : (
                        <div className="flex items-center gap-2">
                            <h2 className="font-semibold">
                                Conversation avec {receiverProfile?.username || "l'utilisateur"}
                            </h2>
                            {receiverProfile?.avatar_url && (
                                <img
                                    src={receiverProfile.avatar_url}
                                    alt="Avatar"
                                    className="w-6 h-6 rounded-full"
                                />
                            )}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2 ml-2">
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
                            className="ml-2"
                        >
                            {showListingDetails ? (
                                <ChevronUp className="h-5 w-5" />
                            ) : (
                                <ChevronDown className="h-5 w-5" />
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* Listing details toggle */}
            {showListingDetails && listingDetails && (
                <div className="p-4 border-b bg-gray-50">
                    <div className="flex gap-4">
                        {listingDetails.images?.[0] && (
                            <img
                                src={listingDetails.images[0]}
                                alt={listingDetails.title}
                                className="w-16 h-16 rounded-lg object-cover"
                            />
                        )}
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold truncate">{listingDetails.title}</h3>
                            <p className="text-primary font-bold">{listingDetails.price} MAD</p>
                            <div className="flex items-center text-sm text-gray-500 mt-1">
                                <MapPin className="h-4 w-4 mr-1" />
                                <span className="truncate">
                                    {listingDetails.city}, {listingDetails.region}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                                {listingDetails.description}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-4">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-4">
                        <p className="text-gray-500 mb-4">
                            {listingDetails
                                ? "Vous contactez l'annonceur à propos de cette annonce"
                                : "Commencez la conversation"}
                        </p>
                        {listingDetails && (
                            <div className="max-w-md w-full bg-white p-4 rounded-lg border border-gray-200">
                                <h3 className="font-semibold">{listingDetails.title}</h3>
                                <p className="text-primary font-bold">{listingDetails.price} MAD</p>
                                <p className="text-sm text-gray-600 line-clamp-2">
                                    {listingDetails.description}
                                </p>
                            </div>
                        )}
                    </div>
                ) : (
                    messages.map((message) => {
                        if (message.isDivider) {
                            return (
                                <div key={message.id} className="flex justify-center my-4">
                                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-medium">
                                        <Info className="h-3 w-3 mr-1" />
                                        {message.text}
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <div
                                key={message.id}
                                className={`flex ${message.sender_id === user?.user?.id ? "justify-end" : "justify-start"} mb-4`}
                            >
                                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.sender_id === user?.user?.id
                                        ? "bg-blue-600 text-white rounded-br-none"
                                        : "bg-white border border-gray-200 rounded-bl-none shadow-sm"
                                    }`}>
                                    <p className="text-sm break-words">{message.text}</p>
                                    <p className={`text-xs mt-1 text-right ${message.sender_id === user?.user?.id
                                            ? "text-blue-100"
                                            : "text-gray-500"
                                        }`}>
                                        {new Date(message.created_at).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Message input */}
            <div className="bg-white p-4 border-t border-gray-200 sticky bottom-0">
                <div className="flex items-center">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Écrire un message..."
                        disabled={isSending}
                    />
                    <button
                        onClick={sendMessage}
                        disabled={!newMessage.trim() || isSending}
                        className="ml-2 p-2 bg-blue-600 text-white rounded-full disabled:bg-gray-300 hover:bg-blue-700 transition-colors duration-200"
                    >
                        <Send className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Chatperso;