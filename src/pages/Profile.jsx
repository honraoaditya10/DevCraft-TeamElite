import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { TopBar } from '../components/TopBar';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';

const fieldKeys = ['fullName', 'email', 'role', 'dateOfBirth', 'state', 'district', 'annualIncome'];

export default function Profile() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [profileData, setProfileData] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    state: '',
    district: '',
    annualIncome: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [documents, setDocuments] = useState({ income: null, caste: null });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        setError('');
        
        // Load documents from localStorage
        const saved = localStorage.getItem('userDocuments');
        if (saved) {
          const data = JSON.parse(saved);
          setDocuments({
            income: data.income || null,
            caste: data.caste || null
          });
        } else {
          const demoDocs = {
            income: {
              fileName: 'income_certificate_demo.pdf',
              size: 18240,
              uploadedAt: new Date().toISOString()
            },
            caste: {
              fileName: 'caste_certificate_demo.pdf',
              size: 16400,
              uploadedAt: new Date().toISOString()
            }
          };
          localStorage.setItem('userDocuments', JSON.stringify(demoDocs));
          setDocuments(demoDocs);
        }
        
        const response = await fetch(
          `${API_BASE_URL}/api/profile?email=${encodeURIComponent(user.email)}`
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to load profile');
        }

        setProfileData(data);
        setFormData({
          fullName: data.user?.fullName || '',
          dateOfBirth: data.user?.dateOfBirth || '',
          state: data.user?.state || '',
          district: data.user?.district || '',
          annualIncome: data.user?.annualIncome || ''
        });
      } catch (fetchError) {
        setError(fetchError.message || 'Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user, navigate]);

  // Calculate completion: 50% for base profile + 50% for documents
  const documentCompletion = [
    documents.income ? 25 : 0,
    documents.caste ? 25 : 0
  ].reduce((a, b) => a + b, 0);
  const totalCompletion = 50 + documentCompletion;
  const isComplete = totalCompletion >= 100;

  const missingFields = useMemo(() => {
    const userData = profileData?.user || {};
    return fieldKeys.filter((key) => !userData[key] || !String(userData[key]).trim());
  }, [profileData]);


  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!user) return;

    try {
      setIsSaving(true);
      setError('');
      setSuccess('');

      const response = await fetch(`${API_BASE_URL}/api/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          fullName: formData.fullName,
          dateOfBirth: formData.dateOfBirth,
          state: formData.state,
          district: formData.district,
          annualIncome: formData.annualIncome ? Number(formData.annualIncome) : null
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      setProfileData(data);
      setSuccess('Profile updated successfully.');
      if (data.user?.fullName) {
        setUser({ ...user, fullName: data.user.fullName });
      }
    } catch (saveError) {
      setError(saveError.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const userInfo = profileData?.user || {};

  return (
    <div className="min-h-screen text-slate-900 font-poppins app-shell page-shell">
      <TopBar
        title={t('profilePageTitle')}
        subtitle={userInfo.email || user?.email}
        showBack
        backTo="/dashboard"
        showLogout
      />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <section className="mt-6 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{t('profileCompletion')}</h2>
              <p className="text-sm text-slate-500">
                {isComplete ? 'Profile complete! Sample eligibility ready.' : 'Complete your profile and upload documents.'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-sm font-semibold ${isComplete ? 'text-green-700' : 'text-blue-900'}`}>
                {totalCompletion}%
              </span>
              <span
                className={`text-xs font-medium px-3 py-1 rounded-full ${
                  isComplete ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                }`}
              >
                {isComplete ? t('completed') : t('needsUpdate')}
              </span>
            </div>
          </div>
          <div className="mt-4 h-2 rounded-full bg-slate-100 overflow-hidden">
            <div
              className={`h-2 rounded-full ${isComplete ? 'bg-green-600' : 'bg-blue-900'}`}
              style={{ width: `${totalCompletion}%` }}
            />
          </div>
          
          {/* Breakdown */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-600">Profile Information: <strong>50%</strong></p>
                <div className="h-1.5 rounded-full bg-slate-100 mt-2">
                  <div className="h-1.5 rounded-full bg-blue-500" style={{ width: '50%' }} />
                </div>
              </div>
              <div>
                <p className="text-slate-600">Documents: <strong>{documentCompletion}%</strong></p>
                <div className="h-1.5 rounded-full bg-slate-100 mt-2">
                  <div className="h-1.5 rounded-full bg-emerald-500" style={{ width: `${documentCompletion}%` }} />
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-3">
              {!documents.income && '📄 Income Certificate pending'} 
              {!documents.caste && documents.income && ' • Caste Certificate pending'}
              {!documents.caste && !documents.income && ''}
              {documents.income && documents.caste && '✅ All documents uploaded'}
            </p>
          </div>
        </section>

        {error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        <section className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <h3 className="text-base font-semibold text-slate-900">{t('profileDetails')}</h3>
            {isLoading ? (
              <p className="mt-4 text-sm text-slate-500">{t('loadingProfile')}</p>
            ) : (
              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                {fieldKeys.map((key) => {
                  const hasValue = !!userInfo[key] && String(userInfo[key]).trim().length > 0;
                  return (
                    <div key={key} className="flex flex-col gap-2 border-b border-slate-100 pb-4 last:border-b-0">
                      <label className="text-sm text-slate-500">{t(key)}</label>
                      {hasValue ? (
                        <span className="text-sm font-medium text-slate-900">
                          {userInfo[key]}
                        </span>
                      ) : (
                        <input
                          name={key}
                          value={formData[key] ?? ''}
                          onChange={handleChange}
                          type={key === 'dateOfBirth' ? 'date' : key === 'annualIncome' ? 'number' : 'text'}
                          placeholder={`Enter ${t(key)}`}
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-900"
                        />
                      )}
                    </div>
                  );
                })}
                <div className="flex items-center gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => navigate('/documents')}
                    className="px-5 py-2 rounded-lg border border-slate-300 text-slate-900 text-sm font-medium hover:bg-slate-50 transition"
                  >
                    Upload Documents
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2 rounded-lg bg-blue-900 text-white text-sm font-medium hover:bg-blue-800 transition disabled:opacity-70"
                  >
                    {isSaving ? t('saving') : t('saveProfile')}
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <h3 className="text-base font-semibold text-slate-900">Verification Status</h3>
            {isLoading ? (
              <p className="mt-4 text-sm text-slate-500">Checking status...</p>
            ) : (
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${documents.income ? 'bg-green-500' : 'bg-amber-500'}`} />
                  <span className="text-slate-600">
                    {documents.income ? '✓ Income Certificate' : 'Income Certificate pending'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${documents.caste ? 'bg-green-500' : 'bg-amber-500'}`} />
                  <span className="text-slate-600">
                    {documents.caste ? '✓ Caste Certificate' : 'Caste Certificate pending'}
                  </span>
                </div>
              </div>
            )}
            <button
              onClick={() => navigate('/documents')}
              className="w-full mt-4 px-3 py-2 rounded-lg bg-blue-900 text-white text-sm font-medium hover:bg-blue-800 transition"
            >
              Manage Documents
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}
