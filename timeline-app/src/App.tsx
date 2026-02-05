import { PortfolioProvider, usePortfolio } from './context/PortfolioContext';
import { Timeline } from './components/Timeline';

function AppContent() {
  const { state } = usePortfolio();

  if (state.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
          <p className="opacity-60 font-mono text-sm">Loading Portfolio...</p>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center max-w-sm text-center p-6 border rounded-xl">
          <p className="text-red-500 mb-2 font-bold">Error Loading Data</p>
          <p className="opacity-60 text-sm mb-4">{state.error}</p>
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm">Retry</button>
        </div>
      </div>
    );
  }

  return <Timeline />;
}

function App() {
  return (
    <PortfolioProvider>
      <AppContent />
    </PortfolioProvider>
  );
}

export default App;
