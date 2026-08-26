import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { LandingPage } from './pages/LandingPage';
import { ListPage } from './pages/ListPage';
import { SyncIndicator } from './components/SyncIndicator';
import { syncEngine } from './utils/syncEngine';
import './styles/globals.css';

function AppContent() {
  useEffect(() => {
    // Sync when online
    if (navigator.onLine) {
      syncEngine.syncAll();
    }
  }, []);

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/list/:id" element={<ListPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <SyncIndicator />
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
