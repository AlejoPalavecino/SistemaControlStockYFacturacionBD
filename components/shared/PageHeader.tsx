import React, { memo } from 'react';
import { BackButton } from './BackButton';
import { useBackNavigation } from '../../hooks/useBackNavigation';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  backTo?: string;
  backButtonText?: string;
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = memo(({
  title,
  subtitle,
  showBackButton = true,
  backTo,
  backButtonText,
  actions,
  className = ''
}) => {
  const { backRoute, backButtonText: defaultBackText } = useBackNavigation();
  
  const finalBackRoute = backTo || backRoute;
  const finalBackText = backButtonText || defaultBackText;

  return (
    <div className={`mb-6 ${className}`}>
      {showBackButton && (
        <div className="mb-4">
          <BackButton to={finalBackRoute}>
            {finalBackText}
          </BackButton>
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-sm text-slate-600">
              {subtitle}
            </p>
          )}
        </div>
        
        {actions && (
          <div className="flex flex-wrap gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
});

PageHeader.displayName = 'PageHeader';

export default PageHeader;