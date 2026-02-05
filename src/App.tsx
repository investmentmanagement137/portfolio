import { useState, useMemo, useEffect } from 'react';
import { PortfolioProvider } from './context/PortfolioContext';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Portfolio } from './components/Portfolio';
import { Dividends } from './components/Dividends';
import { Settings } from './components/Settings';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';



function AppContent() {
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('activeTab') || 'home';
  });
  const [settingsSection, setSettingsSection] = useState<any>(null);

  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
    window.history.replaceState(null, '', `?tab=${activeTab}`);
    // Reset section when changing tabs to avoid sticking to a sub-page
    if (activeTab !== 'settings') {
      setSettingsSection(null);
    }
  }, [activeTab]);

  const renderContent = useMemo(() => {
    switch (activeTab) {
      case 'home': return (
        <Dashboard
          onNavigateToImport={() => {
            setSettingsSection('data');
            setActiveTab('settings');
          }}
        />
      );
      case 'portfolio': return <Portfolio />;
      case 'dividends': return <Dividends />;
      case 'settings': return (
        <Settings
          defaultSection={settingsSection}
          onImportSuccess={() => setActiveTab('home')}
          onNavigateToTimeline={() => setActiveTab('timeline')}
        />
      );
      default: return (
        <Dashboard
          onNavigateToImport={() => {
            setSettingsSection('data');
            setActiveTab('settings');
          }}
        />
      );
    }
  }, [activeTab, settingsSection]);

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent}
    </Layout>
  );
}

import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <PortfolioProvider>
        <AppContent />
        <PWAInstallPrompt />
      </PortfolioProvider>
    </ThemeProvider>
  );
}

export default App;