import { useState } from 'react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email is invalid';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      console.log('Login attempt:', { email, password });
      alert('Login successful!');
      setEmail('');
      setPassword('');
      setErrors({});
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="flex gap-6 bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Left Section - Form */}
          <div className="w-full lg:w-1/2 p-8 lg:p-12">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">DA</span>
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">Docu-Agent</h1>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
              <p className="text-gray-600">Please enter your details to access your dashboard</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-800 mb-2">Email</label>
                <input
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors({ ...errors, email: '' });
                  }}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition text-sm ${
                    errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50'
                  }`}
                />
                {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-800 mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors({ ...errors, password: '' });
                    }}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition pr-10 text-sm ${
                      errors.password ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-gray-500 text-sm"
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                {errors.password && <p className="text-red-600 text-xs mt-1">{errors.password}</p>}
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center cursor-pointer">
                  <input type="checkbox" className="w-4 h-4" />
                  <span className="ml-2 text-gray-700">Remember me</span>
                </label>
                <a href="#" className="text-blue-600 font-semibold hover:text-blue-700">Forgot Password?</a>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-lg hover:bg-blue-700 transition duration-200 text-sm"
              >
                Log In
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center my-5">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="px-3 text-gray-500 font-medium text-xs">or</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            {/* Google Button */}
            <button className="w-full border border-gray-300 text-gray-700 font-semibold py-2.5 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2 text-sm">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M23.745 12.27c0-.79-.07-1.54-.216-2.29H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.85c2.27-2.09 3.57-5.17 3.57-8.79z" fill="#4285F4"/>
                <path d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.85-3c-1.08.72-2.45 1.13-4.08 1.13-3.13 0-5.78-2.11-6.73-4.96h-3.98v3.09C3.05 21.3 7.31 24 12 24z" fill="#34A853"/>
                <path d="M5.27 14.26c-.48-1.45-.76-2.99-.76-4.26s.27-2.81.76-4.26V2.65h-3.98A11.966 11.966 0 000 12c0 1.93.418 3.86 1.29 5.65l3.98-3.09z" fill="#FBBC05"/>
                <path d="M12 4.75c1.77 0 3.35.64 4.6 1.88l3.45-3.45C17.95 1.27 15.24 0 12 0 7.31 0 3.05 2.7 1.29 6.65l3.98 3.1c.95-2.85 3.6-4.95 6.73-4.95z" fill="#EA4335"/>
              </svg>
              Login with Google
            </button>

            {/* Sign Up Link */}
            <p className="text-center text-gray-600 text-sm mt-6">
              Don't have an account? <a href="/signup" className="text-blue-600 font-semibold hover:text-blue-700">Sign up</a>
            </p>
          </div>

          {/* Right Section - Image */}
          <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-gray-700 to-gray-900 relative overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=800&fit=crop" 
              alt="Team" 
              className="w-full h-full object-cover opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
            <div className="absolute top-6 right-6 bg-white bg-opacity-20 p-3 rounded-full cursor-pointer hover:bg-opacity-30 transition">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white px-6">
                <h3 className="text-3xl font-bold mb-4">Your Career Growth Starts Here</h3>
                <div className="flex gap-3 justify-center">
                  <button className="px-4 py-2 border border-white border-opacity-40 rounded-full text-sm font-semibold backdrop-blur hover:bg-white hover:bg-opacity-10 transition flex items-center gap-2">
                    <span>👥</span> Industry Expert Trainers
                  </button>
                  <button className="px-4 py-2 border border-white border-opacity-40 rounded-full text-sm font-semibold backdrop-blur hover:bg-white hover:bg-opacity-10 transition flex items-center gap-2">
                    <span>✓</span> 100% Job Assistance
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
