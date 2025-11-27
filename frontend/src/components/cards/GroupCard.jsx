import MatchScoreBadge from "./MatchScoreBadge";

const GroupCard = ({ group }) => {
        const { groupName, subject, matchScore, level, major, mode, groupSize, subjectsIncluded } = group || {};
        const subjectsPreview = subjectsIncluded?.length ? subjectsIncluded.join(", ") : subject || "Subject";

        return (
                <article className='flex flex-col gap-3 rounded-2xl border border-kingdom-gold/10 bg-black/40 p-4 shadow-royal-soft transition hover:border-kingdom-gold/30 hover:bg-black/60'>
                        <div className='flex items-start justify-between gap-3'>
                                <div>
                                        <p className='text-xs uppercase tracking-wide text-kingdom-ivory/60'>Study Group</p>
                                        <h3 className='text-xl font-semibold text-kingdom-ivory'>{groupName || "Peer Group"}</h3>
                                        <p className='text-sm text-kingdom-ivory/70'>{subjectsPreview}</p>
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
                                <div>
                                        <p className='text-kingdom-ivory/50'>Group Size</p>
                                        <p className='font-semibold'>{groupSize ? `${groupSize} members` : "Open"}</p>
                                </div>
                        </div>

                        <div className='flex flex-wrap gap-2 text-xs text-kingdom-ivory/70'>
                                <span className='rounded-full bg-kingdom-plum/30 px-3 py-1'>Collaborative</span>
                                {mode && <span className='rounded-full bg-kingdom-purple/30 px-3 py-1 capitalize'>{mode}</span>}
                        </div>

                        <div className='flex flex-wrap gap-2'>
                                <button className='rounded-xl bg-kingdom-gold px-4 py-2 text-sm font-semibold text-kingdom-charcoal transition hover:bg-amber-400'>
                                        Join Group
                                </button>
                                {/* TODO: connect CTA to group details modal or join flow */}
                        </div>
                </article>
        );
};

export default GroupCard;
