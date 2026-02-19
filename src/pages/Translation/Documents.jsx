import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { TopBar } from '../../components/TopBar';
import { useLanguage } from '../../context/LanguageContext';

const STORAGE_KEY = 'userDocuments';

const formatFileSize = (bytes) => {
  if (!bytes && bytes !== 0) return '-';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function Documents() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [incomeFile, setIncomeFile] = useState(null);
  const [casteFile, setCasteFile] = useState(null);
  const [incomeStatus, setIncomeStatus] = useState('');
  const [casteStatus, setCasteStatus] = useState('');
  const [documents, setDocuments] = useState({ income: null, caste: null });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      setDocuments({
        income: data.income || null,
        caste: data.caste || null
      });
      return;
    }

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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(demoDocs));
    setDocuments(demoDocs);
    setIncomeStatus('✅ Income Certificate uploaded successfully.');
    setCasteStatus('✅ Caste Certificate uploaded successfully.');
  }, [user, navigate]);

  const handleUpload = (file, docType) => {
    if (!file) return;

    const payload = {
      fileName: file.name,
      size: file.size,
      uploadedAt: new Date().toISOString()
    };

    const saved = localStorage.getItem(STORAGE_KEY) || '{}';
    const data = JSON.parse(saved);
    if (docType === 'income') {
      data.income = payload;
      setDocuments((prev) => ({ ...prev, income: payload }));
      setIncomeStatus('✅ Income Certificate uploaded successfully.');
      setIncomeFile(null);
    } else {
      data.caste = payload;
      setDocuments((prev) => ({ ...prev, caste: payload }));
      setCasteStatus('✅ Caste Certificate uploaded successfully.');
      setCasteFile(null);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const bothUploaded = !!documents.income && !!documents.caste;
  const requiredDocs = [
    { key: 'income', label: t('incomeCertificate') },
    { key: 'caste', label: t('casteCertificate') }
  ];
  const missingDocs = requiredDocs.filter((doc) => !documents[doc.key]);
  const englishPdfCount = Object.values(documents).filter((doc) =>
    doc?.fileName?.toLowerCase().endsWith('.pdf')
  ).length;

  const todoItems = [];
  if (!documents.income) todoItems.push(t('todoUploadIncome'));
  if (!documents.caste) todoItems.push(t('todoUploadCaste'));
  if (todoItems.length === 0) todoItems.push(t('todoAllSet'));

  return (
    <div className="min-h-screen text-slate-900 font-poppins app-shell page-shell">
      <TopBar
        title="Document Verification"
        subtitle="Upload your documents to complete your profile"
        showBack
        backTo="/dashboard"
        showLogout
      />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Income Certificate</h3>
                <p className="text-sm text-slate-600">Upload a clear image or PDF</p>
              </div>
              {documents.income && <div className="text-2xl">✅</div>}
            </div>

            {incomeStatus && (
              <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-sm text-green-700">
                {incomeStatus}
              </div>
            )}

            {documents.income && (
              <div className="mb-4 p-4 rounded-lg bg-blue-50 border border-blue-200 text-sm text-blue-700">
                <p><strong>File:</strong> {documents.income.fileName}</p>
                <p><strong>Size:</strong> {formatFileSize(documents.income.size)}</p>
              </div>
            )}

            {!documents.income && (
              <div className="rounded-xl border-2 border-dashed border-slate-200 p-6">
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(event) => setIncomeFile(event.target.files?.[0] || null)}
                  className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-900 hover:file:bg-blue-100"
                />
                {incomeFile && (
                  <p className="mt-3 text-sm text-slate-600">
                    📄 {incomeFile.name} ({formatFileSize(incomeFile.size)})
                  </p>
                )}
                <button
                  onClick={() => handleUpload(incomeFile, 'income')}
                  disabled={!incomeFile}
                  className="mt-4 w-full px-4 py-2 rounded-lg bg-blue-900 text-white font-medium hover:bg-blue-800 transition disabled:opacity-50"
                >
                  Upload Income Certificate
                </button>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Caste Certificate</h3>
                <p className="text-sm text-slate-600">Upload a clear image or PDF</p>
              </div>
              {documents.caste && <div className="text-2xl">✅</div>}
            </div>

            {casteStatus && (
              <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-sm text-green-700">
                {casteStatus}
              </div>
            )}

            {documents.caste && (
              <div className="mb-4 p-4 rounded-lg bg-blue-50 border border-blue-200 text-sm text-blue-700">
                <p><strong>File:</strong> {documents.caste.fileName}</p>
                <p><strong>Size:</strong> {formatFileSize(documents.caste.size)}</p>
              </div>
            )}

            {!documents.caste && (
              <div className="rounded-xl border-2 border-dashed border-slate-200 p-6">
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(event) => setCasteFile(event.target.files?.[0] || null)}
                  className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-900 hover:file:bg-blue-100"
                />
                {casteFile && (
                  <p className="mt-3 text-sm text-slate-600">
                    📄 {casteFile.name} ({formatFileSize(casteFile.size)})
                  </p>
                )}
                <button
                  onClick={() => handleUpload(casteFile, 'caste')}
                  disabled={!casteFile}
                  className="mt-4 w-full px-4 py-2 rounded-lg bg-blue-900 text-white font-medium hover:bg-blue-800 transition disabled:opacity-50"
                >
                  Upload Caste Certificate
                </button>
              </div>
            )}
          </div>
        </div>

        <section className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{t('missingDocGuard')}</h3>
                <p className="text-sm text-slate-600 mt-1">{t('missingDocHint')}</p>
              </div>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${missingDocs.length ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
                {missingDocs.length
                  ? `${t('guardMissingPrefix')} ${missingDocs.length} / ${requiredDocs.length}`
                  : t('guardAllSet')}
              </span>
            </div>
            <div className="mt-4 space-y-3">
              {requiredDocs.map((doc) => {
                const isMissing = missingDocs.some((missing) => missing.key === doc.key);
                return (
                  <div key={doc.key} className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3">
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

          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">{t('todoListTitle')}</h3>
            <p className="text-sm text-slate-500 mt-1">{t('todoListHint')}</p>
            <ul className="mt-4 space-y-2 text-sm text-slate-700">
              {todoItems.map((item, index) => (
                <li key={`${item}-${index}`} className="flex items-start gap-2">
                  <span className="text-slate-400 mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {bothUploaded && (
          <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200 p-6">
            <h3 className="text-lg font-semibold text-green-900 mb-3">✅ Documents Uploaded</h3>
            <p className="text-sm text-green-800 mb-4">
              Your profile is now 100% complete. You can view sample scheme eligibility results below.
            </p>
            <button
              onClick={() => navigate('/eligibility-results')}
              className="w-full px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
            >
              View Sample Eligibility Results →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
