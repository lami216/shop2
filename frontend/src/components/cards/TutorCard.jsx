import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import { startPrivateConversation } from "../../services/messagingService";
import { useUserStore } from "../../stores/useUserStore";
import TutorBadge from "../TutorBadge";
import MatchScoreBadge from "./MatchScoreBadge";

const TutorCard = ({ tutor }) => {
        const { name, subject, level, major, mode, matchScore, badge, avatarUrl, verified, teacherBadge } = tutor || {};
        const badgeName = teacherBadge || badge?.name || badge;
        const frameClass = badgeName ? `avatar-frame-${badgeName.toLowerCase?.()}` : "";
        const navigate = useNavigate();
        const user = useUserStore((state) => state.user);

        const handleMessage = async () => {
                try {
                        const targetUserId = tutor?.userId || tutor?._id || tutor?.id;

                        if (!targetUserId) {
                                toast.error("Cannot open chat for this tutor yet");
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
                        // TODO: refine routing to thread-specific tabs for active lessons
                } catch (error) {
                        console.error("Failed to start tutor conversation", error);
                        toast.error(error.response?.data?.message || "Unable to start chat");
                }
        };

        return (
                <article className='flex flex-col gap-3 rounded-2xl border border-kingdom-gold/10 bg-black/40 p-4 shadow-royal-soft transition hover:border-kingdom-gold/30 hover:bg-black/60'>
                        <div className='flex items-start justify-between gap-3'>
                                <div className='flex items-center gap-3'>
                                        <div className={`relative h-12 w-12 overflow-hidden rounded-full bg-kingdom-purple/40 ${frameClass}`}>
                                                {/* TODO: replace placeholder avatar with real profile image */}
                                                {avatarUrl ? (
                                                        <img src={avatarUrl} alt={name} className='h-full w-full object-cover' />
                                                ) : (
                                                        <span className='flex h-full w-full items-center justify-center text-lg font-bold text-kingdom-gold'>
                                                                {name?.[0] || "T"}
                                                        </span>
                                                )}
                                        </div>
                                        <div>
                                                <div className='flex flex-wrap items-center gap-2'>
                                                        <h3 className='text-lg font-semibold text-kingdom-ivory'>{name || "Tutor"}</h3>
                                                        {verified && (
                                                                <span className='rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-200'>Verified</span>
                                                        )}
                                                </div>
                                                <p className='text-sm text-kingdom-ivory/70'>{subject || "Subject"}</p>
                                        </div>
                                </div>
                                <MatchScoreBadge score={matchScore} />
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

                        <div className='flex flex-wrap items-center gap-2 text-xs text-kingdom-ivory/70'>
                                <span className='rounded-full bg-kingdom-plum/30 px-3 py-1'>Tutor</span>
                                {badgeName && <TutorBadge badgeName={badgeName} />}
                        </div>

                        <div className='flex flex-wrap gap-2'>
                                <button
                                        onClick={handleMessage}
                                        className='rounded-xl bg-kingdom-gold px-4 py-2 text-sm font-semibold text-kingdom-charcoal transition hover:bg-amber-400'
                                >
                                        Contact Tutor
                                </button>
                                {/* TODO: show availability or lesson booking action next to messaging */}
                        </div>
                </article>
        );
};

export default TutorCard;
