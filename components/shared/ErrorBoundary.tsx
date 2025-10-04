
import React from 'react';

type Props = { children: React.ReactNode };
type State = { hasError: boolean };

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error in ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div 
          role="alert" 
          className="p-8 my-8 mx-auto max-w-3xl text-center bg-yellow-50 text-yellow-800 border border-yellow-300 rounded-lg"
        >
          <h1 className="text-2xl font-bold mb-2">Algo salió mal.</h1>
          <p className="mt-2 mb-4">
            Ocurrió un error inesperado en la aplicación. Intenta recargar la página.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors font-medium"
          >
            Recargar página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
