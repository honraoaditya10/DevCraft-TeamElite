import { useState } from 'react';
import homeImage from '../assets/images/home.png';

const shimmerStyle = `
  @keyframes shimmer {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }
  .animate-shimmer {
    animation: shimmer 2s infinite;
  }
  .shimmer-overlay {
    position: relative;
    overflow: hidden;
  }
  .shimmer-overlay::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.5) 50%,
      rgba(255, 255, 255, 0) 100%
    );
    animation: shimmer 2s infinite;
    pointer-events: none;
  }
`;

export default function Home() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      name: "Ananya Singh",
      role: "Student, Delhi",
      image: "👩‍🎓",
      text: "Found 3 scholarships I didn't know existed. Got ₹40,000 this year!",
      rating: 5
    },
    {
      name: "Rajesh Kumar",
      role: "Parent, Bangalore",
      image: "👨‍💼",
      text: "This tool saved us hours of paperwork. Highly recommended!",
      rating: 5
    },
    {
      name: "Priya Patel",
      role: "NGO Director, Gujarat",
      image: "👩‍💼",
      text: "We're using it to help 500+ students. Game changer!",
      rating: 5
    },
    {
      name: "Mohit Sharma",
      role: "Student, Mumbai",
      image: "👨‍🎓",
      text: "The eligibility check was 100% accurate. Applied and got selected!",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <style>{shimmerStyle}</style>
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">DA</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Docu-Agent</h1>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#how" className="text-gray-700 hover:text-blue-600 font-medium text-sm">How It Works</a>
            <a href="#features" className="text-gray-700 hover:text-blue-600 font-medium text-sm">Features</a>
            <a href="#results" className="text-gray-700 hover:text-blue-600 font-medium text-sm">Results</a>
          </div>
          <div className="flex items-center gap-3">
            <a href="/login" className="text-gray-700 hover:text-blue-600 font-medium text-sm">Sign In</a>
            <a href="/signup" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm transition">Get Started</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-12 sm:py-18 px-4 relative overflow-hidden">
        {/* Floating decorative icons with shimmer effect */}

        <div className="max-w-4xl mx-auto text-center relative z-10 mt-0">
          {/* Badge */}
          <div className="inline-block bg-blue-100 text-blue-600 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            AI-Powered Scholarship Finder
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 leading-tight">
            Find Government Scholarships You <span className="text-blue-600">Deserve</span>
          </h1>

          {/* Subtext */}
          <p className="text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto">
            Stop reading long PDFs. Let our AI instantly match you with government scholarships and schemes you're eligible for.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
            <a href="/signup" className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-sm sm:text-base text-center transition">
              Check Eligibility Free
            </a>
            <a href="#how" className="px-8 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-semibold text-sm sm:text-base text-center transition">
              Learn More
            </a>
          </div>

          {/* Image */}
          <div className="relative max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl overflow-hidden shadow-xl shimmer-overlay">
              <img 
                src={homeImage} 
                alt="AI-Powered Eligibility Analysis" 
                className="w-full h-auto max-h-[26rem] object-cover"
              />
            </div>
            {/* Badge on image */}
            <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 max-w-xs text-left">
        
            </div>
          </div>
        </div>
      </section>

      {/* Trust Stats */}
      <section className="bg-gray-50 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <p className="text-4xl font-bold text-blue-600 mb-2">50K+</p>
              <p className="text-gray-600 font-medium">Scholarships Checked</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-blue-600 mb-2">10K+</p>
              <p className="text-gray-600 font-medium">Students Helped</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-blue-600 mb-2">₹5Cr+</p>
              <p className="text-gray-600 font-medium">Scholarships Won</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-blue-600 mb-2">98%</p>
              <p className="text-gray-600 font-medium">Accuracy Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Docu-Agent?</h2>
            <p className="text-xl text-gray-600">Smart scholarship matching for smarter students</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: "🤖", title: "AI-Powered Matching", desc: "Our AI analyzes government documents and your profile instantly" },
              { icon: "🎯", title: "Personalized Results", desc: "Get scholarships that match your academic profile exactly" },
              { icon: "📱", title: "Mobile Friendly", desc: "Check eligibility anytime, anywhere from your phone" },
              { icon: "🛡️", title: "Data Secure", desc: "Your information is encrypted and never sold to third parties" },
              { icon: "📊", title: "Real-Time Updates", desc: "Scheme information updated directly from government sources" },
              { icon: "👥", title: "Works for Everyone", desc: "Students, parents, schools, and NGOs all benefit from Docu-Agent" }
            ].map((feature, idx) => (
              <div key={idx} className="p-8 border border-gray-200 rounded-xl hover:shadow-lg transition">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Simple 3-step process to find your scholarships</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { num: "01", title: "Create Profile", desc: "Answer simple questions about your academics and background" },
              { num: "02", title: "AI Analysis", desc: "Our system checks government eligibility criteria instantly" },
              { num: "03", title: "Get Results", desc: "See all matching scholarships with application requirements" }
            ].map((step, idx) => (
              <div key={idx} className="relative">
                <div className="text-6xl font-bold text-blue-100 mb-4">{step.num}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.desc}</p>
                {idx < 2 && (
                  <div className="hidden md:block absolute top-12 -right-12 w-24 h-1 bg-blue-200"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section id="results" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Real Results from Real Students</h2>
            <p className="text-xl text-gray-600">See what other students found</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Sample Result 1 */}
            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-8 border border-green-200">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-green-600 text-2xl">✓</span>
                <h3 className="text-2xl font-bold text-gray-900">Eligible for 4 Schemes</h3>
              </div>
              <div className="space-y-4 mb-8">
                {[
                  { name: "Post-Matric Scholarship", amount: "₹15,000", deadline: "30 March" },
                  { name: "Merit Scholarship 2025", amount: "₹25,000", deadline: "15 April" },
                  { name: "Minority Scheme", amount: "₹10,000", deadline: "20 April" },
                  { name: "State Education Grant", amount: "₹5,000", deadline: "10 May" }
                ].map((scheme, idx) => (
                  <div key={idx} className="flex justify-between items-start p-4 bg-white rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900">{scheme.name}</p>
                      <p className="text-sm text-gray-600 mt-1">Deadline: {scheme.deadline}</p>
                    </div>
                    <p className="font-bold text-blue-600">{scheme.amount}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Sample Result 2 */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Next Steps</h3>
              <div className="space-y-3">
                {[
                  { step: "Upload Income Certificate", done: true },
                  { step: "Prepare Academic Documents", done: true },
                  { step: "Submit Applications", done: false },
                  { step: "Track Application Status", done: false }
                ].map((item, idx) => (
                  <label key={idx} className="flex items-center gap-3 p-3 hover:bg-white rounded-lg cursor-pointer transition">
                    <input 
                      type="checkbox" 
                      defaultChecked={item.done}
                      className="w-5 h-5 text-blue-600 rounded"
                    />
                    <span className={item.done ? "text-gray-600 line-through" : "text-gray-900 font-medium"}>
                      {item.step}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Success Stories</h2>
            <p className="text-xl text-gray-600">Join thousands of students who found their scholarships</p>
          </div>

          <div className="relative">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {testimonials.slice(0, 2).map((testimonial, idx) => (
                <div key={idx} className="bg-white rounded-xl p-8 border border-gray-200">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <span key={i} className="text-yellow-400">★</span>
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 leading-relaxed">"{testimonial.text}"</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                    <span className="text-3xl">{testimonial.image}</span>
                    <div>
                      <p className="font-semibold text-gray-900">{testimonial.name}</p>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Don't Miss Out on Scholarships</h2>
          <p className="text-xl text-gray-600 mb-10">Thousands of scholarships go unclaimed every year. You might be missing one right now.</p>
          <a href="/signup" className="inline-block px-10 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-lg transition">
            Check Your Eligibility →
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xs">DA</span>
                </div>
                <span className="text-white font-bold">Docu-Agent</span>
              </div>
              <p className="text-sm">AI-powered scholarship eligibility checker built for Indian students.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                <li><a href="#how" className="hover:text-white transition">How It Works</a></li>
                <li><a href="/login" className="hover:text-white transition">Sign In</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
                <li><a href="#" className="hover:text-white transition">For Institutions</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms</a></li>
                <li><a href="#" className="hover:text-white transition">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8">
            <p className="text-sm text-center">© 2025 Docu-Agent. Built for public good.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
