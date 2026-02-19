import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8001';
const API_URL = API_BASE.endsWith('/api') ? API_BASE : `${API_BASE}/api`;

const sections = [
  'Overview',
  'Scheme Management',
  'Rule Builder',
  'AI Extraction Review',
  'Users',
  'Document Monitoring',
  'Analytics',
  'Notifications',
  'Settings'
];

// Default data - will be replaced by API data
const defaultAnalytics = [
  { label: 'Total Schemes', value: '0' },
  { label: 'Active Users', value: '0' },
  { label: 'Published Schemes', value: '0' },
  { label: 'Total Matches', value: '0' }
];

const defaultActivity = [
  { title: 'No activity yet', detail: 'Create your first scheme to get started', time: 'Just now' }
];

const userRows = [
  { name: 'Prajwal Jadhav', email: 'prajwal@gmail.com', role: 'Student', status: 'Active' },
  { name: 'Ananya Singh', email: 'ananya@gmail.com', role: 'Student', status: 'Pending' },
  { name: 'Rajesh Kumar', email: 'rajesh@gmail.com', role: 'Parent', status: 'Active' }
];

const documentRows = [
  { doc: 'Income Certificate', pending: 18, verified: 120, flagged: 3 },
  { doc: 'Caste Certificate', pending: 12, verified: 85, flagged: 1 },
  { doc: 'Aadhaar', pending: 5, verified: 210, flagged: 0 }
];

const aiExtractedRules = [
  {
    scheme: 'Post-Matric Scholarship',
    rules: ['Income < 8,00,000', 'Class 11 or above', 'State domicile required']
  },
  {
    scheme: 'Minority Scheme',
    rules: ['Minority category', 'Income < 6,00,000', 'Age 17-25']
  }
];

const usageSeries = [70, 50, 90, 60, 80, 65, 95];

const OverviewSection = ({ analytics, activity }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {analytics.map((card) => (
        <div
          key={card.label}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <p className="text-sm text-slate-500">{card.label}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{card.value}</p>
        </div>
      ))}
    </div>
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-900">Recent Activity</h3>
      </div>
      <div className="mt-4 space-y-4">
        {activity.length > 0 ? activity.map((item, idx) => (
          <div key={idx} className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-800">{item.title}</p>
              <p className="text-xs text-slate-500">{item.detail}</p>
            </div>
            <span className="text-xs text-slate-400">{item.time}</span>
          </div>
        )) : (
          <p className="text-sm text-slate-500">No recent activity</p>
        )}
      </div>
    </div>
  </div>
);

const SchemeManagementSection = ({ schemes, onAddScheme, onViewStudents, onDeleteScheme, loading }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-center justify-between">
      <h3 className="text-base font-semibold text-slate-900">Schemes</h3>
      <button
        type="button"
        onClick={onAddScheme}
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
      >
        Add Scheme
      </button>
    </div>
    <div className="mt-4 overflow-auto">
      {loading ? (
        <p className="text-sm text-slate-500 py-4">Loading schemes...</p>
      ) : schemes.length === 0 ? (
        <p className="text-sm text-slate-500 py-4">No schemes yet. Create your first scheme!</p>
      ) : (
        <table className="w-full text-sm">
          <thead className="text-left text-slate-500">
            <tr>
              <th className="pb-3">Scheme</th>
              <th className="pb-3">Department</th>
              <th className="pb-3">State</th>
              <th className="pb-3">Status</th>
              <th className="pb-3">Deadline</th>
              <th className="pb-3">Matched</th>
              <th className="pb-3">Actions</th>
            </tr>
          </thead>
          <tbody className="text-slate-700">
            {schemes.map((row) => (
              <tr key={row.id} className="border-t border-slate-100">
                <td className="py-3 font-medium text-slate-900">{row.name}</td>
                <td className="py-3">{row.department}</td>
                <td className="py-3">{row.state}</td>
                <td className="py-3">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      row.status === 'Published'
                        ? 'bg-emerald-50 text-emerald-700'
                        : row.status === 'Draft'
                        ? 'bg-slate-50 text-slate-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {row.status}
                  </span>
                </td>
                <td className="py-3">{row.deadline}</td>
                <td className="py-3">
                  <button 
                    onClick={() => onViewStudents(row.id)}
                    className="text-indigo-600 hover:underline"
                  >
                    {row.matchedStudents} students
                  </button>
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => onDeleteScheme(row.id)}
                      className="text-rose-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  </div>
);

const AddSchemeSection = ({ onCancel, onSchemeCreated, userEmail }) => {
  const [formData, setFormData] = useState({
    schemeName: '',
    department: '',
    schemeType: 'Scholarship',
    region: 'Central',
    state: '',
    website: '',
    deadline: '',
    description: ''
  });
  const [errors, setErrors] = useState({});
  const [uploadedFile, setUploadedFile] = useState(null);
  const [autoExtract, setAutoExtract] = useState(true);
  const [status, setStatus] = useState('Draft');
  const [visibility, setVisibility] = useState('Public');
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [conditions, setConditions] = useState([
    {
      id: 1,
      joiner: 'AND',
      rows: [{ id: 1, field: 'Annual Income', operator: 'Less Than', value: '' }]
    }
  ]);
  const [requiredDocs, setRequiredDocs] = useState({
    income: true,
    caste: false,
    domicile: false,
    aadhaar: true,
    marksheet: false,
    bank: false
  });

  const fieldOptions = [
    'Category',
    'Annual Income',
    'Education Level',
    'Gender',
    'State',
    'Minority Status',
    'Disability Status',
    'Institution Type',
    'Marks Percentage',
    'Age'
  ];

  const operatorOptions = [
    'Equals',
    'Not Equals',
    'Less Than',
    'Greater Than',
    'Between',
    'Includes'
  ];

  const valueOptionsByField = {
    Category: ['General', 'OBC', 'SC', 'ST'],
    'Education Level': ['10th', '12th', 'Diploma', 'UG', 'PG'],
    Gender: ['Male', 'Female', 'Other'],
    State: ['All India', 'Maharashtra', 'Karnataka', 'Gujarat', 'Delhi'],
    'Minority Status': ['Yes', 'No'],
    'Disability Status': ['No Disability', 'Physical', 'Visual', 'Hearing', 'Other'],
    'Institution Type': ['Government', 'Private']
  };

  const numericFields = ['Annual Income', 'Marks Percentage', 'Age'];

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleAddCondition = (groupId) => {
    setConditions((prev) =>
      prev.map((group) =>
        group.id === groupId
          ? {
              ...group,
              rows: [
                ...group.rows,
                {
                  id: group.rows.length + 1,
                  field: 'Annual Income',
                  operator: 'Less Than',
                  value: ''
                }
              ]
            }
          : group
      )
    );
  };

  const handleAddGroup = () => {
    setConditions((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        joiner: 'OR',
        rows: [{ id: 1, field: 'Category', operator: 'Equals', value: 'OBC' }]
      }
    ]);
  };

  const updateCondition = (groupId, rowId, key, value) => {
    setConditions((prev) =>
      prev.map((group) => {
        if (group.id !== groupId) return group;
        return {
          ...group,
          rows: group.rows.map((row) =>
            row.id === rowId ? { ...row, [key]: value } : row
          )
        };
      })
    );
  };

  const ruleSummary = conditions
    .map((group) => {
      const groupSummary = group.rows
        .map((row) => `${row.field} ${row.operator} ${row.value || '...'}`)
        .join(` ${group.joiner} `);
      return `(${groupSummary})`;
    })
    .join(' AND ');

  const validateRequired = () => {
    const newErrors = {};
    if (!formData.schemeName.trim()) newErrors.schemeName = 'Scheme name is required';
    if (!formData.department.trim()) newErrors.department = 'Department is required';
    if (!formData.deadline) newErrors.deadline = 'Deadline is required';
    if (formData.region === 'State Specific' && !formData.state.trim()) {
      newErrors.state = 'State is required for state-specific schemes';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePublish = () => {
    if (!validateRequired()) return;
    setShowPublishModal(true);
  };

  const handleConfirmPublish = async () => {
    setShowPublishModal(false);
    setSaving(true);

    try {
      console.log('Publishing scheme with userEmail:', userEmail);
      
      const schemeData = {
        schemeName: formData.schemeName,
        department: formData.department,
        schemeType: formData.schemeType,
        region: formData.region,
        state: formData.state,
        website: formData.website,
        deadline: new Date(formData.deadline),
        description: formData.description,
        conditions,
        requiredDocs,
        status: 'Published',
        visibility,
        autoExtract
      };

      console.log('Scheme data to send:', schemeData);
      console.log('Posting to:', `${API_URL}/admin/schemes?email=${userEmail}`);

      const response = await fetch(`${API_URL}/admin/schemes?email=${userEmail}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(schemeData)
      });

      console.log('Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('Server error response:', errorData);
        throw new Error(errorData.message || 'Failed to create scheme');
      }

      const data = await response.json();
      alert('Scheme published successfully!');
      onSchemeCreated();
      onCancel();
    } catch (error) {
      console.error('Publish error:', error);
      alert(`Failed to publish scheme: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900">Basic Scheme Information</h3>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex flex-col gap-2">
            <label className="text-slate-600">Scheme Name</label>
            <input
              type="text"
              placeholder="Enter scheme title"
              value={formData.schemeName}
              onChange={(event) => handleFormChange('schemeName', event.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.schemeName && <p className="text-xs text-rose-600">{errors.schemeName}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-slate-600">Department / Ministry</label>
            <input
              type="text"
              placeholder="Ministry of Social Justice"
              value={formData.department}
              onChange={(event) => handleFormChange('department', event.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.department && <p className="text-xs text-rose-600">{errors.department}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-slate-600">Scheme Type</label>
            <select
              value={formData.schemeType}
              onChange={(event) => handleFormChange('schemeType', event.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2"
            >
              {['Scholarship', 'Subsidy', 'Fellowship', 'Loan Support', 'Pension', 'Other'].map(
                (option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                )
              )}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-slate-600">Applicable Region</label>
            <select
              value={formData.region}
              onChange={(event) => handleFormChange('region', event.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2"
            >
              {['Central (All India)', 'State Specific'].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          {formData.region === 'State Specific' && (
            <div className="flex flex-col gap-2">
              <label className="text-slate-600">State Selector</label>
              <input
                type="text"
                placeholder="Enter state"
                value={formData.state}
                onChange={(event) => handleFormChange('state', event.target.value)}
                className="rounded-lg border border-slate-200 px-3 py-2"
              />
              {errors.state && <p className="text-xs text-rose-600">{errors.state}</p>}
            </div>
          )}
          <div className="flex flex-col gap-2">
            <label className="text-slate-600">Official Website URL</label>
            <input
              type="url"
              placeholder="https://"
              value={formData.website}
              onChange={(event) => handleFormChange('website', event.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-slate-600">Application Deadline</label>
            <input
              type="date"
              value={formData.deadline}
              onChange={(event) => handleFormChange('deadline', event.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2"
            />
            {errors.deadline && <p className="text-xs text-rose-600">{errors.deadline}</p>}
          </div>
          <div className="md:col-span-2 flex flex-col gap-2">
            <label className="text-slate-600">Short Description</label>
            <textarea
              rows="3"
              value={formData.description}
              onChange={(event) => handleFormChange('description', event.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2"
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900">Upload Official Documents</h3>
        <div className="mt-4 flex flex-col gap-3 text-sm">
          <label className="text-slate-600">Upload Official Scheme Document</label>
          <input
            type="file"
            onChange={(event) => setUploadedFile(event.target.files?.[0] || null)}
            className="rounded-lg border border-slate-200 px-3 py-2"
          />
          {uploadedFile && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600 flex items-center justify-between">
              <span>{uploadedFile.name}</span>
              <div className="flex items-center gap-3">
                <button className="text-indigo-600" type="button">
                  Replace
                </button>
                <button
                  className="text-rose-600"
                  type="button"
                  onClick={() => setUploadedFile(null)}
                >
                  Remove
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900">Eligibility Rule Builder</h3>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAddGroup}
              className="rounded-lg border border-indigo-200 px-3 py-1.5 text-sm text-indigo-600"
            >
              Add Condition Group
            </button>
          </div>
        </div>
        <div className="mt-4 space-y-4">
          {conditions.map((group) => (
            <div key={group.id} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase text-slate-500">
                  Group {group.id} ({group.joiner})
                </p>
                <button
                  type="button"
                  onClick={() => handleAddCondition(group.id)}
                  className="text-xs text-indigo-600"
                >
                  Add Condition
                </button>
              </div>
              <div className="mt-3 space-y-3">
                {group.rows.map((row) => (
                  <div key={row.id} className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <select
                      value={row.field}
                      onChange={(event) => updateCondition(group.id, row.id, 'field', event.target.value)}
                      className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    >
                      {fieldOptions.map((field) => (
                        <option key={field} value={field}>
                          {field}
                        </option>
                      ))}
                    </select>
                    <select
                      value={row.operator}
                      onChange={(event) => updateCondition(group.id, row.id, 'operator', event.target.value)}
                      className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    >
                      {operatorOptions.map((operator) => (
                        <option key={operator} value={operator}>
                          {operator}
                        </option>
                      ))}
                    </select>
                    {valueOptionsByField[row.field] ? (
                      <select
                        value={row.value}
                        onChange={(event) => updateCondition(group.id, row.id, 'value', event.target.value)}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      >
                        <option value="">Select</option>
                        {valueOptionsByField[row.field].map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={numericFields.includes(row.field) ? 'number' : 'text'}
                        value={row.value}
                        onChange={(event) => updateCondition(group.id, row.id, 'value', event.target.value)}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                        placeholder="Enter value"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div className="rounded-lg border border-dashed border-slate-200 bg-white p-4 text-xs text-slate-500">
            Rule summary: {ruleSummary}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900">Required Documents</h3>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-600">
          {[
            { key: 'income', label: 'Income Certificate' },
            { key: 'caste', label: 'Caste Certificate' },
            { key: 'domicile', label: 'Domicile' },
            { key: 'aadhaar', label: 'Aadhaar' },
            { key: 'marksheet', label: 'Marksheet' },
            { key: 'bank', label: 'Bank Passbook' }
          ].map((doc) => (
            <label key={doc.key} className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2">
              <input
                type="checkbox"
                checked={requiredDocs[doc.key]}
                onChange={() =>
                  setRequiredDocs((prev) => ({ ...prev, [doc.key]: !prev[doc.key] }))
                }
              />
              {doc.label}
            </label>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900">AI Extraction</h3>
            <p className="text-sm text-slate-500">
              Auto-extract eligibility rules from uploaded documents.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setAutoExtract((prev) => !prev)}
            className={`relative h-7 w-12 rounded-full transition ${
              autoExtract ? 'bg-indigo-600' : 'bg-slate-200'
            }`}
          >
            <span
              className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                autoExtract ? 'left-6' : 'left-1'
              }`}
            />
          </button>
        </div>
        {autoExtract && (
          <div className="mt-3 rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-2 text-sm text-indigo-700">
            AI will analyze the document and suggest eligibility rules for review.
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900">Scheme Status Controls</h3>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex flex-col gap-2">
            <label className="text-slate-600">Status</label>
            <div className="flex items-center gap-2">
              {['Draft', 'Active', 'Archived'].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setStatus(option)}
                  className={`rounded-lg px-3 py-2 text-sm ${
                    status === option
                      ? 'bg-indigo-600 text-white'
                      : 'border border-slate-200 text-slate-600'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-slate-600">Visibility</label>
            <div className="flex items-center gap-2">
              {['Public', 'Restricted (Pilot Mode)'].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setVisibility(option)}
                  className={`rounded-lg px-3 py-2 text-sm ${
                    visibility === option
                      ? 'bg-indigo-600 text-white'
                      : 'border border-slate-200 text-slate-600'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="sticky bottom-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-slate-500">All changes are saved locally. You can edit later.</p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm"
            >
              Cancel
            </button>
            <button className="rounded-lg border border-indigo-200 px-4 py-2 text-sm text-indigo-600">
              Save as Draft
            </button>
            <button
              type="button"
              onClick={handlePublish}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
            >
              Publish Scheme
            </button>
          </div>
        </div>
      </div>

      {showPublishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-slate-900">Publish Scheme?</h3>
            <p className="mt-2 text-sm text-slate-600">
              Please confirm that all required fields and eligibility rules are correct before publishing.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowPublishModal(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPublish}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
              >
                Confirm Publish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const RuleBuilderSection = () => {
  const [conditions, setConditions] = useState([
    { field: 'Income', operator: '<', value: '800000' }
  ]);

  const fields = ['Income', 'Age', 'Category', 'State', 'Percentage'];
  const operators = ['<', '<=', '>', '>=', '=', '!='];

  const updateCondition = (index, key, value) => {
    setConditions((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [key]: value } : item))
    );
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-900">Rule Builder</h3>
        <button
          onClick={() => setConditions((prev) => [...prev, { field: 'Income', operator: '<', value: '' }])}
          className="rounded-lg border border-indigo-200 px-3 py-1.5 text-sm text-indigo-600"
        >
          Add Condition
        </button>
      </div>
      <div className="mt-4 space-y-3">
        {conditions.map((condition, index) => (
          <div key={`${condition.field}-${index}`} className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <select
              value={condition.field}
              onChange={(event) => updateCondition(index, 'field', event.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              {fields.map((field) => (
                <option key={field} value={field}>
                  {field}
                </option>
              ))}
            </select>
            <select
              value={condition.operator}
              onChange={(event) => updateCondition(index, 'operator', event.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              {operators.map((operator) => (
                <option key={operator} value={operator}>
                  {operator}
                </option>
              ))}
            </select>
            <input
              value={condition.value}
              onChange={(event) => updateCondition(index, 'value', event.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-end">
        <button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500">
          Save Rules
        </button>
      </div>
    </div>
  );
};

const AiReviewSection = () => (
  <div className="space-y-4">
    {aiExtractedRules.map((item) => (
      <div key={item.scheme} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900">{item.scheme}</h3>
          <div className="flex items-center gap-2">
            <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm">Edit</button>
            <button className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm text-emerald-700">
              Approve
            </button>
            <button className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-sm text-rose-700">
              Reject
            </button>
          </div>
        </div>
        <ul className="mt-3 space-y-2 text-sm text-slate-600">
          {item.rules.map((rule) => (
            <li key={rule}>• {rule}</li>
          ))}
        </ul>
      </div>
    ))}
  </div>
);

const UsersSection = () => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-center justify-between">
      <h3 className="text-base font-semibold text-slate-900">Users</h3>
      <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm">Export</button>
    </div>
    <div className="mt-4 overflow-auto">
      <table className="w-full text-sm">
        <thead className="text-left text-slate-500">
          <tr>
            <th className="pb-3">Name</th>
            <th className="pb-3">Email</th>
            <th className="pb-3">Role</th>
            <th className="pb-3">Status</th>
          </tr>
        </thead>
        <tbody className="text-slate-700">
          {userRows.map((row) => (
            <tr key={row.email} className="border-t border-slate-100">
              <td className="py-3 font-medium text-slate-900">{row.name}</td>
              <td className="py-3">{row.email}</td>
              <td className="py-3">{row.role}</td>
              <td className="py-3">
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                    row.status === 'Active'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  {row.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const DocumentMonitoringSection = () => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-center justify-between">
      <h3 className="text-base font-semibold text-slate-900">Document Monitoring</h3>
      <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm">Review Queue</button>
    </div>
    <div className="mt-4 overflow-auto">
      <table className="w-full text-sm">
        <thead className="text-left text-slate-500">
          <tr>
            <th className="pb-3">Document</th>
            <th className="pb-3">Pending</th>
            <th className="pb-3">Verified</th>
            <th className="pb-3">Flagged</th>
          </tr>
        </thead>
        <tbody className="text-slate-700">
          {documentRows.map((row) => (
            <tr key={row.doc} className="border-t border-slate-100">
              <td className="py-3 font-medium text-slate-900">{row.doc}</td>
              <td className="py-3">{row.pending}</td>
              <td className="py-3">{row.verified}</td>
              <td className="py-3">{row.flagged}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const AnalyticsSection = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-base font-semibold text-slate-900">Scheme Usage</h3>
      <div className="mt-4 space-y-3">
        {usageSeries.map((value, index) => (
          <div key={`usage-${index}`} className="flex items-center gap-3">
            <span className="text-xs text-slate-500">Week {index + 1}</span>
            <div className="h-2 flex-1 rounded-full bg-slate-100">
              <div className="h-2 rounded-full bg-indigo-500" style={{ width: `${value}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-base font-semibold text-slate-900">Eligibility Trend</h3>
      <div className="mt-4 grid grid-cols-4 gap-3">
        {usageSeries.map((value, index) => (
          <div key={`trend-${index}`} className="flex flex-col items-center gap-2">
            <div className="h-20 w-full rounded-lg bg-indigo-50 flex items-end">
              <div
                className="w-full rounded-lg bg-indigo-500"
                style={{ height: `${value}%` }}
              />
            </div>
            <span className="text-xs text-slate-500">W{index + 1}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const PlaceholderSection = ({ title, description }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
    <h3 className="text-base font-semibold text-slate-900">{title}</h3>
    <p className="mt-2">{description}</p>
  </div>
);

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('Overview');
  const [showAddScheme, setShowAddScheme] = useState(false);
  const [schemes, setSchemes] = useState([]);
  const [analytics, setAnalytics] = useState(defaultAnalytics);
  const [activity, setActivity] = useState(defaultActivity);
  const [loading, setLoading] = useState(true);
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [selectedSchemeStudents, setSelectedSchemeStudents] = useState([]);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
    } else {
      fetchAdminData();
    }
  }, [user, navigate]);

  const fetchAdminData = async () => {
    if (!user?.email) return;
    
    try {
      setLoading(true);
      
      // Fetch schemes
      const schemesRes = await fetch(`${API_URL}/admin/schemes?email=${user.email}`);
      if (schemesRes.ok) {
        const schemesData = await schemesRes.json();
        setSchemes(schemesData.schemes || []);
      }

      // Fetch analytics
      const analyticsRes = await fetch(`${API_URL}/admin/analytics?email=${user.email}`);
      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json();
        setAnalytics([
          { label: 'Total Schemes', value: String(analyticsData.totalSchemes || 0) },
          { label: 'Active Users', value: String(analyticsData.activeUsers || 0) },
          { label: 'Published Schemes', value: String(analyticsData.activeSchemes || 0) },
          { label: 'Total Users', value: String(analyticsData.totalUsers || 0) }
        ]);
        setActivity(analyticsData.activity || defaultActivity);
      }
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewStudents = async (schemeId) => {
    try {
      const response = await fetch(`${API_URL}/admin/schemes/${schemeId}/students?email=${user.email}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedSchemeStudents(data.students || []);
        setShowStudentsModal(true);
      }
    } catch (error) {
      console.error('Failed to fetch students:', error);
      alert('Failed to load students');
    }
  };

  const handleDeleteScheme = async (schemeId) => {
    if (!confirm('Are you sure you want to delete this scheme?')) return;
    
    try {
      const response = await fetch(`${API_URL}/admin/schemes/${schemeId}?email=${user.email}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        alert('Scheme deleted successfully');
        fetchAdminData();
      } else {
        throw new Error('Failed to delete');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete scheme');
    }
  };

  const content = useMemo(() => {
    switch (activeSection) {
      case 'Overview':
        return <OverviewSection analytics={analytics} activity={activity} />;
      case 'Scheme Management':
        return (
          <div className="space-y-6">
            <SchemeManagementSection 
              schemes={schemes}
              loading={loading}
              onAddScheme={() => setShowAddScheme(true)}
              onViewStudents={handleViewStudents}
              onDeleteScheme={handleDeleteScheme}
            />
            {showAddScheme && (
              <AddSchemeSection 
                userEmail={user?.email}
                onCancel={() => setShowAddScheme(false)}
                onSchemeCreated={fetchAdminData}
              />
            )}
          </div>
        );
      case 'Rule Builder':
        return <RuleBuilderSection />;
      case 'AI Extraction Review':
        return <AiReviewSection />;
      case 'Users':
        return <UsersSection />;
      case 'Document Monitoring':
        return <DocumentMonitoringSection />;
      case 'Analytics':
        return <AnalyticsSection />;
      case 'Notifications':
        return (
          <PlaceholderSection
            title="Notifications"
            description="Monitor alerts for new submissions, deadline changes, and system updates."
          />
        );
      case 'Settings':
        return (
          <PlaceholderSection
            title="Settings"
            description="Configure admin preferences, roles, and approval workflows."
          />
        );
      default:
        return <OverviewSection analytics={analytics} activity={activity} />;
    }
  }, [activeSection, showAddScheme, schemes, analytics, activity, loading, user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-poppins">
      <div className="flex min-h-screen">
        <aside className="w-64 border-r border-slate-200 bg-white px-5 py-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-semibold">
              DA
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Docu-Agent</p>
              <p className="text-xs text-slate-500">Admin Console</p>
            </div>
          </div>
          <nav className="mt-8 flex flex-col gap-2 text-sm">
            {sections.map((item) => (
              <button
                key={item}
                onClick={() => setActiveSection(item)}
                className={`rounded-lg px-3 py-2 text-left transition ${
                  activeSection === item
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {item}
              </button>
            ))}
            <button
              onClick={handleLogout}
              className="rounded-lg px-3 py-2 text-left text-rose-600 hover:bg-rose-50"
            >
              Logout
            </button>
          </nav>
        </aside>

        <main className="flex-1 px-6 py-6">
          <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Admin Dashboard</p>
              <h1 className="text-2xl font-semibold text-slate-900">{activeSection}</h1>
            </div>
            <div className="flex items-center gap-3">
              <button className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
                Notifications
              </button>
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm">
                <div className="h-8 w-8 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                  A
                </div>
                <span className="text-slate-700">Admin</span>
              </div>
            </div>
          </header>

          <section className="mt-6">{content}</section>

          {/* Students Modal */}
          {showStudentsModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"  onClick={() => setShowStudentsModal(false)}>
              <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900">Matched Students</h3>
                  <button
                    type="button"
                    onClick={() => setShowStudentsModal(false)}
                    className="rounded-lg p-2 hover:bg-slate-100"
                  >
                    ✕
                  </button>
                </div>
                {selectedSchemeStudents.length === 0 ? (
                  <p className="text-sm text-slate-500 py-4">No students matched yet</p>
                ) : (
                  <div className="overflow-auto max-h-96">
                    <table className="w-full text-sm">
                      <thead className="text-left text-slate-500">
                        <tr>
                          <th className="pb-3">Name</th>
                          <th className="pb-3">Email</th>
                          <th className="pb-3">State</th>
                          <th className="pb-3">Role</th>
                        </tr>
                      </thead>
                      <tbody className="text-slate-700">
                        {selectedSchemeStudents.map((student) => (
                          <tr key={student._id} className="border-t border-slate-100">
                            <td className="py-3 font-medium text-slate-900">{student.fullName}</td>
                            <td className="py-3">{student.email}</td>
                            <td className="py-3">{student.state || 'N/A'}</td>
                            <td className="py-3">
                              <span className="rounded-full px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700">
                                {student.role}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowStudentsModal(false)}
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
