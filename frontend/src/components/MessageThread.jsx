import { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";

import { fetchMessages, sendMessage } from "../services/messagingService";
import ErrorBox from "./ui/ErrorBox";
import LoadingSpinner from "./ui/LoadingSpinner";

const MessageThread = ({ conversationId, conversation, currentUserId }) => {
        const [messages, setMessages] = useState([]);
        const [loading, setLoading] = useState(false);
        const [messageError, setMessageError] = useState("");
        const [messageContent, setMessageContent] = useState("");
        const scrollRef = useRef(null);

        useEffect(() => {
                const loadMessages = async () => {
                        if (!conversationId) {
                                setMessages([]);
                                return;
                        }
                        setLoading(true);
                        setMessageError("");
                        try {
                                const data = await fetchMessages(conversationId);
                                setMessages(Array.isArray(data) ? data : []);
                                setTimeout(() => {
                                        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
                                }, 50);
                        } catch (error) {
                                console.error("Failed to load messages", error);
                                setMessageError(error.response?.data?.message || "Unable to load messages");
                        } finally {
                                setLoading(false);
                        }
                };

                loadMessages();
        }, [conversationId]);

        const handleSend = async (event) => {
                event.preventDefault();
                if (!messageContent.trim() || !conversationId) return;
                try {
                        const newMessage = await sendMessage({
                                conversationId,
                                content: messageContent.trim(),
                        });
                        setMessages((previous) => [...previous, newMessage]);
                        setMessageContent("");
                        setTimeout(() => {
                                scrollRef.current?.scrollIntoView({ behavior: "smooth" });
                        }, 50);
                } catch (error) {
                        console.error("Failed to send message", error);
                        toast.error(error.response?.data?.message || "Unable to send message");
                        // TODO: route to notification system instead of toast
                }
        };

        if (!conversationId) {
                return (
                        <div className='flex flex-1 items-center justify-center rounded-2xl border border-kingdom-gold/10 bg-black/30 p-6 text-kingdom-ivory/70'>
                                Select a conversation to start messaging.
                        </div>
                );
        }

        return (
                <div className='flex h-full flex-col gap-4 rounded-2xl border border-kingdom-gold/10 bg-black/30 p-4'>
                        <div className='flex items-center justify-between border-b border-kingdom-gold/10 pb-3'>
                                <div>
                                        <p className='text-xs uppercase tracking-wide text-kingdom-ivory/60'>
                                                {conversation?.type === "group" ? "Group" : "Private"}
                                        </p>
                                        <h2 className='text-xl font-semibold text-kingdom-ivory'>
                                                {conversation?.type === "group"
                                                        ? conversation?.group?.groupName || "Study Group"
                                                        : (conversation?.participants || []).find(
                                                                        (participant) => participant._id !== currentUserId
                                                                )?.name || "Conversation"}
                                        </h2>
                                </div>
                                <div className='h-10 w-10 rounded-full bg-kingdom-purple/40 text-center text-kingdom-gold'>
                                        {/* TODO: replace placeholder avatar or badge per role */}
                                        <span className='flex h-full w-full items-center justify-center font-semibold'>
                                                {conversation?.type === "group"
                                                        ? conversation?.group?.groupName?.[0] || "G"
                                                        : (conversation?.participants || []).find(
                                                                        (participant) => participant._id !== currentUserId
                                                                )?.name?.[0] || "M"}
                                        </span>
                                </div>
                        </div>

                        <div className='flex-1 space-y-3 overflow-y-auto rounded-xl bg-kingdom-purple/10 p-3'>
                                {loading && <LoadingSpinner label='Loading messages...' />}
                                {messageError && !loading && <ErrorBox message={messageError} onRetry={() => setMessageError("")} />}
                                {!loading && messages.length === 0 && !messageError && (
                                        <p className='text-sm text-kingdom-ivory/70'>No messages yet.</p>
                                )}
                                {messages.map((message) => {
                                        const isSelf = message.sender?.toString?.()
                                                ? message.sender.toString() === currentUserId
                                                : message.sender?._id === currentUserId;
                                        const senderName = message.sender?.name || (isSelf ? "You" : "Member");

                                        return (
                                                <div
                                                        key={message._id}
                                                        className={`flex ${isSelf ? "justify-end" : "justify-start"}`}
                                                >
                                                        <div
                                                                className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-royal-soft ${
                                                                        isSelf
                                                                                ? "bg-kingdom-gold text-kingdom-charcoal"
                                                                                : "bg-kingdom-purple/50 text-kingdom-ivory"
                                                                }`}
                                                        >
                                                                <p className='text-xs font-semibold opacity-80'>{senderName}</p>
                                                                <p className='mt-1 whitespace-pre-line break-words'>{message.content}</p>
                                                                <p className='mt-1 text-[10px] opacity-60'>
                                                                        {new Date(message.createdAt).toLocaleString()}
                                                                </p>
                                                        </div>
                                                </div>
                                        );
                                })}
                                <div ref={scrollRef} />
                        </div>

                        <form onSubmit={handleSend} className='flex items-center gap-3'>
                                <input
                                        type='text'
                                        value={messageContent}
                                        onChange={(event) => setMessageContent(event.target.value)}
                                        placeholder='Type your message...'
                                        className='flex-1 rounded-xl border border-kingdom-gold/20 bg-black/40 px-3 py-2 text-kingdom-ivory outline-none ring-kingdom-gold/30 focus:ring'
                                />
                                <button
                                        type='submit'
                                        className='rounded-xl bg-kingdom-gold px-4 py-2 font-semibold text-kingdom-charcoal transition hover:bg-amber-400'
                                >
                                        Send
                                </button>
                        </form>
                </div>
        );
};

export default MessageThread;
