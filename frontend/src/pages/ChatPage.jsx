import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";

import ConversationList from "../components/ConversationList";
import MessageThread from "../components/MessageThread";
import {
        fetchConversationById,
        fetchConversations,
        startPrivateConversation,
} from "../services/messagingService";
import { useUserStore } from "../stores/useUserStore";
import useTranslation from "../hooks/useTranslation";

const ChatPage = () => {
        const { t, i18n } = useTranslation();
        const user = useUserStore((state) => state.user);
        const [conversations, setConversations] = useState([]);
        const [activeConversationId, setActiveConversationId] = useState("");
        const [loading, setLoading] = useState(false);
        const [error, setError] = useState("");
        const navigate = useNavigate();
        const [searchParams] = useSearchParams();
        const [isMobile, setIsMobile] = useState(() => window.matchMedia("(max-width: 1023px)").matches);
        const [showList, setShowList] = useState(true);

        const currentUserId = user?._id;

        useEffect(() => {
                const handler = () => setIsMobile(window.matchMedia("(max-width: 1023px)").matches);
                handler();
                window.addEventListener("resize", handler);
                return () => window.removeEventListener("resize", handler);
        }, []);

        useEffect(() => {
                if (!isMobile) {
                        setShowList(true);
                }
        }, [isMobile]);

        const loadConversations = async () => {
                setLoading(true);
                setError("");
                try {
                        const data = await fetchConversations();
                        const list = Array.isArray(data) ? data : [];
                        setConversations(list);

                        const fromQuery = searchParams.get("c");
                        if (fromQuery) {
                                setActiveConversationId(fromQuery);
                                if (!list.some((conversation) => conversation._id === fromQuery)) {
                                        try {
                                                const extra = await fetchConversationById(fromQuery);
                                                if (extra) {
                                                        setConversations((prev) => {
                                                                const deduped = prev.filter((item) => item._id !== extra._id);
                                                                return [...deduped, extra];
                                                        });
                                                }
                                        } catch (fetchError) {
                                                console.error("Failed to hydrate conversation", fetchError);
                                        }
                                }
                        } else if (!activeConversationId && list.length) {
                                setActiveConversationId(list[0]._id);
                        }
                } catch (err) {
                        console.error("Failed to fetch conversations", err);
                        setError(err.response?.data?.message || "Unable to load conversations");
                } finally {
                        setLoading(false);
                }
        };

        useEffect(() => {
                if (!user) return;
                loadConversations();
        }, [user]);

        useEffect(() => {
                document.title = t("page.chat.title") || "Moltaqa";
        }, [i18n.language, t]);

        const activeConversation = useMemo(
                () => conversations.find((conversation) => conversation._id === activeConversationId),
                [activeConversationId, conversations]
        );

        const showListPanel = !isMobile || showList;
        const showThreadPanel = !isMobile || !showList;

        const handleSelectConversation = (conversationId) => {
                setActiveConversationId(conversationId);
                navigate(`/chat?c=${conversationId}`);
                if (isMobile) {
                        setShowList(false);
                }
        };

        const handleStartConversation = async () => {
                try {
                        const otherId = searchParams.get("user");
                        if (otherId) {
                                const conversation = await startPrivateConversation(otherId);
                                setActiveConversationId(conversation?._id);
                                setConversations((prev) => {
                                        const deduped = prev.filter((item) => item._id !== conversation._id);
                                        return [conversation, ...deduped];
                                });
                                navigate(`/chat?c=${conversation?._id}`);
                                if (isMobile) {
                                        setShowList(false);
                                }
                        }
                } catch (startError) {
                        console.error("Failed to start private conversation", startError);
                        toast.error(startError.response?.data?.message || "Unable to start conversation");
                }
        };

        useEffect(() => {
                if (searchParams.get("user")) {
                        handleStartConversation();
                }
        }, [searchParams]);

        if (!user) {
                return (
                        <div className='flex min-h-screen items-center justify-center bg-gradient-to-b from-[#0A050D] via-kingdom-plum/70 to-[#010104] p-6 text-center text-kingdom-ivory'>
                                <div className='max-w-md space-y-4 rounded-2xl border border-kingdom-gold/20 bg-black/40 p-6'>
                                        <h1 className='text-2xl font-bold text-kingdom-gold'>{t("page.chat.heading")}</h1>
                                        <p className='text-kingdom-ivory/70'>{t("chat.loginPrompt")}</p>
                                </div>
                        </div>
                );
        }

        return (
                <div className='min-h-screen bg-gradient-to-b from-[#0A050D] via-kingdom-plum/70 to-[#010104] text-kingdom-cream'>
                        <div className='mx-auto flex max-w-6xl flex-col gap-4 px-4 pb-24 pt-24 lg:flex-row'>
                                {showListPanel && (
                                        <div className='lg:w-1/3'>
                                                <div className='rounded-2xl border border-kingdom-gold/20 bg-black/40 p-4 shadow-royal-soft'>
                                                        <div className='mb-4 flex items-center justify-between'>
                                                                <h2 className='text-xl font-semibold text-kingdom-ivory'>{t("page.chat.heading")}</h2>
                                                                {loading && <span className='text-xs text-kingdom-ivory/70'>{t("common.loading")}</span>}
                                                        </div>
                                                        {error && (
                                                                <p className='mb-3 rounded-lg bg-red-500/10 p-2 text-sm text-red-200'>
                                                                        {error}
                                                                </p>
                                                        )}
                                                        {conversations.length === 0 && !loading ? (
                                                                <p className='text-sm text-kingdom-ivory/70'>{t("chat.empty")}</p>
                                                        ) : (
                                                                <ConversationList
                                                                        conversations={conversations}
                                                                        activeId={activeConversationId}
                                                                        onSelect={handleSelectConversation}
                                                                        currentUserId={currentUserId}
                                                                />
                                                        )}
                                                </div>
                                        </div>
                                )}

                                {showThreadPanel && (
                                        <div className='lg:w-2/3'>
                                                {isMobile && showList && (
                                                        <div className='rounded-2xl border border-kingdom-gold/20 bg-black/30 p-4 text-sm text-kingdom-ivory/80'>
                                                                {t("search.startState")}
                                                        </div>
                                                )}

                                                {!showList && isMobile && (
                                                        <button
                                                                onClick={() => setShowList(true)}
                                                                className='mb-3 inline-flex items-center gap-2 rounded-full border border-kingdom-gold/30 px-3 py-1 text-xs text-kingdom-ivory transition hover:border-kingdom-gold/60'
                                                        >
                                                                {t("common.back")}
                                                        </button>
                                                )}

                                                <MessageThread
                                                        conversationId={activeConversationId}
                                                        conversation={activeConversation}
                                                        currentUserId={currentUserId}
                                                />
                                        </div>
                                )}
                        </div>
                </div>
        );
};

export default ChatPage;
