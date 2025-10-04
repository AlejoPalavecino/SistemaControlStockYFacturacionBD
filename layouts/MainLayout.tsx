import React from 'react';
import * as Router from 'react-router-dom';
import Header from '../components/shared/Header.tsx';

const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main>
        {/* The Outlet will render the matched child route component */}
        <Router.Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
