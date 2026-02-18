import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { TopBar } from '../../components/TopBar';

const STORAGE_KEY = 'uploadedDocuments';

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
  const [documents, setDocuments] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setDocuments(JSON.parse(stored));
      }
    } catch {
      setDocuments([]);
    }
  }, [user, navigate]);


  const handleFileChange = (event) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files);
  };

  const handleUpload = () => {
    if (selectedFiles.length === 0) return;

    const newDocs = selectedFiles.map((file) => ({
      id: `${file.name}-${file.lastModified}`,
      name: file.name,
      type: file.type || 'Unknown',
      size: file.size,
      uploadedOn: new Date().toISOString()
    }));

    const updatedDocs = [...newDocs, ...documents];
    setDocuments(updatedDocs);
    setSelectedFiles([]);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDocs));
    } catch {
      // Ignore storage errors.
    }
  };

  const documentRows = useMemo(() => documents, [documents]);

  return (
    <div className="min-h-screen text-slate-900 font-poppins app-shell page-shell">
      <TopBar
        title={t('documentCenter')}
        subtitle={t('documentHint')}
        showBack
        backTo="/dashboard"
        showLogout
      />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <section className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">{t('uploadedDocuments')}</h2>
              <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded-full">
                {documentRows.length}
              </span>
            </div>

            {documentRows.length === 0 ? (
              <div className="mt-4 rounded-xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">
                {t('noDocuments')}
              </div>
            ) : (
              <div className="mt-4 overflow-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-slate-500">
                    <tr>
                      <th className="pb-3">{t('fileName')}</th>
                      <th className="pb-3">{t('fileType')}</th>
                      <th className="pb-3">{t('fileSize')}</th>
                      <th className="pb-3">{t('uploadedOn')}</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-700">
                    {documentRows.map((doc) => (
                      <tr key={doc.id} className="border-t border-slate-100">
                        <td className="py-3 font-medium text-slate-900">{doc.name}</td>
                        <td className="py-3">{doc.type}</td>
                        <td className="py-3">{formatFileSize(doc.size)}</td>
                        <td className="py-3">
                          {new Date(doc.uploadedOn).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <h3 className="text-base font-semibold text-slate-900">{t('uploadNewDocument')}</h3>
            <p className="text-sm text-slate-500 mt-1">
              {t('uploadDocument')}
            </p>
            <div className="mt-4 rounded-xl border border-dashed border-slate-200 p-4">
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-blue-900 hover:file:bg-blue-100"
              />
              {selectedFiles.length > 0 && (
                <ul className="mt-4 space-y-2 text-sm text-slate-600">
                  {selectedFiles.map((file) => (
                    <li key={file.name} className="flex items-center justify-between">
                      <span className="truncate">{file.name}</span>
                      <span className="text-xs text-slate-400">{formatFileSize(file.size)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <button
              onClick={handleUpload}
              disabled={selectedFiles.length === 0}
              className="mt-4 w-full rounded-lg bg-blue-900 text-white py-2 text-sm font-semibold hover:bg-blue-800 transition disabled:opacity-60"
            >
              {t('addDocument')}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
