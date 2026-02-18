import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { TopBar } from '../../components/TopBar';

const TopicCard = ({ title, description }) => (
  <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-blue-100">
    <h3 className="text-base font-semibold text-slate-900">{title}</h3>
    <p className="mt-2 text-sm text-slate-600">{description}</p>
  </div>
);

const SupportCard = ({ title, detail, actionLabel }) => (
  <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
    <h3 className="text-base font-semibold text-slate-900">{title}</h3>
    <p className="mt-2 text-sm text-slate-600">{detail}</p>
    <button className="mt-4 rounded-lg bg-blue-900 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 transition">
      {actionLabel}
    </button>
  </div>
);

export default function HelpSupport() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const topics = [
    {
      title: t('faq'),
      description: t('tipProfile')
    },
    {
      title: t('documents'),
      description: t('tipDocs')
    },
    {
      title: t('upcomingDeadlines'),
      description: t('tipDeadlines')
    }
  ];

  const supportChannels = [
    {
      title: t('chatSupport'),
      detail: t('helpSubtitle'),
      actionLabel: t('chatSupport')
    },
    {
      title: t('emailSupport'),
      detail: 'support@docu-agent.local',
      actionLabel: t('emailSupport')
    },
    {
      title: t('callSupport'),
      detail: '+91 98000 00000',
      actionLabel: t('callSupport')
    }
  ];

  return (
    <div className="min-h-screen text-slate-900 font-poppins app-shell page-shell">
      <TopBar
        title={t('helpTitle')}
        subtitle={t('helpSubtitle')}
        showBack
        backTo="/dashboard"
        showLogout
      />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <section className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">{t('supportTopics')}</h2>
              <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded-full">
                {topics.length}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {topics.map((topic) => (
                <TopicCard key={topic.title} title={topic.title} description={topic.description} />
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <h3 className="text-base font-semibold text-slate-900">{t('contactSupport')}</h3>
            <p className="text-sm text-slate-500 mt-1">{t('submitTicket')}</p>
            <div className="mt-4 space-y-4">
              {supportChannels.map((channel) => (
                <SupportCard
                  key={channel.title}
                  title={channel.title}
                  detail={channel.detail}
                  actionLabel={channel.actionLabel}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="mt-8 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">{t('quickTips')}</h2>
          </div>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-900" />
              {t('tipProfile')}
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              {t('tipDocs')}
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              {t('tipDeadlines')}
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
