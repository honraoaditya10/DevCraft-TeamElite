import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { TopBar } from '../components/TopBar';

const QuickStatCard = ({ title, value, helper, icon }) => (
  <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-blue-100">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-slate-500">{title}</p>
        <p className="text-2xl font-semibold text-slate-900 mt-2">{value}</p>
        <p className="text-xs text-slate-500 mt-1">{helper}</p>
      </div>
      <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center">
        {icon}
      </div>
    </div>
  </div>
);

const SchemeCard = ({ id, name, description, deadline, statusLabel, viewLabel, deadlineLabel, onViewDetails }) => (
  <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100 flex flex-col transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-blue-100">
    <div className="flex items-center justify-between">
      <h3 className="text-base font-semibold text-slate-900">{name}</h3>
      <span className="text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded-full">
        {statusLabel}
      </span>
    </div>
    <p className="text-sm text-slate-600 mt-3">{description}</p>
    <div className="flex items-center justify-between mt-4">
      <span className="text-xs text-slate-500">{deadlineLabel}: {deadline}</span>
      <button
        onClick={() => onViewDetails(id)}
        className="text-sm font-medium text-white bg-blue-900 px-4 py-2 rounded-lg hover:bg-blue-800 transition"
      >
        {viewLabel}
      </button>
    </div>
  </div>
);

const DocumentStatusRow = ({ label, status, tone }) => (
  <div className="flex items-center justify-between border-b border-slate-100 py-3 last:border-b-0 transition-colors hover:bg-slate-50/60">
    <span className="text-sm text-slate-700">{label}</span>
    <span className={`text-xs font-medium px-2 py-1 rounded-full ${tone}`}>{status}</span>
  </div>
);

const TimelineItem = ({ title, detail, time }) => (
  <div className="relative pl-6">
    <div className="absolute left-0 top-1.5 h-2 w-2 rounded-full bg-blue-900 shadow-sm" />
    <p className="text-sm font-medium text-slate-800">{title}</p>
    <p className="text-xs text-slate-500">{detail}</p>
    <p className="text-xs text-slate-400 mt-1">{time}</p>
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
            className={`fixed inset-y-0 left-0 z-40 w-64 rounded-3xl bg-white border-r border-slate-200 p-6 flex flex-col gap-8 transform transition-transform duration-200 lg:translate-x-0 lg:static lg:transform-none lg:h-screen lg:sticky lg:top-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-blue-900 text-white flex items-center justify-center text-sm font-semibold">
            DA
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">{t('appName')}</p>
            <p className="text-xs text-slate-500">{t('govTechAssistant')}</p>
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
                  ? 'bg-blue-50 text-blue-900 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50'
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
          <header className="surface-card rounded-2xl p-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm text-slate-500">{t('welcomeBack')}</p>
              <h1 className="text-2xl font-semibold text-blue-900">{userName}</h1>
            </div>
            <div className="flex-1 max-w-md">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{t('profileCompletion')}</span>
                <span>{stats?.profileCompletion ?? 0}%</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-2 rounded-full bg-green-600"
                  style={{ width: `${stats?.profileCompletion ?? 0}%` }}
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="h-10 w-10 rounded-lg border border-slate-200 flex items-center justify-center transition hover:border-blue-200 hover:text-blue-900">
                <span className="text-lg">!</span>
              </button>
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 transition hover:border-blue-200 hover:bg-blue-50/40"
                >
                  <div className="h-8 w-8 rounded-full bg-blue-900 text-white flex items-center justify-center text-sm">
                    {userName[0]?.toUpperCase()}
                  </div>
                  <span className="text-sm text-slate-700">{t('account')}</span>
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-40 rounded-xl bg-white border border-slate-200 shadow-sm">
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        navigate('/profile');
                      }}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-slate-50"
                    >
                      {t('profile')}
                    </button>
                    <button className="block w-full text-left px-4 py-2 text-sm hover:bg-slate-50">
                      {t('settings')}
                    </button>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      {t('logout')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          <section className="mt-6">
            {loadError && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {loadError}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <QuickStatCard
                title={t('eligibleSchemes')}
                value={stats?.eligibleSchemes ?? 0}
                helper={t('matchingNow')}
                icon={<span className="text-lg">A</span>}
              />
              <QuickStatCard
                title={t('needsAttention')}
                value={stats?.needsAttention ?? 0}
                helper={t('documentsMissing')}
                icon={<span className="text-lg">!</span>}
              />
              <QuickStatCard
                title={t('upcomingDeadlines')}
                value={stats?.upcomingDeadlines ?? 0}
                helper={t('dueThisWeek')}
                icon={<span className="text-lg">D</span>}
              />
              <QuickStatCard
                title={t('profileCompletion')}
                value={`${stats?.profileCompletion ?? 0}%`}
                helper={t('almostThere')}
                icon={<span className="text-lg">P</span>}
              />
            </div>
          </section>

          <section className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">{t('schemeEligibility')}</h2>
              <button className="text-sm text-blue-900 font-medium">{t('viewAll')}</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {isLoading ? (
                <div className="col-span-full rounded-2xl bg-white border border-slate-100 p-6 text-sm text-slate-500">
                  {t('loadingSchemes')}
                </div>
              ) : (
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
              )}
            </div>
          </section>

          <section className="mt-8">
            <div className="rounded-2xl bg-amber-50 border border-amber-100 p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">{t('actionNeeded')}</h3>
                  <p className="text-sm text-slate-600 mt-2">
                    {attentionItems[0]?.message || t('noPendingActions')}
                  </p>
                </div>
                <button className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-400 transition">
                  {t('uploadDocument')}
                </button>
              </div>
            </div>
          </section>

          <section className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-2xl bg-white border border-slate-100 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-900">{t('documentStatus')}</h3>
                <button
                  onClick={() => navigate('/documents')}
                  className="text-sm text-blue-900 font-medium"
                >
                  {t('manageDocuments')}
                </button>
              </div>
              <div className="mt-4">
                {documents.map((doc) => (
                  <DocumentStatusRow
                    key={doc.id}
                    label={doc.label}
                    status={
                      doc.status === 'missing'
                        ? t('statusMissing')
                        : doc.status === 'verified'
                        ? t('statusVerified')
                        : t('statusUploaded')
                    }
                    tone={
                      doc.status === 'missing'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-green-50 text-green-700'
                    }
                  />
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-white border border-slate-100 p-5 shadow-sm">
              <h3 className="text-base font-semibold text-slate-900">{t('todoListTitle')}</h3>
              <p className="text-xs text-slate-500 mt-1">{t('todoListHint')}</p>
              <ul className="mt-4 space-y-3 text-sm text-slate-700">
                {todoItems.map((item, index) => (
                  <li key={`${item}-${index}`} className="flex items-start gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-900 mt-2" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="mt-8">
            <div className="rounded-2xl bg-white border border-slate-100 p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">{t('missingDocGuard')}</h3>
                  <p className="text-sm text-slate-600 mt-1">{t('missingDocHint')}</p>
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${missingDocs.length ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
                  {missingDocs.length
                    ? `${t('guardMissingPrefix')} ${missingDocs.length} / ${requiredDocs.length}`
                    : t('guardAllSet')}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {requiredDocs.map((doc) => {
                  const isMissing = missingDocs.some((missing) => missing.key === doc.key);
                  return (
                    <div key={doc.key} className="rounded-xl border border-slate-100 px-4 py-3 flex items-center justify-between">
                      <span className="text-sm text-slate-700">{doc.label}</span>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${isMissing ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
                        {isMissing ? t('statusMissing') : t('statusUploaded')}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 text-xs text-slate-500">
                {t('processedEnglishPdfs')}: {englishPdfCount}
              </div>
            </div>
          </section>

          <section className="mt-8">
            <div className="rounded-2xl bg-blue-50 border border-blue-100 p-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between shadow-sm">
              <p className="text-sm text-slate-700">
                {banner?.message || 'Based on your profile, new schemes may be available.'}
              </p>
              <button className="px-5 py-2 bg-blue-900 text-white rounded-lg text-sm font-medium hover:bg-blue-800 transition">
                {banner?.cta || t('checkNow')}
              </button>
            </div>
          </section>

          <section className="mt-8">
            <h3 className="text-base font-semibold text-slate-900 mb-4">{t('activityTimeline')}</h3>
            <div className="rounded-2xl bg-white border border-slate-100 p-5 shadow-sm">
              <div className="space-y-5 border-l border-slate-200 pl-4">
                {timeline.map((item) => (
                  <TimelineItem
                    key={item.id}
                    title={item.title}
                    detail={item.detail}
                    time={item.time}
                  />
                ))}
              </div>
            </div>
          </section>
        </div>
        </main>
      </div>

      <button
        onClick={() => setChatOpen(true)}
        className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full bg-blue-900 text-white text-xl font-semibold shadow-lg hover:bg-blue-800 transition flex items-center justify-center"
        aria-label="Open chatbot"
      >
        💬
      </button>

      {chatOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setChatOpen(false)}
          />
          <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-900">{t('chatTitle')}</h3>
                <p className="text-xs text-slate-500">{t('chatSubtitle')}</p>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                className="h-8 w-8 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                ×
              </button>
            </div>
            <div className="px-5 py-4 space-y-3 max-h-[50vh] overflow-y-auto bg-slate-50">
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`rounded-2xl px-4 py-2 text-sm max-w-[80%] ${
                      message.role === 'user'
                        ? 'bg-blue-900 text-white'
                        : 'bg-white text-slate-700 border border-slate-200'
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl px-4 py-2 text-sm max-w-[80%] bg-white text-slate-700 border border-slate-200">
                    {t('chatThinking')}
                  </div>
                </div>
              )}
            </div>
            <div className="px-4 py-3 border-t border-slate-100 flex items-center gap-2">
              <input
                value={chatInput}
                onChange={(event) => setChatInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') handleSendMessage();
                }}
                disabled={chatLoading}
                placeholder={t('chatInputPlaceholder')}
                className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
              />
              <button
                onClick={handleSendMessage}
                disabled={chatLoading}
                className="px-4 py-2 rounded-xl bg-blue-900 text-white text-sm font-semibold hover:bg-blue-800 disabled:opacity-60"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
