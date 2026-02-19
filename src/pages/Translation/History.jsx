import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { TopBar } from '../../components/TopBar';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';

const TimelineItem = ({ title, detail, time }) => (
  <div className="relative pl-6 py-3 border-b border-slate-100 last:border-b-0 transition-colors hover:bg-slate-50/60">
    <div className="absolute left-0 top-5 h-2 w-2 rounded-full bg-blue-900 shadow-sm" />
    <p className="text-sm font-medium text-slate-800">{title}</p>
    <p className="text-xs text-slate-500">{detail}</p>
    <p className="text-xs text-slate-400 mt-1">{time}</p>
  </div>
);

export default function History() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [timeline, setTimeline] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        setLoadError('');
        const response = await fetch(
          `${API_BASE_URL}/api/dashboard?email=${encodeURIComponent(user.email)}`
        );
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Failed to load history');
        }
        setTimeline(data.timeline || []);
      } catch (error) {
        setLoadError(error.message || 'Failed to load history');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [user, navigate]);


  return (
    <div className="min-h-screen text-slate-900 font-poppins app-shell page-shell">
      <TopBar
        title={t('historyTitle')}
        subtitle={t('historySubtitle')}
        showBack
        backTo="/dashboard"
        showLogout
      />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {loadError && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {loadError}
          </div>
        )}

        <section className="mt-6 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">{t('recentActivity')}</h2>
            <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded-full">
              {timeline.length}
            </span>
          </div>

          {isLoading ? (
            <p className="mt-4 text-sm text-slate-500">{t('loadingSchemes')}</p>
          ) : timeline.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">
              {t('noHistory')}
            </div>
          ) : (
            <div className="mt-4 space-y-2">
              {timeline.map((item) => (
                <TimelineItem key={item.id} title={item.title} detail={item.detail} time={item.time} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
