import React, { useState } from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ 
  className = "", 
  size = 'md',
  showText = true 
}) => {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    sm: 'h-8 w-auto',
    md: 'h-12 w-auto', 
    lg: 'h-16 w-auto',
    xl: 'h-20 w-auto'
  };

  const handleImageError = () => {
    setImageError(true);
  };

  // Fallback SVG component
  const SVGLogo = () => (
    <svg 
      viewBox="0 0 200 48" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={`${sizeClasses[size]} ${className}`}
      aria-label="Clip Librería Logo"
    >
      {/* Icon Part */}
      <g transform="translate(4, 4)">
        {/* Main shape 'C' */}
        <path d="M20 40 C8.95 40 0 31.05 0 20 C0 8.95 8.95 0 20 0 C31.05 0 40 8.95 40 20" 
              fill="#2563EB" stroke="#2563EB" strokeWidth="2"/>
        {/* Inner accent */}
        <circle cx="20" cy="20" r="8" fill="#60A5FA"/>
      </g>
      
      {/* Text Part */}
      {showText && (
        <text x="56" y="32" fontFamily="Inter, sans-serif" fontSize="28" fontWeight="bold" fill="#1E293B">
          Clip
        </text>
      )}
    </svg>
  );

  // Si hay error en la imagen o no está disponible, usar SVG
  if (imageError) {
    return <SVGLogo />;
  }

  return (
    <div className={`flex items-center ${className}`}>
      <img 
        src="/assets/Logo.jpg" 
        alt="Clip Librería Logo"
        className={`${sizeClasses[size]} object-contain`}
        onError={handleImageError}
        loading="eager"
      />
    </div>
  );
};

export default Logo;