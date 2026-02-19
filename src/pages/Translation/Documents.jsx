import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { TopBar } from '../../components/TopBar';

const formatFileSize = (bytes) => {
  if (!bytes && bytes !== 0) return '-';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const compressImage = (file) => new Promise((resolve) => {
  if (!file || !file.type.startsWith('image/')) {
    resolve(file);
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      const maxDim = 1600;
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const targetWidth = Math.round(img.width * scale);
      const targetHeight = Math.round(img.height * scale);

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          const newName = file.name.replace(/\.[^.]+$/, '.jpg');
          resolve(new File([blob], newName, { type: 'image/jpeg' }));
        },
        'image/jpeg',
        0.85
      );
    };
    img.onerror = () => resolve(file);
    img.src = reader.result;
  };
  reader.onerror = () => resolve(file);
  reader.readAsDataURL(file);
});

export default function Documents() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  // Document state
  const [incomeFile, setIncomeFile] = useState(null);
  const [casteFile, setCasteFile] = useState(null);

  // Processing state
  const [processingIncome, setProcessingIncome] = useState(false);
  const [processingCaste, setProcessingCaste] = useState(false);
  const [incomeStatus, setIncomeStatus] = useState('');
  const [casteStatus, setCasteStatus] = useState('');
  const [incomeError, setIncomeError] = useState('');
  const [casteError, setCasteError] = useState('');
  const [incomeExtracted, setIncomeExtracted] = useState(null);
  const [casteExtracted, setCasteExtracted] = useState(null);

  const PYTHON_API_URL = import.meta.env.VITE_PYTHON_API_URL || 'http://localhost:8000';

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Load saved documents from localStorage
    const saved = localStorage.getItem('userDocuments');
    if (saved) {
      const data = JSON.parse(saved);
      setIncomeExtracted(data.income);
      setCasteExtracted(data.caste);
    }
  }, [user, navigate]);

  const handleIncomeFileChange = (e) => {
    setIncomeFile(e.target.files?.[0] || null);
  };

  const handleCasteFileChange = (e) => {
    setCasteFile(e.target.files?.[0] || null);
  };

  const uploadDocument = async (file, docType, setProcessing, setStatus, setError, setExtracted) => {
    if (!file) return;

    const docLabel = docType === 'income_certificate' ? 'Income Certificate' : 'Caste Certificate';

    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      setError('PDF uploads are not supported yet. Please upload a clear image (JPG/PNG).');
      setStatus(`❌ Failed to analyze ${docLabel}`);
      return;
    }

    setProcessing(true);
    setStatus(`📸 Analyzing ${docLabel}...`);
    setError('');
    setExtracted(null);

    try {
      setStatus(`🧹 Optimizing ${docLabel} image...`);
      const uploadFile = await compressImage(file);

      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('user_email', user.email);
      formData.append('doc_type', docType);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 180000);

      const response = await fetch(`${PYTHON_API_URL}/api/v2/upload-profile-document`, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const resultData = await response.json();

      if (response.ok) {
        setStatus(`✅ ${docLabel} analyzed successfully!`);
        
        // Extract specific fields based on document type
        const extracted = {
          fileName: file.name,
          uploadedAt: new Date().toISOString(),
          confidence: resultData.confidence,
          data: resultData.extracted_data
        };

        if (docType === 'income_certificate') {
          extracted.annualIncome = resultData.extracted_data?.annual_income || null;
          if (resultData.profile_update?.annualIncome) {
            setUser({ ...user, annualIncome: resultData.profile_update.annualIncome });
          }
        } else if (docType === 'caste_certificate') {
          extracted.category = resultData.extracted_data?.category || null;
          if (resultData.profile_update?.category) {
            setUser({ ...user, category: resultData.profile_update.category });
          }
        }

        setExtracted(extracted);

        // Save to localStorage
        const saved = localStorage.getItem('userDocuments') || '{}';
        const data = JSON.parse(saved);
        data[docType === 'income_certificate' ? 'income' : 'caste'] = extracted;
        localStorage.setItem('userDocuments', JSON.stringify(data));

        const willHaveIncome = docType === 'income_certificate' ? true : !!incomeExtracted;
        const willHaveCaste = docType === 'caste_certificate' ? true : !!casteExtracted;

        if (willHaveIncome && willHaveCaste) {
          setTimeout(() => {
            navigate('/eligibility-results');
          }, 2000);
        }
      } else {
        if (response.status === 429) {
          const errorMsg = resultData.detail || 'Rate limit reached. Please wait 30-60 seconds and try again.';
          setError(errorMsg);
          setStatus(`⏳ ${docLabel} rate limited. Please retry shortly.`);
        } else {
          const errorMsg = resultData.detail?.message || resultData.detail || 'Failed to process document';
          setError(errorMsg);
          setStatus(`❌ Failed to analyze ${docLabel}`);
        }
      }
    } catch (error) {
      const msg = error.name === 'AbortError'
        ? 'Processing took too long. Please try a clearer image or smaller file.'
        : error.message;
      setError(msg);
      setStatus(`❌ Error: ${msg}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleIncomeUpload = async () => {
    await uploadDocument(incomeFile, 'income_certificate', setProcessingIncome, setIncomeStatus, setIncomeError, setIncomeExtracted);
    setIncomeFile(null);
  };

  const handleCasteUpload = async () => {
    await uploadDocument(casteFile, 'caste_certificate', setProcessingCaste, setCasteStatus, setCasteError, setCasteExtracted);
    setCasteFile(null);
  };

  const documentCompletion = [
    incomeExtracted ? 25 : 0,
    casteExtracted ? 25 : 0
  ].reduce((a, b) => a + b, 0);
  const totalCompletion = 50 + documentCompletion; // Base 50% + document completion

  const formatIncome = (value) => {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return 'Not found';
    return numeric.toLocaleString('en-IN');
  };

  return (
    <div className="min-h-screen text-slate-900 font-poppins app-shell page-shell bg-slate-50">
      <TopBar
        title="Document Verification"
        subtitle="Upload your documents to verify eligibility"
        showBack
        backTo="/dashboard"
        showLogout
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Document Completion Progress */}
        <div className="mb-8 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Document Verification Progress</h2>
            <span className="text-3xl font-bold text-blue-900">{totalCompletion}%</span>
          </div>
          <div className="h-3 rounded-full bg-slate-200 overflow-hidden">
            <div
              className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
              style={{ width: `${totalCompletion}%` }}
            />
          </div>
          <p className="text-sm text-slate-600 mt-3">
            {!incomeExtracted && !casteExtracted && '⏳ Upload both documents to unlock eligibility checking'}
            {incomeExtracted && !casteExtracted && '⏳ Please upload your Caste Certificate'}
            {!incomeExtracted && casteExtracted && '⏳ Please upload your Income Certificate'}
            {incomeExtracted && casteExtracted && '✅ Ready! All documents verified'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Income Certificate Upload */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Income Certificate</h3>
                <p className="text-sm text-slate-600">Extract annual income</p>
              </div>
              {incomeExtracted && (
                <div className="text-2xl">✅</div>
              )}
            </div>

            {incomeError && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                {incomeError}
              </div>
            )}

            {incomeStatus && (
              <div className="mb-4 p-3 rounded-lg bg-blue-50 border border-blue-200 text-sm text-blue-700 whitespace-pre-line">
                {incomeStatus}
              </div>
            )}

            {incomeExtracted && (
              <div className="mb-4 p-4 rounded-lg bg-green-50 border border-green-200">
                <p className="text-sm font-semibold text-green-900 mb-2">Extracted Information:</p>
                <div className="space-y-2 text-sm text-green-800">
                  <p>💰 <strong>Annual Income:</strong> ₹{formatIncome(incomeExtracted.annualIncome)}</p>
                  <p>📄 <strong>File:</strong> {incomeExtracted.fileName}</p>
                  <p>🎯 <strong>Confidence:</strong> {Math.round(incomeExtracted.confidence * 100)}%</p>
                </div>
                <button
                  onClick={() => {
                    setIncomeExtracted(null);
                    setIncomeFile(null);
                    const saved = localStorage.getItem('userDocuments') || '{}';
                    const data = JSON.parse(saved);
                    delete data.income;
                    localStorage.setItem('userDocuments', JSON.stringify(data));
                  }}
                  className="mt-3 text-xs text-red-600 hover:text-red-700 font-medium"
                >
                  Remove & Upload Again
                </button>
              </div>
            )}

            {!incomeExtracted && (
              <div className="rounded-xl border-2 border-dashed border-slate-200 p-6">
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleIncomeFileChange}
                  disabled={processingIncome}
                  className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-900 hover:file:bg-blue-100 disabled:opacity-50"
                />
                {incomeFile && (
                  <p className="mt-3 text-sm text-slate-600">
                    📄 {incomeFile.name} ({formatFileSize(incomeFile.size)})
                  </p>
                )}
                <button
                  onClick={handleIncomeUpload}
                  disabled={!incomeFile || processingIncome}
                  className="mt-4 w-full px-4 py-2 rounded-lg bg-blue-900 text-white font-medium hover:bg-blue-800 transition disabled:opacity-50"
                >
                  {processingIncome ? '⏳ Processing...' : '📤 Upload & Analyze'}
                </button>
              </div>
            )}
          </div>

          {/* Caste Certificate Upload */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Caste Certificate</h3>
                <p className="text-sm text-slate-600">Extract category (SC/ST/OBC)</p>
              </div>
              {casteExtracted && (
                <div className="text-2xl">✅</div>
              )}
            </div>

            {casteError && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                {casteError}
              </div>
            )}

            {casteStatus && (
              <div className="mb-4 p-3 rounded-lg bg-blue-50 border border-blue-200 text-sm text-blue-700 whitespace-pre-line">
                {casteStatus}
              </div>
            )}

            {casteExtracted && (
              <div className="mb-4 p-4 rounded-lg bg-green-50 border border-green-200">
                <p className="text-sm font-semibold text-green-900 mb-2">Extracted Information:</p>
                <div className="space-y-2 text-sm text-green-800">
                  <p>📋 <strong>Category:</strong> {casteExtracted.category || 'Not found'}</p>
                  <p>📄 <strong>File:</strong> {casteExtracted.fileName}</p>
                  <p>🎯 <strong>Confidence:</strong> {Math.round(casteExtracted.confidence * 100)}%</p>
                </div>
                <button
                  onClick={() => {
                    setCasteExtracted(null);
                    setCasteFile(null);
                    const saved = localStorage.getItem('userDocuments') || '{}';
                    const data = JSON.parse(saved);
                    delete data.caste;
                    localStorage.setItem('userDocuments', JSON.stringify(data));
                  }}
                  className="mt-3 text-xs text-red-600 hover:text-red-700 font-medium"
                >
                  Remove & Upload Again
                </button>
              </div>
            )}

            {!casteExtracted && (
              <div className="rounded-xl border-2 border-dashed border-slate-200 p-6">
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleCasteFileChange}
                  disabled={processingCaste}
                  className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-900 hover:file:bg-blue-100 disabled:opacity-50"
                />
                {casteFile && (
                  <p className="mt-3 text-sm text-slate-600">
                    📄 {casteFile.name} ({formatFileSize(casteFile.size)})
                  </p>
                )}
                <button
                  onClick={handleCasteUpload}
                  disabled={!casteFile || processingCaste}
                  className="mt-4 w-full px-4 py-2 rounded-lg bg-blue-900 text-white font-medium hover:bg-blue-800 transition disabled:opacity-50"
                >
                  {processingCaste ? '⏳ Processing...' : '📤 Upload & Analyze'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* What Happens Next */}
        {incomeExtracted && casteExtracted && (
          <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200 p-6">
            <h3 className="text-lg font-semibold text-green-900 mb-3">✅ Documents Verified!</h3>
            <p className="text-sm text-green-800 mb-4">
              Your income and caste category have been extracted and verified. 
              Click the button below to check which government schemes you're eligible for.
            </p>
            <button
              onClick={() => navigate('/eligibility-results')}
              className="w-full px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
            >
              Check Eligibility for Schemes →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
