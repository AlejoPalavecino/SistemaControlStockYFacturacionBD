
import React, { useState, memo, useCallback } from 'react';
import AppRouter from './routes/AppRouter.tsx';
import { QuickSaleButton } from './components/quick-sale/QuickSaleButton.tsx';
import { QuickSaleModal } from './components/quick-sale/QuickSaleModal.tsx';
import { ErrorBoundary } from './components/shared/ErrorBoundary.tsx';
import { AuthProvider } from './context/AuthContext.tsx';

const App: React.FC = memo(() => {
  const [isQuickSaleOpen, setQuickSaleOpen] = useState(false);

  const handleQuickSaleOpen = useCallback(() => {
    setQuickSaleOpen(true);
  }, []);

  const handleQuickSaleClose = useCallback(() => {
    setQuickSaleOpen(false);
  }, []);

  return (
    <div className="antialiased text-slate-800">
      <ErrorBoundary>
        <AuthProvider>
          <AppRouter />
          <QuickSaleButton onClick={handleQuickSaleOpen} />
          <QuickSaleModal isOpen={isQuickSaleOpen} onClose={handleQuickSaleClose} />
        </AuthProvider>
      </ErrorBoundary>
    </div>
  );
});

App.displayName = 'App';

export default App;