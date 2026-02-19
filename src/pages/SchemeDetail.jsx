import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function SchemeDetail() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { schemeId } = useParams();
  const [scheme, setScheme] = useState(null);
  const [eligibility, setEligibility] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';

  useEffect(() => {
    if (!user || !schemeId) {
      navigate('/dashboard');
      return;
    }

    const fetchSchemeDetail = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await fetch(
          `${API_BASE_URL}/api/dashboard/scheme/${schemeId}?email=${encodeURIComponent(user.email)}`
        );

        if (!response.ok) {
          throw new Error('Failed to load scheme details');
        }

        const data = await response.json();
        setScheme(data.scheme);
        setEligibility(data.eligibility);
      } catch (err) {
        setError(err.message || 'Failed to load scheme details');
      } finally {
        setLoading(false);
      }
    };

    fetchSchemeDetail();
  }, [user, schemeId, navigate, API_BASE_URL]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading scheme details...</p>
        </div>
      </div>
    );
  }

  if (error || !scheme) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <p className="text-rose-600 mb-4">{error || 'Scheme not found'}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-900 text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const isEligible = eligibility?.eligible;
  const reasons = eligibility?.reasons || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-blue-900 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-xl font-bold text-slate-900">{scheme.schemeName}</h1>
          <div className="w-20"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Eligibility Badge */}
        <div
          className={`mb-8 rounded-2xl p-6 flex items-center justify-between ${
            isEligible
              ? 'bg-emerald-50 border border-emerald-200'
              : 'bg-amber-50 border border-amber-200'
          }`}
        >
          <div>
            <p className={`font-semibold text-lg ${isEligible ? 'text-emerald-900' : 'text-amber-900'}`}>
              {isEligible ? '✓ You are eligible for this scheme' : '⚠ You may not be eligible for this scheme'}
            </p>
            <p className={`text-sm mt-1 ${isEligible ? 'text-emerald-700' : 'text-amber-700'}`}>
              {isEligible
                ? 'You meet the eligibility criteria for this scholarship/scheme.'
                : 'Complete your profile or meet additional criteria to become eligible.'}
            </p>
          </div>
          <button
            className={`px-6 py-2 rounded-lg font-medium text-white transition ${
              isEligible
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-slate-400 cursor-not-allowed'
            }`}
            disabled={!isEligible}
          >
            {isEligible ? 'Apply Now' : 'Update Profile'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Scheme Information</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Department / Ministry</p>
                  <p className="text-base text-slate-900 font-medium">{scheme.department}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Scheme Type</p>
                  <p className="text-base text-slate-900">{scheme.schemeType}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Applicable Region</p>
                  <p className="text-base text-slate-900">{scheme.region === 'Central (All India)' ? 'All India' : scheme.state || 'All India'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Application Deadline</p>
                  <p className="text-base text-slate-900 font-medium">{scheme.deadline}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            {scheme.description && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900 mb-3">Description</h2>
                <p className="text-slate-700 leading-relaxed">{scheme.description}</p>
              </div>
            )}

            {/* Eligibility Criteria */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Eligibility Criteria</h2>
              {reasons && reasons.length > 0 ? (
                <div className="space-y-3">
                  {reasons.map((reason, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg flex gap-3 ${
                        reason.met
                          ? 'bg-emerald-50 border border-emerald-100'
                          : 'bg-rose-50 border border-rose-100'
                      }`}
                    >
                      <div className="flex-shrink-0 pt-0.5">
                        {reason.met ? (
                          <span className="text-emerald-600 font-bold">✓</span>
                        ) : (
                          <span className="text-rose-600 font-bold">✗</span>
                        )}
                      </div>
                      <div>
                        <p className={`font-medium text-sm ${reason.met ? 'text-emerald-900' : 'text-rose-900'}`}>
                          {reason.field}
                        </p>
                        <p className={`text-xs mt-1 ${reason.met ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {reason.message}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-600">No specific criteria defined for this scheme. Everyone can apply!</p>
              )}
            </div>

            {/* Required Documents */}
            {scheme.requiredDocs && Object.values(scheme.requiredDocs).some(v => v) && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Required Documents</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { key: 'income', label: 'Income Certificate' },
                    { key: 'caste', label: 'Caste Certificate' },
                    { key: 'domicile', label: 'Domicile Certificate' },
                    { key: 'aadhaar', label: 'Aadhaar' },
                    { key: 'marksheet', label: 'Marksheet' },
                    { key: 'bank', label: 'Bank Passbook' }
                  ].map(
                    (doc) =>
                      scheme.requiredDocs[doc.key] && (
                        <div key={doc.key} className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                          <span className="text-blue-600 font-bold">📄</span>
                          <span className="text-sm text-slate-700">{doc.label}</span>
                        </div>
                      )
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Summary */}
          <div className="space-y-6">
            {/* Quick Info Card */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200 sticky top-24">
              <h3 className="font-semibold text-slate-900 mb-4">Quick Info</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Scheme Type:</span>
                  <span className="text-sm font-medium text-slate-900">{scheme.schemeType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Ministry:</span>
                  <span className="text-sm font-medium text-slate-900">{scheme.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Deadline:</span>
                  <span className="text-sm font-medium text-slate-900">{scheme.deadline}</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-blue-200">
                  <span className="text-sm text-slate-600">Status:</span>
                  <span className={`text-sm font-medium ${isEligible ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {isEligible ? 'Eligible' : 'Ineligible'}
                  </span>
                </div>
              </div>
            </div>

            {/* Help Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <h3 className="font-semibold text-slate-900 mb-3">Need Help?</h3>
              <p className="text-sm text-slate-600 mb-4">
                {isEligible
                  ? 'Click the "Apply Now" button above to submit your application for this scheme.'
                  : 'Update your profile with missing information to become eligible for this scheme.'}
              </p>
              <button className="w-full px-4 py-2 bg-blue-50 text-blue-900 rounded-lg hover:bg-blue-100 transition font-medium text-sm">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
