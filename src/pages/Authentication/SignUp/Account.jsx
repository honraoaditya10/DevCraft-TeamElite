

import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import StudentAccount from './StudentAccount';
import NormalUserAccount from './NormalUserAccount';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';

export default function Account() {
  const { setUser } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) 
      newErrors.password = 'Password must be at least 8 characters';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (formData.password !== formData.confirmPassword) 
      newErrors.confirmPassword = 'Passwords do not match';
    if (!formData.role) newErrors.role = 'Please select your role';
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          role: formData.role
        })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Signup failed');
      }

      setUser(data.user);
      setSubmitted(true);
    } catch (error) {
      setFormError(error.message || 'Signup failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If user selected Student role, show StudentAccount form
  if (submitted && formData.role === 'student') {
    return <StudentAccount />;
  }

  // If user selected Normal User role, show NormalUserAccount form
  if (submitted && formData.role === 'normalUser') {
    return <NormalUserAccount />;
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-slate-900 font-poppins flex items-center justify-center p-4 overflow-y-auto py-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="w-10 h-10 bg-blue-900 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">DA</span>
              </div>
              <h1 className="text-2xl font-bold text-blue-900">Docu-Agent</h1>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Account</h2>
            <p className="text-slate-600 text-sm">Join our platform and start your journey</p>
          </div>

          {/* Form */}
          {formError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
              {formError}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-semibold text-gray-800 mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 transition text-sm ${
                  errors.fullName ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50'
                }`}
              />
              {errors.fullName && <p className="text-red-600 text-xs mt-1">{errors.fullName}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-800 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 transition text-sm ${
                  errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50'
                }`}
              />
              {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-800 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 transition pr-10 text-sm ${
                    errors.password ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700 text-sm"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {errors.password && <p className="text-red-600 text-xs mt-1">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-800 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Re-enter password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 transition pr-10 text-sm ${
                    errors.confirmPassword ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700 text-sm"
                >
                  {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-600 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>

            {/* Select Your Role */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                Select Your Role
              </label>
              <div className="space-y-2">
                <label className="flex items-center cursor-pointer p-3 border border-gray-300 rounded-lg hover:bg-blue-50 transition">
                  <input
                    type="radio"
                    name="role"
                    value="student"
                    checked={formData.role === 'student'}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-900 cursor-pointer"
                  />
                  <span className="ml-3 text-sm font-medium text-gray-800">🎓 Student</span>
                </label>
                <label className="flex items-center cursor-pointer p-3 border border-gray-300 rounded-lg hover:bg-blue-50 transition">
                  <input
                    type="radio"
                    name="role"
                    value="normalUser"
                    checked={formData.role === 'normalUser'}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-900 cursor-pointer"
                  />
                  <span className="ml-3 text-sm font-medium text-gray-800">👤 Normal User</span>
                </label>
              </div>
              {errors.role && <p className="text-red-600 text-xs mt-1">{errors.role}</p>}
            </div>

            {/* Create Account Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-900 text-white font-semibold py-2.5 rounded-lg hover:bg-blue-800 transition duration-200 text-sm mt-6 shadow-sm disabled:opacity-70"
            >
              {isSubmitting ? 'Creating...' : 'Create Account'}
            </button>
          </form>

          {/* Sign In Link */}
          <p className="text-center text-slate-600 text-sm mt-6">
            Already have an account? <a href="/login" className="text-blue-900 font-semibold hover:text-blue-800">Sign in</a>
          </p>
        </div>
      </div>
    </div>
  );
}

