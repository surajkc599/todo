import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { Toast } from '../components/Toast';

export function LandingPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning'>('error');
  const [showToast, setShowToast] = useState(false);

  // Listen for slow request events
  useEffect(() => {
    const handleSlowRequest = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.endpoint?.includes('/lists') && customEvent.detail?.isSlowRequest) {
        setToastMessage(
          '⏳ Server is starting up (free tier). This might take a few extra seconds. Thanks for your patience!'
        );
        setToastType('warning');
        setShowToast(true);
      }
    };

    window.addEventListener('slowRequest', handleSlowRequest);
    return () => window.removeEventListener('slowRequest', handleSlowRequest);
  }, []);

  const handleCreateList = async () => {
    try {
      setIsLoading(true);
      const response = await api.createList();
      navigate(`/list/${response.id}`);
    } catch (error) {
      const message = `Failed to create list: ${error instanceof Error ? error.message : 'Unknown error'}`;
      setToastMessage(message);
      setToastType('error');
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-12 p-6">
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl font-bold text-slate-900 mb-4">Shared Shopping Lists</h1>
        <p className="text-lg text-slate-600 mb-8">
          Create a list, track expenses, share with family & friends
        </p>

        <button
          onClick={handleCreateList}
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-semibold py-3 px-10 rounded text-base transition-colors disabled:cursor-not-allowed"
        >
          {isLoading ? 'Creating...' : 'Create'}
        </button>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-3 gap-8 max-w-4xl mt-8">
        <div className="text-center">
          <div className="text-5xl mb-4">🔗</div>
          <h3 className="text-base font-semibold text-slate-900 mb-2">Share Instantly</h3>
          <p className="text-sm text-slate-600">Share a link with anyone. No signup needed.</p>
        </div>

        <div className="text-center">
          <div className="text-5xl mb-4">💾</div>
          <h3 className="text-base font-semibold text-slate-900 mb-2">Never Lose Data</h3>
          <p className="text-sm text-slate-600">Everything is saved automatically.</p>
        </div>

        <div className="text-center">
          <div className="text-5xl mb-4">💰</div>
          <h3 className="text-base font-semibold text-slate-900 mb-2">Track Costs</h3>
          <p className="text-sm text-slate-600">Add prices and see your total.</p>
        </div>
      </div>

      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
}
