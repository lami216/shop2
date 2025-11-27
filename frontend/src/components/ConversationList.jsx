const ConversationList = ({ conversations = [], activeId, onSelect, currentUserId }) => {
        const currentId = currentUserId?.toString?.() || currentUserId;

        const renderTitle = (conversation) => {
                if (conversation.type === "group") {
                        return conversation?.group?.groupName || "Study Group";
                }

                const otherParticipant = (conversation.participants || []).find(
                        (participant) => (participant?._id?.toString?.() || participant?._id) !== currentId
                );

                return otherParticipant?.name || "Private Chat";
        };

        const renderSubtitle = (conversation) => {
                if (conversation.type === "group") return "Group";
                return "Private";
        };

        return (
                <div className='space-y-2'>
                        {conversations.map((conversation) => {
                                const title = renderTitle(conversation);
                                const subtitle = renderSubtitle(conversation);
                                const lastMessage = conversation.lastMessage?.content || "No messages yet";
                                const isActive = activeId === conversation._id;

                                return (
                                        <button
                                                key={conversation._id}
                                                onClick={() => onSelect?.(conversation._id)}
                                                className={`w-full rounded-xl border border-kingdom-gold/10 bg-black/30 p-4 text-left transition hover:border-kingdom-gold/40 ${
                                                        isActive ? "border-kingdom-gold/70 bg-kingdom-purple/50" : ""
                                                }`}
                                        >
                                                <div className='flex items-center justify-between gap-2'>
                                                        <div>
                                                                <p className='text-sm uppercase tracking-wide text-kingdom-ivory/60'>
                                                                        {subtitle}
                                                                </p>
                                                                <h3 className='text-lg font-semibold text-kingdom-ivory'>{title}</h3>
                                                                <p className='mt-1 line-clamp-1 text-sm text-kingdom-ivory/70'>
                                                                        {lastMessage}
                                                                </p>
                                                        </div>
                                                        <div className='h-10 w-10 rounded-full bg-kingdom-purple/40 text-center text-kingdom-gold'>
                                                                {/* TODO: replace placeholder avatars with profile images */}
                                                                <span className='flex h-full w-full items-center justify-center font-semibold'>
                                                                        {title?.[0] || "M"}
                                                                </span>
                                                        </div>
                                                </div>
                                        </button>
                                );
                        })}
                </div>
        );
};

export default ConversationList;
