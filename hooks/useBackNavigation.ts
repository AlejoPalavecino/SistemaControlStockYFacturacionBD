import { useLocation } from 'react-router-dom';

/**
 * Hook que determina la ruta de retorno apropiada basada en la ubicación actual
 */
export const useBackNavigation = () => {
  const location = useLocation();
  
  const getBackRoute = (): string => {
    const currentPath = location.pathname;
    
    // Páginas de detalle van a su lista correspondiente
    if (currentPath.startsWith('/clientes/') && currentPath !== '/clientes') {
      return '/clientes';
    }
    
    if (currentPath.startsWith('/proveedores/') && currentPath !== '/proveedores') {
      return '/proveedores';
    }
    
    // Stock history va a stock
    if (currentPath === '/stock/history') {
      return '/stock';
    }
    
    // Todas las secciones principales van al dashboard
    if (['/stock', '/facturacion', '/clientes', '/proveedores'].includes(currentPath)) {
      return '/';
    }
    
    // Por defecto, va al dashboard
    return '/';
  };
  
  const getBackButtonText = (): string => {
    const currentPath = location.pathname;
    
    if (currentPath.startsWith('/clientes/') && currentPath !== '/clientes') {
      return 'Volver a Clientes';
    }
    
    if (currentPath.startsWith('/proveedores/') && currentPath !== '/proveedores') {
      return 'Volver a Proveedores';
    }
    
    if (currentPath === '/stock/history') {
      return 'Volver a Stock';
    }
    
    if (['/stock', '/facturacion', '/clientes', '/proveedores'].includes(currentPath)) {
      return 'Volver al Dashboard';
    }
    
    return 'Volver';
  };
  
  return {
    backRoute: getBackRoute(),
    backButtonText: getBackButtonText(),
    currentPath: location.pathname
  };
};