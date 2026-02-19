import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { TopBar } from '../components/TopBar';

const EligibilityBadge = ({ status }) => {
  const colors = {
    eligible: 'bg-green-100 text-green-700 border-green-300',
    partial: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    not_eligible: 'bg-red-100 text-red-700 border-red-300',
  };
  
  const labels = {
    eligible: '✓ Eligible',
    partial: '◐ Partial Match',
    not_eligible: '✗ Not Eligible',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${colors[status] || 'bg-gray-100'}`}>
      {labels[status] || status}
    </span>
  );
};

const SchemeCard = ({ scheme, status }) => (
  <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition">
    <div className="flex items-start justify-between mb-3">
      <h3 className="text-base font-semibold text-slate-900 flex-1">{scheme.name || scheme.scheme_name}</h3>
      <EligibilityBadge status={status} />
    </div>

    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-600">Match Score:</span>
        <div className="flex items-center gap-2">
          <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                status === 'eligible'
                  ? 'bg-green-500'
                  : status === 'partial'
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
              }`}
              style={{ width: `${scheme.score || 0}%` }}
            />
          </div>
          <span className="text-sm font-semibold text-slate-900">{scheme.score || 0}%</span>
        </div>
      </div>

      <p className="text-sm text-slate-600">
        <span className="font-medium">Reason:</span> {scheme.reason || 'Analysis pending'}
      </p>

      {scheme.missing && scheme.missing.length > 0 && (
        <div className="pt-2 border-t border-slate-200">
          <p className="text-sm font-medium text-slate-700 mb-2">Missing Requirements:</p>
          <ul className="text-sm text-slate-600 space-y-1">
            {scheme.missing.map((req, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-slate-400 mt-0.5">•</span>
                <span>{req}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {status === 'eligible' && (
        <button className="w-full mt-4 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition">
          Apply Now
        </button>
      )}
    </div>
  </div>
);

export default function EligibilityResults() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetchEligibilityResults();
  }, [user, navigate]);

  const fetchEligibilityResults = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/v2/eligibility/${user.id}`);
      
      if (response.ok) {
        const data = await response.json();
        setResults(data);
        setError('');
      } else {
        setError('Could not fetch eligibility results');
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading eligibility results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-slate-900 font-poppins app-shell page-shell">
      <TopBar
        title="Eligibility Results"
        subtitle="AI-Powered Scholarship Matching"
        showBack
        backTo="/dashboard"
        showLogout
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
            {error}
          </div>
        )}

        {results && (
          <>
            {/* Overall Score */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                <p className="text-sm text-blue-600 font-medium">Overall Score</p>
                <p className="text-3xl font-bold text-blue-900 mt-2">{results.eligible_count || 0}</p>
                <p className="text-xs text-blue-600 mt-1">Eligible Schemes</p>
              </div>

              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 border border-yellow-200">
                <p className="text-sm text-yellow-600 font-medium">Partial Matches</p>
                <p className="text-3xl font-bold text-yellow-900 mt-2">{results.partial_count || 0}</p>
                <p className="text-xs text-yellow-600 mt-1">With Missing Requirements</p>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border border-red-200">
                <p className="text-sm text-red-600 font-medium">Not Eligible</p>
                <p className="text-3xl font-bold text-red-900 mt-2">{results.not_eligible_count || 0}</p>
                <p className="text-xs text-red-600 mt-1">Currently Ineligible</p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                <p className="text-sm text-green-600 font-medium">Total Schemes</p>
                <p className="text-3xl font-bold text-green-900 mt-2">
                  {(results.eligible_count || 0) + (results.partial_count || 0) + (results.not_eligible_count || 0)}
                </p>
                <p className="text-xs text-green-600 mt-1">Analyzed for You</p>
              </div>
            </div>

            {/* Eligible Schemes */}
            {results.eligible_schemes && results.eligible_schemes.length > 0 && (
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  Eligible for You ({results.eligible_schemes.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.eligible_schemes.map((scheme, i) => (
                    <SchemeCard key={i} scheme={scheme} status="eligible" />
                  ))}
                </div>
              </section>
            )}

            {/* Partial Matches */}
            {results.partial_match_schemes && results.partial_match_schemes.length > 0 && (
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="text-yellow-600">◐</span>
                  Partial Matches ({results.partial_match_schemes.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.partial_match_schemes.map((scheme, i) => (
                    <SchemeCard key={i} scheme={scheme} status="partial" />
                  ))}
                </div>
              </section>
            )}

            {/* Not Eligible */}
            {results.not_eligible_schemes && results.not_eligible_schemes.length > 0 && (
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="text-red-600">✗</span>
                  Not Currently Eligible ({results.not_eligible_schemes.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.not_eligible_schemes.map((scheme, i) => (
                    <SchemeCard key={i} scheme={scheme} status="not_eligible" />
                  ))}
                </div>
              </section>
            )}

            {/* No Results */}
            {!results.eligible_schemes?.length &&
              !results.partial_match_schemes?.length &&
              !results.not_eligible_schemes?.length && (
                <div className="text-center py-12">
                  <p className="text-slate-600 mb-4">No eligibility results yet.</p>
                  <button
                    onClick={() => navigate('/documents')}
                    className="px-6 py-2 bg-blue-900 text-white rounded-lg font-medium hover:bg-blue-800"
                  >
                    Upload Documents to Check Eligibility
                  </button>
                </div>
              )}
          </>
        )}
      </div>
    </div>
  );
}
