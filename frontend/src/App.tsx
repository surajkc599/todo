import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Landing } from './features/landing';
import { List } from './features/list';
import { SyncIndicator } from './shared/ui/SyncIndicator';
import { syncEngine } from './shared/services/offline/syncEngine';
import './shared/styles/globals.css';

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
        <Route path="/" element={<Landing />} />
        <Route path="/list/:id" element={<List />} />
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
