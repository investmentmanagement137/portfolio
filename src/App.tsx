import { useState, useMemo } from 'react';
import { PortfolioProvider } from './context/PortfolioContext';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Portfolio } from './components/Portfolio';
import { Dividends } from './components/Dividends';
import { Settings } from './components/Settings';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';

function AppContent() {
  const [activeTab, setActiveTab] = useState('home');

  const renderContent = useMemo(() => {
    switch (activeTab) {
      case 'home': return <Dashboard onNavigateToImport={() => setActiveTab('settings')} />;
      case 'portfolio': return <Portfolio />;
      case 'dividends': return <Dividends />;
      case 'settings': return <Settings onImportSuccess={() => setActiveTab('home')} />;
      default: return <Dashboard onNavigateToImport={() => setActiveTab('settings')} />;
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
      <PWAInstallPrompt />
    </PortfolioProvider>
  );
}

export default App;