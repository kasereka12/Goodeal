import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { Send, ChevronLeft } from "lucide-react";

const Chatperso = () => {
    const { userId } = useParams();
    const user = useAuth();
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState<string>("");

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [unreadMessages, setUnreadMessages] = useState<number>(0);

    useEffect(() => {
        if (!userId || !user.user?.id) return;

        fetchMessages();
        updatemessages();
        fetchRecipientInfo();
        const channel = supabase
            .channel("realtime-messages")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "messages" },
                async (payload) => {
                    setMessages((messages) => [...messages, payload.new]);

                    if (payload.new.receiver_id === user.user.id) {
                        if (!payload.new.read) {
                            setUnreadMessages((prev) => prev + 1);
                        }
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId, user]);

    const updatemessages = async () => {
        try {
            const { error: updateError } = await supabase
                .from("messages")
                .update({ read: true })
                .eq("receiver_id", user.user.id)
                .eq("read", false);


            if (updateError) {
                console.error("❌ Erreur lors de la mise à jour des messages non lus :", updateError);
            }
        } catch (err) {
            console.error("Error fetching messages:", err);
        }
    };

    const fetchRecipientInfo = async () => {
        try {
            const { data, error } = await supabase
                .from("profiles")
                .select("full_name, avatar_url, online")
                .eq("id", userId)
                .single();

            if (error) throw error;
        } catch (err) {
            console.error("Error fetching recipient info:", err);
        }
    };

    const fetchMessages = async () => {
        try {
            
            const { error: updateError } = await supabase
                .from("messages")
                .update({ read: true })
                .eq("receiver_id", user.user.id)
                .eq("read", false);


            if (updateError) {
                console.error("❌ Erreur lors de la mise à jour des messages non lus :", updateError);
            }


            const { data, error } = await supabase
                .from("messages")
                .select("*")
                .or(
                    `and(sender_id.eq.${user.user.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${user.user.id})`
                )
                .order("created_at", { ascending: true });

            if (error) throw error;


            setMessages(data);
            setUnreadMessages(0);
        } catch (err) {
            console.error("Error fetching messages:", err);
        }
    };



    const markMessagesAsRead = async (messages: any[]) => {
        const unreadMessages = messages.filter((msg) => msg.receiver_id === user.user.id && !msg.read);

        if (unreadMessages.length === 0) return;

        try {
            const { error } = await supabase
                .from("messages")
                .update({ read: true })
                .in("id", unreadMessages.map((msg) => msg.id))
                .eq("receiver_id", user.user.id)
                .eq("read", false);

            if (error) throw error;

            // Mise à jour des messages localement
            setMessages((prevMessages) =>
                prevMessages.map((msg) =>
                    unreadMessages.some((unreadMsg) => unreadMsg.id === msg.id)
                        ? { ...msg, read: true }
                        : msg
                )
            );
            setUnreadMessages(0); // Réinitialiser le nombre de messages non lus
        } catch (err) {
            console.error("Erreur lors du marquage des messages comme lus:", err);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim()) return;

        try {
            const { error } = await supabase.from("messages").insert([
                {
                    sender_id: user.user.id,
                    sender_email: user.user.email,
                    receiver_id: userId,
                    text: newMessage,
                    read: false,
                },
            ]);

            if (error) throw error;
            setNewMessage("");
        } catch (err) {
            console.error("Error sending message:", err);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
                <button onClick={() => window.history.back()} className="text-gray-600">
                    <ChevronLeft className="h-5 w-5" />
                </button>
                <div className="flex items-center space-x-2">
                    <h2 className="text-lg font-semibold">{userId}</h2>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.sender_id === user.user.id ? "justify-end" : "justify-start"} space-x-2`}>
                        <div className={`max-w-xs p-2 rounded-lg ${message.sender_id === user.user.id ? "bg-blue-500 text-white" : "bg-gray-100"}`}>
                            <p>{message.text}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex items-center p-4 border-t border-gray-200">
                <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} className="flex-1 p-2 rounded-lg border border-gray-300" placeholder="Type a message..." />
                <button onClick={sendMessage} className="ml-2 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                    <Send className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
};

export default Chatperso;
