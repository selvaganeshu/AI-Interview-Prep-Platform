const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'h-5 w-5 border-2',
    md: 'h-8 w-8 border-[3px]',
    lg: 'h-12 w-12 border-4',
  };

  const spinnerSizeClass = sizeClasses[size] ?? sizeClasses.md;

  return (
    <span
      className={`inline-flex items-center justify-center ${className}`}
      role="status"
      aria-label="Loading"
    >
      <span
        className={`
          ${spinnerSizeClass}
          rounded-full
          border-solid
          border-indigo-500/90
          border-t-transparent
          will-change-transform
          motion-safe:animate-[spin_0.9s_linear_infinite]
          transform-gpu
        `}
        aria-hidden="true"
      />
    </span>
  );
};

export default LoadingSpinner;
