import React from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from "firebase/auth";
import { useAuth } from '../../context/AuthContext.tsx';
import { auth } from '../../services/firebaseConfig.ts';
import Logo from '../Logo.tsx';

const Header: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <Logo />
          </div>
          <div className="flex items-center">
            {currentUser && (
              <>
                <span className="hidden sm:inline-block text-sm text-slate-600 mr-4">
                  {currentUser.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-slate-100 text-slate-700 font-semibold text-sm py-2 px-4 rounded-lg hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 transition-colors"
                >
                  Cerrar Sesión
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
