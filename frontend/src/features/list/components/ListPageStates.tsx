import { useNavigate } from 'react-router-dom';

export function LoadingState() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-slate-500 text-base">Loading...</div>
    </div>
  );
}

export function NotFoundState() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-slate-700 font-semibold text-lg mb-6">List not found</p>
        <button
          onClick={() => navigate('/')}
          className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition-colors font-medium"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}
