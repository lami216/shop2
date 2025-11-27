import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import { startPrivateConversation } from "../services/messagingService";
import { useUserStore } from "../stores/useUserStore";
import TutorBadge from "./TutorBadge";

const ScoreBadge = ({ score }) => (
        <div className='flex items-center gap-2 rounded-full bg-kingdom-plum/30 px-3 py-1 text-sm font-semibold text-kingdom-gold'>
                <span className='h-2 w-14 overflow-hidden rounded-full bg-kingdom-cream/10'>
                        <span
                                className='block h-full rounded-full bg-kingdom-gold'
                                style={{ width: `${Math.min(Number(score) || 0, 100)}%` }}
                        />
                </span>
                <span>{Math.round(Number(score) || 0)}% match</span>
        </div>
);

const PartnerCard = ({ partner }) => {
        const { name, level, major, mode, subject, matchScore, badge, avatarColor } = partner || {};
        const avatarBackground = avatarColor || (partner?.gender === "female" ? "bg-pink-500/50" : "bg-kingdom-purple/50");
        const navigate = useNavigate();
        const user = useUserStore((state) => state.user);

        const handleMessage = async () => {
                try {
                        const targetUserId = partner?.userId || partner?._id || partner?.id;

                        if (!targetUserId) {
                                toast.error("Cannot open chat for this partner yet");
                                return;
                        }

                        if (!user) {
                                navigate("/login");
                                return;
                        }

                        const conversation = await startPrivateConversation(targetUserId);
                        if (conversation?._id) {
                                navigate(`/chat?c=${conversation._id}`);
                        }
                        // TODO: add partner compatibility context to chat launch
                } catch (error) {
                        console.error("Failed to start partner conversation", error);
                        toast.error(error.response?.data?.message || "Unable to start chat");
                }
        };

        return (
                <article className='flex flex-col gap-3 rounded-2xl border border-kingdom-gold/10 bg-black/40 p-4 shadow-royal-soft transition hover:border-kingdom-gold/30 hover:bg-black/60'>
                        <div className='flex items-start justify-between gap-3'>
                                <div className='flex items-center gap-3'>
                                        <div className={`relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full ${avatarBackground}`}>
                                                {/* TODO: replace placeholder avatar with real profile image */}
                                                <span className='text-lg font-bold text-kingdom-gold'>{name?.[0] || "P"}</span>
                                                {badge && <span className={`absolute inset-0 rounded-full avatar-frame-${badge?.toLowerCase?.()}`} />}
                                        </div>
                                        <div>
                                                <h3 className='text-lg font-semibold text-kingdom-ivory'>{name || "Study Partner"}</h3>
                                                <p className='text-sm text-kingdom-ivory/70'>{subject || "Subject"}</p>
                                        </div>
                                </div>
                                <ScoreBadge score={matchScore} />
                        </div>

                        <div className='grid grid-cols-2 gap-3 text-sm text-kingdom-ivory/80 sm:grid-cols-3'>
                                <div>
                                        <p className='text-kingdom-ivory/50'>Level</p>
                                        <p className='font-semibold'>{level || "—"}</p>
                                </div>
                                <div>
                                        <p className='text-kingdom-ivory/50'>Major</p>
                                        <p className='font-semibold'>{major || "—"}</p>
                                </div>
                                <div>
                                        <p className='text-kingdom-ivory/50'>Mode</p>
                                        <p className='font-semibold capitalize'>{mode || "flexible"}</p>
                                </div>
                        </div>

                        <div className='flex flex-wrap gap-2 text-xs text-kingdom-ivory/70'>
                                <span className='rounded-full bg-kingdom-plum/30 px-3 py-1'>Peer Partner</span>
                                {badge && (
                                        <span className='rounded-full bg-kingdom-purple/30 px-3 py-1 text-kingdom-gold'>
                                                <TutorBadge badgeName={badge} />
                                        </span>
                                )}
                        </div>

                        <div className='flex flex-wrap gap-2'>
                                <button
                                        onClick={handleMessage}
                                        className='rounded-xl bg-kingdom-gold px-4 py-2 text-sm font-semibold text-kingdom-charcoal transition hover:bg-amber-400'
                                >
                                        Message
                                </button>
                        </div>
                </article>
        );
};

export default PartnerCard;
