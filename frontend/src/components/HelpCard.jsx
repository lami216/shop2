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

const HelpCard = ({ profile }) => {
        const { name, subject, matchScore, level, major, mode, needsHelp, canHelp } = profile || {};
        const helperMessage = canHelp ? "This user can explain to you" : needsHelp ? "Needs explanation" : "Mutual help";

        return (
                <article className='flex flex-col gap-3 rounded-2xl border border-kingdom-gold/10 bg-black/40 p-4 shadow-royal-soft transition hover:border-kingdom-gold/30 hover:bg-black/60'>
                        <div className='flex items-start justify-between gap-3'>
                                <div>
                                        <p className='text-xs uppercase tracking-wide text-kingdom-ivory/60'>Help Exchange</p>
                                        <h3 className='text-xl font-semibold text-kingdom-ivory'>{name || "Student"}</h3>
                                        <p className='text-sm text-kingdom-ivory/70'>{subject || "Subject"}</p>
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

                        <div className='flex flex-wrap items-center gap-2 text-xs text-kingdom-ivory/70'>
                                <span className='rounded-full bg-kingdom-plum/30 px-3 py-1'>{helperMessage}</span>
                                {canHelp && <span className='rounded-full bg-emerald-500/20 px-3 py-1 text-emerald-100'>Helper</span>}
                                {needsHelp && <span className='rounded-full bg-kingdom-purple/30 px-3 py-1'>Needs Support</span>}
                        </div>
                </article>
        );
};

export default HelpCard;
