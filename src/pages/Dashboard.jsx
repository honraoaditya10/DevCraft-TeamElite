import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { TopBar } from '../components/TopBar';

const QuickStatCard = ({ title, value, helper, icon }) => (
  <div className="rounded-2xl surface-card p-6 sm:p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer group">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-xs sm:text-sm text-slate-900 dark:text-slate-400 font-medium uppercase tracking-wider">{title}</p>
        <div className="mt-3 flex items-baseline gap-2">
          <p className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">{value}</p>
        </div>
        <p className="text-xs text-slate-800 dark:text-slate-400 mt-2 group-hover:text-slate-900 dark:group-hover:text-slate-300 transition">{helper}</p>
      </div>
      <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-gradient-to-br from-blue-50 dark:from-blue-900 to-blue-100 dark:to-blue-800 text-blue-900 dark:text-blue-200 flex items-center justify-center text-lg sm:text-2xl font-semibold flex-shrink-0 group-hover:shadow-lg transition-all">
        {icon}
      </div>
    </div>
  </div>
);

const SchemeCard = ({ id, name, description, deadline, statusLabel, viewLabel, deadlineLabel, onViewDetails }) => (
  <div className="rounded-2xl surface-card p-6 sm:p-7 flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group cursor-pointer h-full">
    <div className="flex items-start justify-between gap-3 mb-4">
      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-900 dark:group-hover:text-blue-300 transition flex-1 line-clamp-2">{name}</h3>
      <span className="text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 px-3 py-1 rounded-full flex-shrink-0 whitespace-nowrap">
        {statusLabel}
      </span>
    </div>
    <p className="text-sm text-slate-700 dark:text-slate-300 mt-2 line-clamp-2 flex-grow">{description}</p>
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-5 gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
      <span className="text-xs text-slate-900 dark:text-slate-400 font-medium">{deadlineLabel}: <span className="font-semibold text-slate-900 dark:text-slate-200">{deadline}</span></span>
      <button
        onClick={() => onViewDetails(id)}
        className="w-full sm:w-auto text-sm font-bold text-white bg-gradient-to-r from-blue-900 to-blue-800 px-5 py-2.5 rounded-xl hover:shadow-lg transition-all duration-200 active:scale-95"
      >
        {viewLabel} →
      </button>
    </div>
  </div>
);

const DocumentStatusRow = ({ label, status, tone }) => (
  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 py-3 last:border-b-0 transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-700/50">
    <span className="text-sm text-slate-900 dark:text-white">{label}</span>
    <span className={`text-xs font-medium px-2 py-1 rounded-full ${tone}`}>{status}</span>
  </div>
);

const TimelineItem = ({ title, detail, time }) => (
  <div className="relative pl-6">
    <div className="absolute left-0 top-1.5 h-2 w-2 rounded-full bg-blue-900 shadow-sm" />
    <p className="text-sm font-medium text-slate-900 dark:text-white">{title}</p>
    <p className="text-xs text-slate-700 dark:text-slate-300">{detail}</p>
    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{time}</p>
  </div>
);

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [localDocuments, setLocalDocuments] = useState({ income: null, caste: null });
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';

  const userName = user?.fullName || user?.name || 'User';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleViewSchemeDetails = (schemeId) => {
    navigate(`/scheme/${schemeId}`);
  };

  const handleNavClick = (item) => {
    if (item === 'Logout') {
      handleLogout();
      return;
    }
    if (item === 'Profile') {
      navigate('/profile');
      return;
    }
    if (item === 'My Schemes') {
      navigate('/my-schemes');
      return;
    }
    if (item === 'Documents') {
      navigate('/documents');
      return;
    }
    if (item === 'History') {
      navigate('/history');
      return;
    }
    if (item === 'Help & Support') {
      navigate('/help-support');
      return;
    }
    if (item === 'Dashboard') {
      navigate('/dashboard');
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchDashboard = async () => {
      try {
        setIsLoading(true);
        setLoadError('');
        const response = await fetch(
          `${API_BASE_URL}/api/dashboard?email=${encodeURIComponent(user.email)}`
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to load dashboard');
        }

        setDashboardData(data);
      } catch (error) {
        setLoadError(error.message || 'Failed to load dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, [user, navigate, API_BASE_URL]);

  useEffect(() => {
    if (!user) return;
    const saved = localStorage.getItem('userDocuments');
    if (saved) {
      const data = JSON.parse(saved);
      setLocalDocuments({
        income: data.income || null,
        caste: data.caste || null
      });
    }
  }, [user]);

  useEffect(() => {
    setChatMessages([{ id: 1, role: 'bot', text: t('chatGreeting') }]);
  }, [language, t]);

  const stats = dashboardData?.stats;
  const schemes = dashboardData?.eligibleSchemes || [];
  const attentionItems = dashboardData?.attention || [];
  const documents = dashboardData?.documents || [];
  const nextSteps = dashboardData?.nextSteps || [];
  const banner = dashboardData?.banner;
  const timeline = dashboardData?.timeline || [];
  const profileCompletion = stats?.profileCompletion ?? 0;

  const requiredDocs = [
    { key: 'income', label: t('incomeCertificate') },
    { key: 'caste', label: t('casteCertificate') }
  ];
  const missingDocs = requiredDocs.filter((doc) => !localDocuments[doc.key]);
  const englishPdfCount = Object.values(localDocuments).filter((doc) =>
    doc?.fileName?.toLowerCase().endsWith('.pdf')
  ).length;

  const todoItems = [];
  if (!localDocuments.income) todoItems.push(t('todoUploadIncome'));
  if (!localDocuments.caste) todoItems.push(t('todoUploadCaste'));
  if (profileCompletion < 100) todoItems.push(t('todoVerifyProfile'));
  if ((stats?.upcomingDeadlines ?? 0) > 0) todoItems.push(t('todoCheckDeadline'));
  if (todoItems.length === 0) todoItems.push(t('todoAllSet'));

  const getBotReply = (message) => {
    const text = message.toLowerCase();
    if (text.includes('document') || text.includes('doc') || text.includes('upload')) {
      return t('chatHelpMissingDocs');
    }
    if (text.includes('profile') || text.includes('details')) {
      return t('chatHelpProfile');
    }
    if (text.includes('scheme') || text.includes('eligibility')) {
      return t('chatHelpSchemes');
    }
    return t('chatFallback');
  };

  const handleSendMessage = async () => {
    const trimmed = chatInput.trim();
    if (!trimmed) return;
    const userMessage = { id: Date.now(), role: 'user', text: trimmed };
    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput('');
    setChatLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/chatbot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed })
      });
      const data = await response.json();
      const reply = response.ok ? data.reply : getBotReply(trimmed);
      setChatMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: 'bot', text: reply }
      ]);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: 'bot', text: getBotReply(trimmed) }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-slate-900 font-poppins app-shell page-shell">
      <TopBar
        title={t('dashboard')}
        subtitle={`${t('welcomeBack')} ${userName}`}
        showMenu
        onMenuClick={() => setSidebarOpen(true)}
      />

      <div className="lg:flex lg:min-h-screen">
        <aside
            className={`fixed inset-y-0 left-0 z-40 w-64 rounded-3xl bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 p-6 flex flex-col gap-8 transform transition-transform duration-200 lg:translate-x-0 lg:static lg:transform-none lg:h-screen lg:sticky lg:top-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-blue-900 text-white flex items-center justify-center text-sm font-semibold">
            DA
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-white">{t('appName')}</p>
            <p className="text-xs text-slate-900 dark:text-slate-400">{t('govTechAssistant')}</p>
          </div>
        </div>

        <nav className="flex flex-col gap-2 text-sm">
          {[
            'Dashboard',
            'My Schemes',
            'Documents',
            'Profile',
            'History',
            'Help & Support',
            'Logout'
          ].map((item, index) => (
            <button
              key={item}
              onClick={() => handleNavClick(item)}
              className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 hover:-translate-y-0.5 ${
                index === 0
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-900 dark:text-blue-300 font-semibold'
                  : 'text-slate-900 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              {item === 'Dashboard'
                ? t('dashboard')
                : item === 'My Schemes'
                ? t('mySchemes')
                : item === 'Documents'
                ? t('documents')
                : item === 'Profile'
                ? t('profile')
                : item === 'History'
                ? t('history')
                : item === 'Help & Support'
                ? t('helpSupport')
                : t('logout')}
            </button>
          ))}
        </nav>
        </aside>

        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/20 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main className="flex-1">
          <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 pb-10">
          <header className="surface-card rounded-3xl p-6 sm:p-8 flex flex-col gap-6 lg:gap-8 lg:flex-row lg:items-center lg:justify-between shadow-lg border border-slate-100/50">
            <div className="flex-1">
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium uppercase tracking-widest">{t('welcomeBack')}</p>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-blue-500 mt-2">{userName}</h1>
              <p className="text-sm text-slate-700 dark:text-slate-200 mt-3 max-w-lg">{t('govTechAssistant')}</p>
            </div>
            <div className="w-full lg:w-80">
              <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 font-semibold mb-3">
                <span className="uppercase tracking-wider">{t('profileCompletion')}</span>
                <span className="text-sm lg:text-base font-bold text-slate-900 dark:text-emerald-400">{stats?.profileCompletion ?? 0}%</span>
              </div>
              <div className="h-3 rounded-full bg-slate-200/50 dark:bg-slate-700/50 overflow-hidden shadow-inner">
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-lg transition-all duration-500"
                  style={{ width: `${stats?.profileCompletion ?? 0}%` }}
                />
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-400 mt-3">{100 - (stats?.profileCompletion ?? 0)}% remaining to complete</p>
            </div>
            <div className="flex items-center gap-3 lg:flex-col">
              <button className="h-12 w-12 rounded-xl border border-slate-200 dark:border-slate-600 flex items-center justify-center transition hover:border-blue-900 dark:hover:border-blue-400 hover:text-blue-900 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 text-lg font-bold text-slate-900 dark:text-slate-300">
                <span>!</span>
              </button>
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 transition hover:border-blue-900 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 active:scale-95"
                >
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-900 to-blue-700 text-white flex items-center justify-center text-sm font-bold shadow-md">
                    {userName[0]?.toUpperCase()}
                  </div>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white hidden lg:inline">{t('account')}</span>
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-3 w-48 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl z-50 overflow-hidden">
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        navigate('/profile');
                      }}
                      className="block w-full text-left px-5 py-3 text-sm font-medium hover:bg-blue-50 dark:hover:bg-slate-700 transition text-slate-900 dark:text-white"
                    >
                      {t('profile')}
                    </button>
                    <button className="block w-full text-left px-5 py-3 text-sm font-medium hover:bg-blue-50 dark:hover:bg-slate-700 transition text-slate-900 dark:text-white">
                      {t('settings')}
                    </button>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-5 py-3 text-sm font-bold text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950 transition"
                    >
                      {t('logout')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          <section className="mt-8 lg:mt-10">
            {loadError && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50/80 px-5 py-4 text-sm text-red-700 font-medium">
                {loadError}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              <QuickStatCard
                title={t('eligibleSchemes')}
                value={stats?.eligibleSchemes ?? 0}
                helper={t('matchingNow')}
                icon="✓"
              />
              <QuickStatCard
                title={t('needsAttention')}
                value={stats?.needsAttention ?? 0}
                helper={t('documentsMissing')}
                icon="!"
              />
              <QuickStatCard
                title={t('upcomingDeadlines')}
                value={stats?.upcomingDeadlines ?? 0}
                helper={t('dueThisWeek')}
                icon="📅"
              />
              <QuickStatCard
                title={t('profileCompletion')}
                value={`${stats?.profileCompletion ?? 0}%`}
                helper={t('almostThere')}
                icon="👤"
              />
            </div>
          </section>

          <section className="mt-8 lg:mt-10">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{t('schemeEligibility')}</h2>
                <p className="text-sm text-slate-900 dark:text-slate-400 mt-2">{schemes.length} {schemes.length === 1 ? 'scheme' : 'schemes'} available for you</p>
              </div>
              <button className="text-sm font-bold text-slate-900 dark:text-white hover:text-blue-900 dark:hover:text-blue-300 transition whitespace-nowrap">{t('viewAll')} →</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
              {isLoading ? (
                <div className="col-span-full rounded-2xl surface-card p-8 text-center">
                  <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">{t('loadingSchemes')}</p>
                  <div className="mt-4 inline-flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-900 dark:bg-blue-400 animate-pulse"></div>
                    <div className="h-2 w-2 rounded-full bg-blue-900 dark:bg-blue-400 animate-pulse animation-delay-200"></div>
                    <div className="h-2 w-2 rounded-full bg-blue-900 dark:bg-blue-400 animate-pulse animation-delay-400"></div>
                  </div>
                </div>
              ) : schemes.length > 0 ? (
                schemes.map((scheme) => (
                  <SchemeCard
                    key={scheme.id}
                    id={scheme.id}
                    name={scheme.name}
                    description={scheme.description}
                    deadline={scheme.deadline}
                    statusLabel={t('statusEligible')}
                    viewLabel={t('viewDetails')}
                    deadlineLabel={t('deadline')}
                    onViewDetails={handleViewSchemeDetails}
                  />
                ))
              ) : (
                <div className="col-span-full rounded-2xl surface-card p-8 text-center">
                  <p className="text-sm text-slate-700 dark:text-slate-300">{t('noSchemesAvailable')}</p>
                </div>
              )}
            </div>
          </section>

          <section className="mt-8 lg:mt-10">
            <div className="rounded-3xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-6 sm:p-8 shadow-lg">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1">
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">⚡ {t('actionNeeded')}</h3>
                  <p className="text-sm text-slate-700 dark:text-slate-300 mt-2 max-w-lg">
                    {attentionItems[0]?.message || t('noPendingActions')}
                  </p>
                </div>
                <button className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-sm font-bold hover:shadow-lg transition-all duration-200 active:scale-95 whitespace-nowrap">
                  {t('uploadDocument')} →
                </button>
              </div>
            </div>
          </section>

          <section className="mt-8 lg:mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Document Status Card */}
            <div className="rounded-3xl surface-card p-6 sm:p-8 shadow-lg border border-slate-100/50">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">📄 {t('documentStatus')}</h3>
                  <p className="text-xs sm:text-sm text-slate-900 dark:text-slate-400 mt-1">{documents.length} documents required</p>
                </div>
                <button
                  onClick={() => navigate('/documents')}
                  className="px-4 py-2 text-xs sm:text-sm font-bold text-slate-900 dark:text-white bg-blue-50 dark:bg-blue-950 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900 transition whitespace-nowrap"
                >
                  {t('manageDocuments')} →
                </button>
              </div>
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-600/50 transition">
                    <span className="text-sm sm:text-base font-medium text-slate-800 dark:text-slate-200">{doc.label}</span>
                    <span className={`text-xs sm:text-sm font-bold px-3 sm:px-4 py-1.5 rounded-full whitespace-nowrap ${
                      doc.status === 'missing'
                        ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300'
                        : 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300'
                    }`}>
                      {doc.status === 'missing'
                        ? t('statusMissing')
                        : doc.status === 'verified'
                        ? t('statusVerified')
                        : t('statusUploaded')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* To-Do List Card */}
            <div className="rounded-3xl surface-card p-6 sm:p-8 shadow-lg border border-slate-100/50">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">✅ {t('todoListTitle')}</h3>
                <p className="text-xs sm:text-sm text-slate-900 dark:text-slate-400 mt-1">{todoItems.length} items</p>
              </div>
              <ul className="mt-6 space-y-3">
                {todoItems.map((item, index) => (
                  <li key={`${item}-${index}`} className="flex items-start gap-3 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-blue-50/50 dark:from-blue-950/30 to-blue-50 dark:to-blue-950/20 hover:from-blue-100/50 dark:hover:from-blue-900/50 hover:to-blue-100 dark:hover:to-blue-900/30 transition group">
                    <span className="h-5 w-5 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5 group-hover:shadow-lg transition">
                      ✓
                    </span>
                    <span className="text-sm sm:text-base font-medium text-slate-900 dark:text-white group-hover:text-slate-900 dark:group-hover:text-white transition">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="mt-8 lg:mt-10">
            <div className="rounded-3xl surface-card p-6 sm:p-8 shadow-lg border border-slate-100/50">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div className="flex-1">
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">🛡️ {t('missingDocGuard')}</h3>
                  <p className="text-sm text-slate-900 dark:text-slate-400 mt-2">{t('missingDocHint')}</p>
                </div>
                <span className={`text-xs sm:text-sm font-bold px-4 sm:px-5 py-2.5 rounded-xl whitespace-nowrap flex-shrink-0 ${missingDocs.length ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300' : 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300'}`}>
                  {missingDocs.length
                    ? `${t('guardMissingPrefix')} ${missingDocs.length} / ${requiredDocs.length}`
                    : `${t('guardAllSet')} ✓`}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {requiredDocs.map((doc) => {
                  const isMissing = missingDocs.some((missing) => missing.key === doc.key);
                  return (
                    <div key={doc.key} className={`rounded-2xl px-5 sm:px-6 py-4 sm:py-5 flex items-center justify-between transition ${isMissing ? 'bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 hover:bg-amber-100 dark:hover:bg-amber-900/50' : 'bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'}`}>
                      <span className="font-medium text-slate-900 dark:text-white">{doc.label}</span>
                      <span className={`text-xs sm:text-sm font-bold px-3 py-1.5 rounded-lg ${isMissing ? 'bg-amber-200 dark:bg-amber-900/70 text-amber-800 dark:text-amber-300' : 'bg-emerald-200 dark:bg-emerald-900/70 text-emerald-800 dark:text-emerald-300'}`}>
                        {isMissing ? t('statusMissing') : t('statusUploaded')}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="p-4 sm:p-5 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50">
                <p className="text-xs sm:text-sm text-blue-900 dark:text-blue-200 font-medium">
                  <span className="font-bold">📊 {t('processedEnglishPdfs')}:</span> {englishPdfCount}/{requiredDocs.length}
                </p>
                <p className="text-xs text-blue-900 dark:text-blue-300 mt-2">All documents must be uploaded as English PDFs for verification.</p>
              </div>
            </div>
          </section>

          <section className="mt-8 lg:mt-10">
            <div className="rounded-3xl bg-gradient-to-r from-blue-50 dark:from-blue-950/30 via-blue-50 dark:via-blue-950/30 to-indigo-50 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-900/50 p-6 sm:p-8 shadow-lg flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1">
                <p className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">💡 {banner?.message || 'Based on your profile, new schemes may be available.'}</p>
              </div>
              <button className="w-full sm:w-auto px-7 sm:px-8 py-3 bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-xl text-sm font-bold hover:shadow-lg transition-all duration-200 active:scale-95 whitespace-nowrap">
                {banner?.cta || t('checkNow')} →
              </button>
            </div>
          </section>

          <section className="mt-8 lg:mt-10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">📋 {t('activityTimeline')}</h3>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-3 py-1.5 rounded-lg">{timeline.length} activities</span>
            </div>
            <div className="rounded-3xl surface-card p-6 sm:p-8 shadow-lg border border-slate-100/50">
              <div className="space-y-6 relative">
                <div className="absolute left-3 sm:left-5 top-2 bottom-2 w-1 bg-gradient-to-b from-blue-500 via-blue-400 to-transparent rounded-full" />
                {timeline.map((item) => (
                  <div key={item.id} className="relative pl-8 sm:pl-12 group hover:bg-blue-50/50 dark:hover:bg-blue-950/30 p-3 rounded-xl transition">
                    <div className="absolute left-0 top-2.5 h-5 w-5 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 border-4 border-white dark:border-slate-800 shadow-lg group-hover:scale-110 transition" />
                    <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-900 dark:group-hover:text-blue-300 transition">{item.title}</p>
                    <p className="text-sm text-slate-900 dark:text-slate-400 mt-1">{item.detail}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 font-medium">{item.time}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
        </main>
      </div>

      <button
        onClick={() => setChatOpen(true)}
        className="fixed bottom-8 right-8 z-40 h-16 w-16 rounded-full bg-gradient-to-br from-blue-900 to-blue-800 text-white text-2xl font-bold shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 active:scale-95 flex items-center justify-center border-4 border-white backdrop-blur-sm"
        aria-label="Open chatbot"
        title="Chat with AI Assistant"
      >
        💬
      </button>

      {chatOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-0">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setChatOpen(false)}
          />
          <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in">
            <div className="px-6 sm:px-7 py-5 bg-gradient-to-r from-blue-900 to-blue-800 text-white flex items-center justify-between">
              <div>
                <h3 className="text-lg sm:text-xl font-bold">{t('chatTitle')}</h3>
                <p className="text-xs sm:text-sm text-blue-100 mt-1">{t('chatSubtitle')}</p>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                className="h-10 w-10 rounded-full bg-white/20 text-white hover:bg-white/30 transition flex items-center justify-center text-xl font-bold"
              >
                ✕
              </button>
            </div>
            <div className="px-5 sm:px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto bg-gradient-to-b from-blue-50/30 dark:from-blue-950/20 to-white dark:to-slate-800">
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                >
                  <div
                    className={`rounded-2xl px-5 py-3 text-sm sm:text-base max-w-[85%] font-medium ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-blue-900 to-blue-800 text-white shadow-lg'
                        : 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-600 shadow-sm'
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl px-5 py-3 text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-600 shadow-sm flex items-center gap-2">
                    <span className="inline-flex gap-1">
                      <span className="h-2 w-2 rounded-full bg-blue-900 dark:bg-blue-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="h-2 w-2 rounded-full bg-blue-900 dark:bg-blue-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="h-2 w-2 rounded-full bg-blue-900 dark:bg-blue-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
                    {t('chatThinking')}
                  </div>
                </div>
              )}
            </div>
            <div className="px-5 sm:px-6 py-4 border-t border-slate-200 dark:border-slate-600 flex items-center gap-3 bg-slate-50 dark:bg-slate-800">
              <input
                value={chatInput}
                onChange={(event) => setChatInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={chatLoading}
                placeholder={t('chatInputPlaceholder')}
                className="flex-1 rounded-xl border border-slate-300 dark:border-slate-600 px-4 py-3 text-sm text-slate-900 dark:text-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-900 dark:focus:ring-blue-500 focus:border-transparent disabled:opacity-50 transition"
              />
              <button
                onClick={handleSendMessage}
                disabled={chatLoading}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-blue-900 to-blue-800 text-white text-sm font-bold hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 flex-shrink-0"
              >
                ↑
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
