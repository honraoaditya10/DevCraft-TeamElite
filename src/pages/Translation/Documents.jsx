import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { TopBar } from '../../components/TopBar';

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

  return (
    <div className="min-h-screen text-slate-900 font-poppins app-shell page-shell bg-slate-50">
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
