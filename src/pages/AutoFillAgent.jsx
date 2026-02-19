import { useMemo, useState } from 'react';
import { TopBar } from '../components/TopBar';
import { useAuth } from '../context/AuthContext';

const extractedData = {
  fullName: 'Aarav Mehta',
  dob: '2003-08-22',
  gender: 'Male',
  aadhaar: 'XXXX-XXXX-5522',
  mobile: '+91 98765 43210',
  email: 'aarav.mehta@email.com',
  annualIncome: '185000',
  category: 'OBC',
  institution: 'Govt Polytechnic, Pune',
  course: 'Diploma in Computer Engineering',
  marks: '86.4',
  address: 'Pune, Maharashtra'
};

const dataFields = [
  { key: 'fullName', label: 'Full Name', sample: extractedData.fullName },
  { key: 'dob', label: 'Date of Birth', sample: extractedData.dob },
  { key: 'gender', label: 'Gender', sample: extractedData.gender },
  { key: 'aadhaar', label: 'Aadhaar', sample: extractedData.aadhaar },
  { key: 'mobile', label: 'Mobile', sample: extractedData.mobile },
  { key: 'email', label: 'Email', sample: extractedData.email },
  { key: 'annualIncome', label: 'Annual Income', sample: extractedData.annualIncome },
  { key: 'category', label: 'Category', sample: extractedData.category },
  { key: 'institution', label: 'Institution', sample: extractedData.institution },
  { key: 'course', label: 'Course', sample: extractedData.course },
  { key: 'marks', label: 'Marks %', sample: extractedData.marks },
  { key: 'address', label: 'Address', sample: extractedData.address }
];

const portals = [
  {
    id: 'nsp',
    name: 'National Scholarship Portal',
    accent: '#0f766e',
    description: 'Government scholarship application portal with multi-step forms.',
    fields: [
      { id: 'applicant_name', label: 'Applicant Full Name', type: 'text' },
      { id: 'dob', label: 'Date of Birth', type: 'date' },
      { id: 'gender', label: 'Gender', type: 'select' },
      { id: 'aadhaar', label: 'Aadhaar Number', type: 'text' },
      { id: 'mobile', label: 'Mobile Number', type: 'text' },
      { id: 'email', label: 'Email Address', type: 'email' },
      { id: 'income', label: 'Annual Income', type: 'number' },
      { id: 'category', label: 'Category', type: 'select' },
      { id: 'institution', label: 'Institution Name', type: 'text' }
    ]
  },
  {
    id: 'maha',
    name: 'MahaDBT Scholarship Portal',
    accent: '#7c2d12',
    description: 'State portal with document-first workflow and quick submit.',
    fields: [
      { id: 'student_name', label: 'Student Name', type: 'text' },
      { id: 'dob', label: 'Birth Date', type: 'date' },
      { id: 'course', label: 'Course', type: 'text' },
      { id: 'marks', label: 'Marks %', type: 'number' },
      { id: 'address', label: 'Residential Address', type: 'text' },
      { id: 'email', label: 'Email', type: 'email' },
      { id: 'mobile', label: 'Mobile', type: 'text' },
      { id: 'category', label: 'Category', type: 'select' }
    ]
  }
];

const portalMappings = {
  nsp: {
    applicant_name: 'fullName',
    dob: 'dob',
    gender: 'gender',
    aadhaar: 'aadhaar',
    mobile: 'mobile',
    email: 'email',
    income: 'annualIncome',
    category: 'category',
    institution: 'institution'
  },
  maha: {
    student_name: 'fullName',
    dob: 'dob',
    course: 'course',
    marks: 'marks',
    address: 'address',
    email: 'email',
    mobile: 'mobile',
    category: 'category'
  }
};

const confidenceByField = {
  fullName: 98,
  dob: 96,
  gender: 92,
  aadhaar: 95,
  mobile: 93,
  email: 97,
  annualIncome: 90,
  category: 89,
  institution: 91,
  course: 88,
  marks: 94,
  address: 86
};

const getPortalById = (id) => portals.find((portal) => portal.id === id) || portals[0];

const toTitle = (value) => value.replace(/_/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());

export default function AutoFillAgent() {
  const { user } = useAuth();
  const [selectedPortalId, setSelectedPortalId] = useState(portals[0].id);
  const [mapping, setMapping] = useState(portalMappings[portals[0].id]);
  const [isFilled, setIsFilled] = useState(false);

  const portal = getPortalById(selectedPortalId);

  const mappingCoverage = useMemo(() => {
    const total = portal.fields.length;
    const mapped = portal.fields.filter((field) => Boolean(mapping[field.id])).length;
    return Math.round((mapped / total) * 100);
  }, [portal.fields, mapping]);

  const filledPreview = useMemo(() => {
    const output = {};
    portal.fields.forEach((field) => {
      const dataKey = mapping[field.id];
      output[field.id] = dataKey ? extractedData[dataKey] : '';
    });
    return output;
  }, [portal.fields, mapping]);

  const handlePortalChange = (event) => {
    const nextId = event.target.value;
    setSelectedPortalId(nextId);
    setMapping(portalMappings[nextId]);
    setIsFilled(false);
  };

  const handleMappingChange = (fieldId, dataKey) => {
    setMapping((prev) => ({
      ...prev,
      [fieldId]: dataKey === 'none' ? '' : dataKey
    }));
    setIsFilled(false);
  };

  const handleAutofill = () => {
    setIsFilled(true);
  };

  return (
    <div className="min-h-screen app-shell page-shell text-slate-900 font-urbanist">
      <TopBar
        title="Auto-Fill Agent"
        subtitle="Map extracted data to live application portals in seconds"
        showBack
        backTo={user ? '/dashboard' : '/'}
        showLogout={Boolean(user)}
      />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 left-10 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl" />
          <div className="absolute top-16 right-0 h-96 w-96 rounded-full bg-amber-200/40 blur-3xl" />
          <div className="absolute bottom-0 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-cyan-200/40 blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8">
            <div className="space-y-6">
              <div className="surface-card rounded-3xl p-7 border border-slate-200">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-emerald-700 font-semibold">Live Agent Mode</p>
                    <h2 className="text-3xl font-semibold text-slate-900 mt-2">Portal Autofill, Simplified</h2>
                    <p className="text-sm text-slate-600 mt-2 max-w-xl">
                      Connect your extracted data once. The agent maps fields, verifies confidence, and fills live forms
                      across multiple government portals.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">Agent Ready</span>
                    <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-3 py-1 rounded-full">{mappingCoverage}% mapped</span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { label: 'Capture', value: 'OCR + Docs', detail: 'From scanned forms & PDFs' },
                    { label: 'Map', value: 'Smart Field Match', detail: 'Confidence scored mapping' },
                    { label: 'Fill', value: '1-Click Autofill', detail: 'Live portal submission' }
                  ].map((item) => (
                    <div key={item.label} className="rounded-2xl bg-white border border-slate-100 p-4 shadow-sm">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{item.label}</p>
                      <p className="text-lg font-semibold text-slate-900 mt-2">{item.value}</p>
                      <p className="text-xs text-slate-500 mt-1">{item.detail}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="surface-card rounded-3xl p-6 border border-slate-200">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900">Portal selection</h3>
                    <p className="text-sm text-slate-500">Pick a portal and tailor the field mapping before autofill.</p>
                  </div>
                  <select
                    value={selectedPortalId}
                    onChange={handlePortalChange}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700"
                    style={{ borderColor: portal.accent }}
                  >
                    {portals.map((portalOption) => (
                      <option key={portalOption.id} value={portalOption.id}>
                        {portalOption.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-4 rounded-2xl border border-dashed border-slate-200 p-4 bg-slate-50">
                  <p className="text-sm text-slate-600">{portal.description}</p>
                </div>

                <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800">Extracted data</h4>
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {dataFields.map((field) => (
                        <div key={field.key} className="rounded-2xl bg-white border border-slate-100 p-4">
                          <p className="text-xs uppercase tracking-[0.16em] text-slate-400">{field.label}</p>
                          <p className="text-sm font-semibold text-slate-900 mt-2">{field.sample}</p>
                          <div className="mt-2 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${confidenceByField[field.key] || 88}%`,
                                background: 'linear-gradient(90deg, #10b981, #06b6d4)'
                              }}
                            />
                          </div>
                          <p className="text-xs text-slate-400 mt-1">Confidence {confidenceByField[field.key] || 88}%</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-slate-800">Field mapping</h4>
                    <div className="mt-3 space-y-3">
                      {portal.fields.map((field) => (
                        <div key={field.id} className="rounded-2xl border border-slate-100 bg-white p-4">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{field.label}</p>
                              <p className="text-xs text-slate-400">{toTitle(field.type)} field</p>
                            </div>
                            <select
                              value={mapping[field.id] || 'none'}
                              onChange={(event) => handleMappingChange(field.id, event.target.value)}
                              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700"
                            >
                              <option value="none">No match</option>
                              {dataFields.map((option) => (
                                <option key={option.key} value={option.key}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="mt-3 flex items-center gap-2">
                            <span className="text-xs text-slate-500">Agent suggestion:</span>
                            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                              {mapping[field.id] ? `${mapping[field.id]} matched` : 'Needs review'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        onClick={handleAutofill}
                        className="px-5 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition"
                      >
                        Run Autofill
                      </button>
                      <button
                        onClick={() => setIsFilled(false)}
                        className="px-5 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                      >
                        Reset Preview
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="surface-card rounded-3xl p-6 border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Extension Status</p>
                    <h3 className="text-xl font-semibold text-slate-900">Auto-Fill Agent</h3>
                  </div>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">Connected</span>
                </div>

                <div className="mt-4 space-y-3 text-sm text-slate-600">
                  <div className="flex items-start gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
                    <p>Extension is synced with your document vault.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
                    <p>Form schemas cached for 14 government portals.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
                    <p>Auto-submit disabled by default for safety.</p>
                  </div>
                </div>

                <button className="mt-5 w-full rounded-xl bg-emerald-600 text-white text-sm font-semibold py-2 hover:bg-emerald-500 transition">
                  Install Browser Companion
                </button>
              </div>

              <div className="surface-card rounded-3xl p-6 border border-slate-200">
                <h3 className="text-xl font-semibold text-slate-900">Live portal preview</h3>
                <p className="text-sm text-slate-500 mt-1">A safe sandbox view of the live form with your mapped values.</p>

                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                  {portal.fields.map((field) => (
                    <div key={field.id} className="grid grid-cols-[1fr_1.2fr] gap-3 items-center">
                      <span className="text-xs text-slate-500">{field.label}</span>
                      <input
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700"
                        value={isFilled ? filledPreview[field.id] : ''}
                        placeholder={isFilled ? '' : 'Waiting for autofill...'}
                        readOnly
                      />
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                  <span>Autofill mode: {isFilled ? 'Active' : 'Standby'}</span>
                  <span>Portal schema version 2.6</span>
                </div>
              </div>

              <div className="surface-card rounded-3xl p-6 border border-slate-200">
                <h3 className="text-xl font-semibold text-slate-900">Export mapping</h3>
                <p className="text-sm text-slate-500 mt-1">Use this JSON to sync with the browser extension.</p>
                <pre className="mt-4 rounded-2xl bg-slate-900 text-slate-100 text-xs p-4 overflow-x-auto">
{JSON.stringify({ portal: portal.name, mapping }, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
