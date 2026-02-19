import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/images/logo.png';

const getDashboardLink = (user) => {
  if (!user) return '/';
  if (user.role === 'admin') return '/admin/dashboard';
  if (user.role === 'instructor') return '/instructor/dashboard';
  return '/dashboard';
};

const getProfileLink = (user) => {
  if (!user) return '/profile';
  if (user.role === 'admin') return '/admin/profile';
  if (user.role === 'instructor') return '/instructor/profile';
  return '/student/profile';
};

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const navRef = useRef(null);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isPlacementPage = false;

  const handleLogout = () => {
    logout();
    navigate('/login');
    setDropdownOpen(false);
  };

  useEffect(() => {
    if (isPlacementPage) {
      document.body.style.paddingTop = '0px';
    } else {
      document.body.style.paddingTop = '96px';
    }
    return () => {
      document.body.style.paddingTop = '';
    };
  }, [isPlacementPage]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setDropdownOpen(false);
        setMobileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav
      ref={navRef}
      className={`${isPlacementPage ? 'absolute top-4 inset-x-0 z-50' : 'fixed top-4 inset-x-0 z-50'}`}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white border border-slate-200 rounded-2xl">
          <div className="h-[68px] px-6 flex items-center justify-between relative">
            <Link to="/" className="flex items-center gap-2">
              <img src={logo} alt="Docu-Agent" className="h-8" />
            </Link>

            <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2">
              <ul className="flex items-center gap-10 text-sm font-medium text-slate-800">
                <li>
                  <Link
                    to="/#how"
                    className={`transition ${location.hash === '#how' ? 'text-blue-900' : 'hover:text-blue-900'}`}
                  >
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link
                    to="/#features"
                    className={`transition ${location.hash === '#features' ? 'text-blue-900' : 'hover:text-blue-900'}`}
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    to="/auto-fill"
                    className="transition hover:text-blue-900"
                  >
                    Auto-Fill Agent
                  </Link>
                </li>
                <li>
                  <Link
                    to="/#results"
                    className={`transition ${location.hash === '#results' ? 'text-blue-900' : 'hover:text-blue-900'}`}
                  >
                    Results
                  </Link>
                </li>
              </ul>
            </div>

            <div className="flex items-center gap-3 lg:gap-6">
              <button
                onClick={() => setMobileOpen((prev) => !prev)}
                className="lg:hidden h-10 w-10 rounded-lg border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50 transition"
                aria-label="Toggle navigation"
              >
                <span className="text-xl">≡</span>
              </button>
              {!user ? (
                <>
                  <Link
                    to="/login"
                    state={{ from: location.pathname }}
                    className="text-sm text-slate-800 hover:text-blue-900 transition"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    state={{ from: location.pathname }}
                    className="px-5 py-2 rounded-lg bg-blue-900 hover:bg-blue-800 text-white text-sm font-medium transition"
                  >
                    Get Started
                  </Link>
                </>
              ) : (
                <div className="relative user-dropdown">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-900 text-white flex items-center justify-center font-semibold overflow-hidden">
                      {user.name?.[0]?.toUpperCase() || user.fullName?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span className="text-sm text-slate-800">
                      {user.name?.split(' ')[0] || user.fullName?.split(' ')[0] || 'User'}
                    </span>
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                      <Link
                        to={getProfileLink(user)}
                        className="block px-4 py-2 text-sm hover:bg-slate-50"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Profile
                      </Link>
                      <Link
                        to={getDashboardLink(user)}
                        className="block px-4 py-2 text-sm hover:bg-slate-50"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {mobileOpen && (
            <div className="lg:hidden border-t border-slate-200 px-6 py-4">
              <ul className="flex flex-col gap-3 text-sm font-medium text-slate-800">
                <li>
                  <Link
                    to="/#how"
                    className="transition hover:text-blue-900"
                    onClick={() => setMobileOpen(false)}
                  >
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link
                    to="/#features"
                    className="transition hover:text-blue-900"
                    onClick={() => setMobileOpen(false)}
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    to="/auto-fill"
                    className="transition hover:text-blue-900"
                    onClick={() => setMobileOpen(false)}
                  >
                    Auto-Fill Agent
                  </Link>
                </li>
                <li>
                  <Link
                    to="/#results"
                    className="transition hover:text-blue-900"
                    onClick={() => setMobileOpen(false)}
                  >
                    Results
                  </Link>
                </li>
              </ul>
              {!user && (
                <div className="mt-4 flex flex-col gap-3">
                  <Link
                    to="/login"
                    state={{ from: location.pathname }}
                    className="text-sm text-slate-800 hover:text-blue-900 transition"
                    onClick={() => setMobileOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    state={{ from: location.pathname }}
                    className="px-5 py-2 rounded-lg bg-blue-900 hover:bg-blue-800 text-white text-sm font-medium transition"
                    onClick={() => setMobileOpen(false)}
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
