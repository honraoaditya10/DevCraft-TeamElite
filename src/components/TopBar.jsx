import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { ThreeBackground } from './ThreeBackground';

export const TopBar = ({
  title,
  subtitle,
  showBack = false,
  backTo = '/dashboard',
  showMenu = false,
  onMenuClick,
  showLogout = false
}) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [isHidden, setIsHidden] = useState(false);
  const lastScroll = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY || 0;
      const scrollingDown = current > lastScroll.current;
      const shouldHide = scrollingDown && current > 120;
      setIsHidden(shouldHide);
      lastScroll.current = current;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.fullName?.[0]?.toUpperCase() || user?.name?.[0]?.toUpperCase() || 'U';

  return (
    <div className={`ml-30 sticky top-0 z-40 transition-transform duration-300 ${isHidden ? 'topbar-hidden' : ''}`}>
      <div className=" max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="surface-card rounded-2xl px-4 py-3 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <ThreeBackground theme={theme} />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-white/70 via-transparent to-white/40 pointer-events-none" />
          <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              {showMenu && (
                <button
                  onClick={onMenuClick}
                  className="h-10 w-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50 transition"
                >
                  <span className="text-lg">=</span>
                </button>
              )}
              {showBack && (
                <button
                  onClick={() => navigate(backTo)}
                  className="h-10 w-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50 transition"
                >
                  <span className="text-lg">&lt;</span>
                </button>
              )}
              <div className="h-10 w-10 rounded-xl bg-blue-900 text-white flex items-center justify-center text-sm font-semibold">
                DA
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">{t('appName')}</p>
                <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
                {subtitle && <p className="text-xs text-slate-500 hidden sm:block">{subtitle}</p>}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 justify-start sm:justify-end">
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 bg-white">
                <span className="text-xs font-semibold text-slate-500">{t('language')}</span>
                <select
                  value={language}
                  onChange={(event) => setLanguage(event.target.value)}
                  className="text-sm text-slate-700 bg-transparent focus:outline-none"
                >
                  <option value="en">{t('english')}</option>
                  <option value="mr">{t('marathi')}</option>
                  <option value="hi">{t('hindi')}</option>
                </select>
              </div>
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 bg-white transition hover:border-blue-200 hover:bg-blue-50/40"
              >
                <span className="text-xs font-semibold text-slate-500">{t('theme')}</span>
                <span className="text-sm font-semibold text-slate-700">
                  {theme === 'dark' ? t('dark') : t('light')}
                </span>
              </button>
              <button
                onClick={() => navigate('/profile')}
                className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 bg-white hover:bg-slate-50 transition"
              >
                <span className="h-7 w-7 rounded-full bg-blue-900 text-white flex items-center justify-center text-xs font-semibold">
                  {initials}
                </span>
                <span className="text-sm text-slate-700 hidden sm:inline">{t('myProfile')}</span>
              </button>
              {showLogout && (
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-lg bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 transition"
                >
                  {t('logout')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
