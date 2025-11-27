const ErrorBox = ({ message, onRetry }) => {
        if (!message) return null;

        return (
                <div className='flex flex-col gap-3 rounded-xl border border-red-500/40 bg-red-900/30 p-4 text-sm text-red-100 shadow-royal-soft'>
                        <div className='flex items-center gap-2'>
                                <span className='inline-block h-2 w-2 rounded-full bg-red-400' />
                                <p className='font-semibold'>
                                        {message}
                                </p>
                        </div>
                        {onRetry && (
                                <button
                                        type='button'
                                        onClick={onRetry}
                                        className='self-start rounded-lg border border-red-400/60 px-3 py-1 text-xs font-semibold text-red-50 transition hover:border-red-200 hover:text-white'
                                >
                                        Retry
                                </button>
                        )}
                        {/* TODO: add dismissible alert and i18n-driven copy */}
                </div>
        );
};

export default ErrorBox;
