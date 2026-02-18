import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { TopBar } from '../../components/TopBar';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const SchemeCard = ({ name, description, deadline, statusLabel, statusTone, viewLabel, deadlineLabel }) => (
  <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100 flex flex-col transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-blue-100">
    <div className="flex items-center justify-between">
      <h3 className="text-base font-semibold text-slate-900">{name}</h3>
      <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusTone}`}>{statusLabel}</span>
    </div>
    <p className="text-sm text-slate-600 mt-3">{description}</p>
    <div className="flex items-center justify-between mt-4">
      <span className="text-xs text-slate-500">{deadlineLabel}: {deadline}</span>
      <button className="text-sm font-medium text-white bg-blue-900 px-4 py-2 rounded-lg hover:bg-blue-800 transition">
        {viewLabel}
      </button>
    </div>
  </div>
);

export default function MySchemes() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchSchemes = async () => {
      try {
        setIsLoading(true);
        setLoadError('');
        const response = await fetch(
          `${API_BASE_URL}/api/dashboard?email=${encodeURIComponent(user.email)}`
        );
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Failed to load schemes');
        }
        setDashboardData(data);
      } catch (error) {
        setLoadError(error.message || 'Failed to load schemes');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchemes();
  }, [user, navigate]);

  const eligibleSchemes = dashboardData?.eligibleSchemes || [];
  const attention = dashboardData?.attention || [];

  const allSchemes = useMemo(() => {
    const attentionMapped = attention.map((item) => ({
      id: item.id,
      name: item.schemeName || 'Scheme',
      description: item.message,
      deadline: 'Action needed'
    }));
    return [...eligibleSchemes, ...attentionMapped];
  }, [eligibleSchemes, attention]);


  return (
    <div className="min-h-screen text-slate-900 font-poppins app-shell page-shell">
      <TopBar
        title={t('mySchemesTitle')}
        subtitle={t('schemeEligibility')}
        showBack
        backTo="/dashboard"
        showLogout
      />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {loadError && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {loadError}
          </div>
        )}

        <section className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">{t('mySchemesTitle')}</h2>
            <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">
              {eligibleSchemes.length} {t('eligibleSchemes')}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {isLoading ? (
              <div className="col-span-full rounded-2xl bg-white border border-slate-100 p-6 text-sm text-slate-500">
                {t('loadingSchemes')}
              </div>
            ) : eligibleSchemes.length === 0 ? (
              <div className="col-span-full rounded-2xl bg-white border border-slate-100 p-6 text-sm text-slate-500">
                {t('noSchemes')}
              </div>
            ) : (
              eligibleSchemes.map((scheme) => (
                <SchemeCard
                  key={scheme.id}
                  name={scheme.name}
                  description={scheme.description}
                  deadline={scheme.deadline}
                  statusLabel={t('statusEligible')}
                  statusTone="bg-emerald-50 text-emerald-700"
                  viewLabel={t('viewDetails')}
                  deadlineLabel={t('deadline')}
                />
              ))
            )}
          </div>
        </section>

        <section className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">{t('allSchemesTitle')}</h2>
            <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded-full">
              {allSchemes.length} {t('mySchemes')}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {isLoading ? (
              <div className="col-span-full rounded-2xl bg-white border border-slate-100 p-6 text-sm text-slate-500">
                {t('loadingSchemes')}
              </div>
            ) : allSchemes.length === 0 ? (
              <div className="col-span-full rounded-2xl bg-white border border-slate-100 p-6 text-sm text-slate-500">
                {t('noSchemes')}
              </div>
            ) : (
              allSchemes.map((scheme) => (
                <SchemeCard
                  key={scheme.id}
                  name={scheme.name}
                  description={scheme.description}
                  deadline={scheme.deadline}
                  statusLabel={t('needsAttention')}
                  statusTone="bg-amber-50 text-amber-700"
                  viewLabel={t('viewDetails')}
                  deadlineLabel={t('deadline')}
                />
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
