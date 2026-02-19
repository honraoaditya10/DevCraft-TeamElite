import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { TopBar } from '../../components/TopBar';

export default function Documents() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen text-slate-900 font-poppins app-shell page-shell bg-slate-50">
      <TopBar
        title="Document Verification"
        subtitle="Document upload is currently disabled"
        showBack
        backTo="/dashboard"
        showLogout
      />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Uploads Removed</h2>
          <p className="mt-2 text-sm text-slate-600">
            The AI extraction workflow has been removed from this project. Document uploads
            are not available at the moment.
          </p>
          <p className="mt-4 text-sm text-slate-600">
            You can still update your profile details manually on the Profile page.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => navigate('/profile')}
              className="px-4 py-2 rounded-lg bg-blue-900 text-white font-medium hover:bg-blue-800 transition"
            >
              Go to Profile
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-900 font-medium hover:bg-slate-50 transition"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
