import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import LoadingSpinner from "../../../components/LoadingSpinner";
import { useUserStore } from "../../../stores/useUserStore";
import { useMessagingStore } from "../../../stores/useMessagingStore";

const ChatWindow = () => {
        const { conversationId } = useParams();
        const navigate = useNavigate();
        const user = useUserStore((state) => state.user);
        const {
                conversations,
                messages,
                fetchMessages,
                sendMessage,
                fetchConversations,
                loading,
        } = useMessagingStore();
        const [text, setText] = useState("");

        useEffect(() => {
                if (!conversations.length) {
                        fetchConversations();
                }
        }, [conversations.length, fetchConversations]);

        useEffect(() => {
                if (conversationId) {
                        fetchMessages(conversationId);
                }
        }, [conversationId, fetchMessages]);

        const activeConversation = useMemo(
                () => conversations.find((c) => c._id === conversationId),
                [conversations, conversationId]
        );

        const partner = useMemo(() => {
                return (
                        activeConversation?.participants?.find(
                                (participant) => String(participant._id) !== String(user?._id)
                        ) || activeConversation?.participants?.[0]
                );
        }, [activeConversation, user]);

        const handleSend = async (e) => {
                e.preventDefault();
                if (!text.trim()) return;

                await sendMessage(conversationId, text.trim());
                setText("");
                await fetchMessages(conversationId);
        };

        if (loading && messages.length === 0) {
                return <LoadingSpinner />;
        }

        return (
                <div className='container mx-auto px-4 pb-16 pt-24 text-right text-white'>
                        <div className='mb-4 flex items-center justify-between gap-4'>
                                <div>
                                        <p className='text-sm text-white/60'>رسائل ملتقى</p>
                                        <h1 className='text-2xl font-bold'>{partner?.name || "محادثة"}</h1>
                                        <p className='text-xs text-white/60'>{partner?.email}</p>
                                </div>
                                <button
                                        onClick={() => navigate("/moltaqa/messages")}
                                        className='rounded-lg border border-white/20 bg-transparent px-4 py-2 text-sm text-white transition hover:bg-white/10'
                                >
                                        العودة للقائمة
                                </button>
                        </div>

                        <div className='flex flex-col gap-4 rounded-xl border border-white/10 bg-white/5 p-4 shadow-xl backdrop-blur'>
                                <div className='flex max-h-[60vh] flex-col gap-3 overflow-y-auto rounded-lg bg-white/5 p-3'>
                                        {messages.length === 0 ? (
                                                <p className='text-center text-white/60'>لا توجد رسائل بعد. ابدأ المحادثة الآن.</p>
                                        ) : (
                                                messages.map((message) => {
                                                        const isMine = String(message.sender) === String(user?._id);
                                                        return (
                                                                <div
                                                                        key={message._id}
                                                                        className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                                                                >
                                                                        <div
                                                                                className={`max-w-[75%] rounded-lg px-4 py-2 text-sm shadow ${
                                                                                        isMine
                                                                                                ? "bg-payzone-gold text-payzone-navy"
                                                                                                : "bg-white/10 text-white"
                                                                                }`}
                                                                        >
                                                                                <p>{message.text}</p>
                                                                                <span className='mt-1 block text-[10px] text-white/70'>
                                                                                        {new Date(message.createdAt).toLocaleString()}
                                                                                </span>
                                                                        </div>
                                                                </div>
                                                        );
                                                })
                                        )}
                                </div>

                                <form onSubmit={handleSend} className='flex items-center gap-3'>
                                        <input
                                                type='text'
                                                value={text}
                                                onChange={(e) => setText(e.target.value)}
                                                placeholder='اكتب رسالتك هنا...'
                                                className='w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-white/50 focus:border-payzone-gold focus:outline-none'
                                        />
                                        <button
                                                type='submit'
                                                className='rounded-lg bg-payzone-gold px-5 py-3 text-sm font-semibold text-payzone-navy shadow-lg transition duration-200 hover:bg-[#b8873d]'
                                        >
                                                إرسال
                                        </button>
                                </form>
                        </div>
                </div>
        );
};

export default ChatWindow;
