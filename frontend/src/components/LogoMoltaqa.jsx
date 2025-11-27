const LogoMoltaqa = ({ className = "h-10 w-10" }) => {
        return (
                <span className='inline-flex items-center gap-3 text-kingdom-gold'>
                        <span className={`inline-flex items-center justify-center rounded-full border border-current/40 bg-kingdom-purple/40 p-2 ${className}`}>
                                <svg
                                        xmlns='http://www.w3.org/2000/svg'
                                        viewBox='0 0 64 64'
                                        className='h-full w-full'
                                        fill='none'
                                        stroke='currentColor'
                                        strokeWidth='1.8'
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                >
                                        <circle cx='32' cy='32' r='18' opacity='0.7' />
                                        <path d='M16 32h32' opacity='0.65' />
                                        <path d='M24 22l8 10 8-10' opacity='0.9' />
                                        <path d='M24 42l8-10 8 10' opacity='0.9' />
                                </svg>
                        </span>
                        <span className='text-lg font-semibold tracking-[0.16em] text-kingdom-ivory'>ملتقى Moltaqa</span>
                </span>
        );
};

export default LogoMoltaqa;
