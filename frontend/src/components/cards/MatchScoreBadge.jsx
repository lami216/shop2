const MatchScoreBadge = ({ score }) => {
        const numeric = Math.min(Math.max(Number(score) || 0, 0), 100);

        return (
                <div className='flex items-center gap-2 rounded-full bg-kingdom-plum/30 px-3 py-1 text-sm font-semibold text-kingdom-gold'>
                        <span className='h-2 w-14 overflow-hidden rounded-full bg-kingdom-cream/10'>
                                <span className='block h-full rounded-full bg-kingdom-gold' style={{ width: `${numeric}%` }} />
                        </span>
                        <span>{Math.round(numeric)}% match</span>
                        {/* TODO: localize label and add iconography */}
                </div>
        );
};

export default MatchScoreBadge;
