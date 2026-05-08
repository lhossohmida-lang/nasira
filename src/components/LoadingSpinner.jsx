export default function LoadingSpinner({ size = 'md', text = '' }) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <div className="relative">
        <div className={`${sizeClasses[size]} animate-spin`}>
          <svg className="w-full h-full" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-10" cx="12" cy="12" r="10" stroke="url(#spinnerGradient)" strokeWidth="3" />
            <path className="opacity-90" fill="none" stroke="url(#spinnerGradient)" strokeWidth="3" strokeLinecap="round"
              d="M12 2a10 10 0 0 1 10 10" />
            <defs>
              <linearGradient id="spinnerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        {/* Glow effect */}
        <div className={`absolute inset-0 ${sizeClasses[size]} bg-primary-500/20 rounded-full blur-lg`}></div>
      </div>
      {text && <p className="text-dark-400 text-sm font-medium animate-pulse">{text}</p>}
    </div>
  );
}
