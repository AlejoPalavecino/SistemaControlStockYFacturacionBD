import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';

interface BackButtonProps {
  to?: string;
  className?: string;
  children?: React.ReactNode;
  onClick?: () => void;
}

const BackIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    className="h-5 w-5" 
    fill="none" 
    viewBox="0 0 24 24" 
    stroke="currentColor" 
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);

export const BackButton: React.FC<BackButtonProps> = memo(({ 
  to, 
  className = '', 
  children = 'Volver', 
  onClick 
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (to) {
      navigate(to);
    } else {
      navigate(-1); // Volver a la página anterior
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`
        inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 
        bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:text-slate-700
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
        transition-all duration-200 ease-in-out
        ${className}
      `}
      type="button"
    >
      <BackIcon />
      {children}
    </button>
  );
});

BackButton.displayName = 'BackButton';

export default BackButton;