import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../../../components/LoadingSpinner";
import { useUserStore } from "../../../stores/useUserStore";
import { useMessagingStore } from "../../../stores/useMessagingStore";

const ConversationsList = () => {
        const navigate = useNavigate();
        const user = useUserStore((state) => state.user);
        const { conversations, fetchConversations, loading } = useMessagingStore();

        useEffect(() => {
                fetchConversations();
        }, [fetchConversations]);

        if (loading && conversations.length === 0) {
                return <LoadingSpinner />;
        }

        return (
                <div className='container mx-auto px-4 pb-16 pt-24 text-right text-white'>
                        <div className='mb-8 flex items-center justify-between'>
                                <div>
                                        <p className='text-sm text-white/60'>رسائل ملتقى</p>
                                        <h1 className='text-3xl font-bold'>محادثاتي</h1>
                                </div>
                        </div>

                        {conversations.length === 0 ? (
                                <div className='rounded-xl border border-white/10 bg-white/5 p-8 text-center shadow-xl backdrop-blur'>
                                        <p className='text-lg text-white/70'>لا توجد محادثات حتى الآن.</p>
                                </div>
                        ) : (
                                <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                                        {conversations.map((conversation) => {
                                                const partner = conversation.participants?.find(
                                                        (p) => String(p._id) !== String(user?._id)
                                                ) || conversation.participants?.[0];
                                                const unreadCount =
                                                        conversation.unreadCounts?.[user?._id] ??
                                                        conversation.unreadCounts?.get?.(user?._id) ??
                                                        0;

                                                return (
                                                        <button
                                                                key={conversation._id}
                                                                onClick={() => navigate(`/moltaqa/messages/${conversation._id}`)}
                                                                className='flex flex-col items-start gap-2 rounded-xl border border-white/10 bg-white/5 p-5 text-right shadow-lg transition duration-200 hover:border-payzone-gold hover:bg-white/10'
                                                        >
                                                                <div className='flex w-full items-center justify-between gap-2'>
                                                                        <div>
                                                                                <h2 className='text-lg font-semibold text-white'>
                                                                                        {partner?.name || "طالب"}
                                                                                </h2>
                                                                                <p className='text-xs text-white/60'>{partner?.email}</p>
                                                                        </div>
                                                                        {unreadCount > 0 && (
                                                                                <span className='rounded-full bg-payzone-gold px-3 py-1 text-xs font-bold text-payzone-navy'>
                                                                                        {unreadCount}
                                                                                </span>
                                                                        )}
                                                                </div>
                                                                <p className='text-sm text-white/70 line-clamp-2'>
                                                                        {conversation.lastMessage?.text || "ابدأ المحادثة"}
                                                                </p>
                                                        </button>
                                                );
                                        })}
                                </div>
                        )}
                </div>
        );
};

export default ConversationsList;
