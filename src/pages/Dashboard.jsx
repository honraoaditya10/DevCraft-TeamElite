import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const QuickStatCard = ({ title, value, helper, icon }) => (
  <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
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

const SchemeCard = ({ name, description, deadline }) => (
  <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100 flex flex-col">
    <div className="flex items-center justify-between">
      <h3 className="text-base font-semibold text-slate-900">{name}</h3>
      <span className="text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded-full">
        Eligible
      </span>
    </div>
    <p className="text-sm text-slate-600 mt-3">{description}</p>
    <div className="flex items-center justify-between mt-4">
      <span className="text-xs text-slate-500">Deadline: {deadline}</span>
      <button className="text-sm font-medium text-white bg-blue-900 px-4 py-2 rounded-lg hover:bg-blue-800">
        View Details
      </button>
    </div>
  </div>
);

const DocumentStatusRow = ({ label, status, tone }) => (
  <div className="flex items-center justify-between border-b border-slate-100 py-3 last:border-b-0">
    <span className="text-sm text-slate-700">{label}</span>
    <span className={`text-xs font-medium px-2 py-1 rounded-full ${tone}`}>{status}</span>
  </div>
);

const TimelineItem = ({ title, detail, time }) => (
  <div className="relative pl-6">
    <div className="absolute left-0 top-1.5 h-2 w-2 rounded-full bg-blue-900" />
    <p className="text-sm font-medium text-slate-800">{title}</p>
    <p className="text-xs text-slate-500">{detail}</p>
    <p className="text-xs text-slate-400 mt-1">{time}</p>
  </div>
);

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const userName = user?.fullName || user?.name || 'User';

  const handleLogout = () => {
    logout();
    navigate('/login');
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

  const stats = dashboardData?.stats;
  const schemes = dashboardData?.eligibleSchemes || [];
  const attentionItems = dashboardData?.attention || [];
  const documents = dashboardData?.documents || [];
  const nextSteps = dashboardData?.nextSteps || [];
  const banner = dashboardData?.banner;
  const timeline = dashboardData?.timeline || [];

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-slate-900 font-poppins">
      <div className="lg:hidden flex items-center justify-between px-4 py-4 bg-white border-b border-slate-200">
        <button
          onClick={() => setSidebarOpen(true)}
          className="h-10 w-10 rounded-lg border border-slate-200 flex items-center justify-center"
        >
          <span className="text-xl">=</span>
        </button>
        <p className="text-sm font-semibold text-slate-800">Docu-Agent</p>
        <div className="h-9 w-9 rounded-full bg-blue-900 text-white flex items-center justify-center text-sm">
          {userName[0]?.toUpperCase()}
        </div>
      </div>

      <div className="lg:flex lg:min-h-screen">
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 p-6 flex flex-col gap-8 transform transition-transform lg:translate-x-0 lg:static lg:transform-none lg:h-screen lg:sticky lg:top-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-blue-900 text-white flex items-center justify-center text-sm font-semibold">
            DA
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">Docu-Agent</p>
            <p className="text-xs text-slate-500">GovTech Assistant</p>
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
              onClick={item === 'Logout' ? handleLogout : undefined}
              className={`w-full text-left px-3 py-2 rounded-lg transition ${
                index === 0
                  ? 'bg-blue-50 text-blue-900 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {item}
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
          <header className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm text-slate-500">Welcome back,</p>
              <h1 className="text-2xl font-semibold text-blue-900">{userName}</h1>
            </div>
            <div className="flex-1 max-w-md">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Profile completion</span>
                <span>{stats?.profileCompletion ?? 0}%</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-green-600"
                  style={{ width: `${stats?.profileCompletion ?? 0}%` }}
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="h-10 w-10 rounded-lg border border-slate-200 flex items-center justify-center">
                <span className="text-lg">!</span>
              </button>
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200"
                >
                  <div className="h-8 w-8 rounded-full bg-blue-900 text-white flex items-center justify-center text-sm">
                    {userName[0]?.toUpperCase()}
                  </div>
                  <span className="text-sm text-slate-700">Account</span>
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-40 rounded-xl bg-white border border-slate-200 shadow-sm">
                    <button className="block w-full text-left px-4 py-2 text-sm hover:bg-slate-50">Profile</button>
                    <button className="block w-full text-left px-4 py-2 text-sm hover:bg-slate-50">Settings</button>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Logout
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
                title="Eligible Schemes"
                value={stats?.eligibleSchemes ?? 0}
                helper="Matching now"
                icon={<span className="text-lg">A</span>}
              />
              <QuickStatCard
                title="Needs Attention"
                value={stats?.needsAttention ?? 0}
                helper="Documents missing"
                icon={<span className="text-lg">!</span>}
              />
              <QuickStatCard
                title="Upcoming Deadlines"
                value={stats?.upcomingDeadlines ?? 0}
                helper="Due this week"
                icon={<span className="text-lg">D</span>}
              />
              <QuickStatCard
                title="Profile Completion"
                value={`${stats?.profileCompletion ?? 0}%`}
                helper="Almost there"
                icon={<span className="text-lg">P</span>}
              />
            </div>
          </section>

          <section className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Schemes You Are Eligible For</h2>
              <button className="text-sm text-blue-900 font-medium">View all</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {isLoading ? (
                <div className="col-span-full rounded-2xl bg-white border border-slate-100 p-6 text-sm text-slate-500">
                  Loading schemes...
                </div>
              ) : (
                schemes.map((scheme) => (
                  <SchemeCard
                    key={scheme.id}
                    name={scheme.name}
                    description={scheme.description}
                    deadline={scheme.deadline}
                  />
                ))
              )}
            </div>
          </section>

          <section className="mt-8">
            <div className="rounded-2xl bg-amber-50 border border-amber-100 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">You May Be Eligible - Action Needed</h3>
                  <p className="text-sm text-slate-600 mt-2">
                    {attentionItems[0]?.message || 'No pending actions right now.'}
                  </p>
                </div>
                <button className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-400">
                  Upload Document
                </button>
              </div>
            </div>
          </section>

          <section className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-2xl bg-white border border-slate-100 p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-900">Document Status</h3>
                <button className="text-sm text-blue-900 font-medium">Manage Documents</button>
              </div>
              <div className="mt-4">
                {documents.map((doc) => (
                  <DocumentStatusRow
                    key={doc.id}
                    label={doc.label}
                    status={doc.status === 'missing' ? 'Missing' : doc.status === 'verified' ? 'Verified' : 'Uploaded'}
                    tone={
                      doc.status === 'missing'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-green-50 text-green-700'
                    }
                  />
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-white border border-slate-100 p-5">
              <h3 className="text-base font-semibold text-slate-900">Your Next Steps</h3>
              <ul className="mt-4 space-y-3 text-sm text-slate-700">
                {nextSteps.map((step) => (
                  <li key={step.label} className="flex items-center gap-2">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        step.done ? 'bg-green-600' : 'bg-blue-900'
                      }`}
                    />
                    {step.label}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="mt-8">
            <div className="rounded-2xl bg-blue-50 border border-blue-100 p-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-700">
                {banner?.message || 'Based on your profile, new schemes may be available.'}
              </p>
              <button className="px-5 py-2 bg-blue-900 text-white rounded-lg text-sm font-medium hover:bg-blue-800">
                {banner?.cta || 'Check Now'}
              </button>
            </div>
          </section>

          <section className="mt-8">
            <h3 className="text-base font-semibold text-slate-900 mb-4">Activity Timeline</h3>
            <div className="rounded-2xl bg-white border border-slate-100 p-5">
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
    </div>
  );
}
