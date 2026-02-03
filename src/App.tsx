import { useState, useMemo } from 'react';
import { PortfolioProvider } from './context/PortfolioContext';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Portfolio } from './components/Portfolio';
import { Dividends } from './components/Dividends';
import { ImportData } from './components/Import';

function AppContent() {
  const [activeTab, setActiveTab] = useState('home');

  const renderContent = useMemo(() => {
    switch (activeTab) {
      case 'home': return <Dashboard onNavigateToImport={() => setActiveTab('import')} />;
      case 'portfolio': return <Portfolio />;
      case 'dividends': return <Dividends />;
      case 'import': return <ImportData onSuccess={() => setActiveTab('home')} />;
      default: return <Dashboard onNavigateToImport={() => setActiveTab('import')} />;
    }
  }, [activeTab]);

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent}
    </Layout>
  );
}

function App() {
  return (
    <PortfolioProvider>
      <AppContent />
    </PortfolioProvider>
  );
}

export default App;