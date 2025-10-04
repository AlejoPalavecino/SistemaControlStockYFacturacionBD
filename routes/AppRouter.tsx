
import React, { Suspense, lazy, memo } from 'react';
import * as Router from 'react-router-dom';
import { OptimizedLoadingSpinner } from '../components/shared/OptimizedLoadingSpinner.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import MainLayout from '../layouts/MainLayout.tsx';

// Lazy load all page components for code-splitting with prefetch hints
const Dashboard = lazy(() => 
  import(/* webpackChunkName: "dashboard" */ '../pages/Dashboard.tsx')
);
const Stock = lazy(() => 
  import(/* webpackChunkName: "stock" */ '../pages/Stock.tsx')
);
const Facturacion = lazy(() => 
  import(/* webpackChunkName: "facturacion" */ '../pages/Facturacion.tsx')
);
const Clientes = lazy(() => 
  import(/* webpackChunkName: "clientes" */ '../pages/Clientes.tsx')
);
const Proveedores = lazy(() => 
  import(/* webpackChunkName: "proveedores" */ '../pages/Proveedores.tsx')
);
const StockHistory = lazy(() => 
  import(/* webpackChunkName: "stock-history" */ '../pages/StockHistory.tsx')
);
const ClientDetail = lazy(() => 
  import(/* webpackChunkName: "client-detail" */ '../pages/ClientDetail.tsx').then(module => ({ default: module.ClientDetail }))
);
const SupplierDetail = lazy(() => 
  import(/* webpackChunkName: "supplier-detail" */ '../pages/SupplierDetail.tsx').then(module => ({ default: module.SupplierDetail }))
);
const Login = lazy(() => 
  import(/* webpackChunkName: "auth" */ '../pages/Login.tsx')
);
const Register = lazy(() => 
  import(/* webpackChunkName: "auth" */ '../pages/Register.tsx')
);

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = memo(({ children }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return <OptimizedLoadingSpinner />;
  }
  
  if (!currentUser) {
    return <Router.Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
});

ProtectedRoute.displayName = 'ProtectedRoute';

const AppRouter: React.FC = () => {
  return (
    <Router.HashRouter>
      <Suspense fallback={<OptimizedLoadingSpinner />}>
        <Router.Routes>
          <Router.Route path="/login" element={<Login />} />
          <Router.Route path="/register" element={<Register />} />
          
          <Router.Route
            path="/*"
            element={
              <ProtectedRoute>
                <Router.Routes>
                  <Router.Route element={<MainLayout />}>
                    <Router.Route path="/" element={<Dashboard />} />
                    <Router.Route path="/stock" element={<Stock />} />
                    <Router.Route path="/stock/history" element={<StockHistory />} />
                    <Router.Route path="/facturacion" element={<Facturacion />} />
                    <Router.Route path="/clientes" element={<Clientes />} />
                    <Router.Route path="/clientes/:clientId" element={<ClientDetail />} />
                    <Router.Route path="/proveedores" element={<Proveedores />} />
                    <Router.Route path="/proveedores/:supplierId" element={<SupplierDetail />} />
                  </Router.Route>
                </Router.Routes>
              </ProtectedRoute>
            }
          />
        </Router.Routes>
      </Suspense>
    </Router.HashRouter>
  );
};

export default AppRouter;