import { useState, useEffect, useRef } from 'react';
import homeImage from '../assets/images/home.png';
import feather1 from '../assets/images/feather_1.png';
import feather2 from '../assets/images/feather_2.png';
import feather3 from '../assets/images/feather_3.png';
import feather4 from '../assets/images/feather_4.png';
import feather5 from '../assets/images/feather_5.png';
import feather6 from '../assets/images/feather_6.png';
import { Navbar } from '../components/Navbar';

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
  
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes float {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-10px);
    }
  }
  
  .animate-float {
    animation: float 3s ease-in-out infinite;
  }
  
  @keyframes floatY {
    0%,100% { transform: translateY(0px); }
    50%      { transform: translateY(-7px); }
  }
  @keyframes orb-pulse {
    0%,100% { opacity: 0.6; r: 14; }
    50%      { opacity: 1;   r: 18; }
  }
  @keyframes traveler-move {
    0%   { offset-distance: 0%;   opacity: 0; }
    4%   { opacity: 1; }
    96%  { opacity: 1; }
    100% { offset-distance: 100%; opacity: 0; }
  }
  .traveler {
    position: absolute;
    width: 12px; height: 12px;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 0 16px #2563eb, 0 0 32px #1e40af;
    offset-path: path('M 180 80 C 380 80, 420 260, 620 260 C 820 260, 380 440, 180 440');
    animation: traveler-move 2.4s ease-in-out infinite;
    animation-delay: 2.1s;
    pointer-events: none;
    z-index: 10;
  }
  @keyframes badge-pop {
    0% { transform: scale(0.5); opacity: 0; }
    70% { transform: scale(1.15); }
    100% { transform: scale(1); opacity: 1; }
  }
  @keyframes shine {
    0%   { background-position: 200% center; }
    100% { background-position: -200% center; }
  }
`;

const steps = [
  {
    num: "01",
    title: "Create Profile",
    desc: "Answer simple questions about your academics and background",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="26" height="26">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
    color: "#2563eb",
    x: "left",
  },
  {
    num: "02",
    title: "AI Analysis",
    desc: "Our system checks government eligibility criteria instantly",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="26" height="26">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
      </svg>
    ),
    color: "#1e40af",
    x: "right",
  },
  {
    num: "03",
    title: "Get Results",
    desc: "See all matching scholarships with application requirements",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="26" height="26">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
      </svg>
    ),
    color: "#3b82f6",
    x: "left",
  },
];

function useInView(ref) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return inView;
}

// Node positions in SVG viewBox 800 x 520
const NODE_POS = [
  { cx: 180, cy: 80 },
  { cx: 620, cy: 260 },
  { cx: 180, cy: 440 },
];

const PATH = `M 180 80 C 380 80, 420 260, 620 260 C 820 260, 380 440, 180 440`;
const PATH_LENGTH = 950;

function HowItWorksFlowchart() {
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef);
  const [prog, setProg] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let raf, start;
    const dur = 2000;
    raf = requestAnimationFrame(function tick(ts) {
      if (!start) start = ts;
      const t = Math.min((ts - start) / dur, 1);
      // ease out cubic
      const e = 1 - Math.pow(1 - t, 3);
      setProg(e);
      if (t < 1) raf = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(raf);
  }, [inView]);

  const dashOffset = PATH_LENGTH * (1 - prog);

  return (
    <section
      id="how"
      ref={sectionRef}
      style={{
        background: "#ffffff",
        padding: "100px 24px 90px",
        fontFamily: "'Poppins', sans-serif",
        position: "relative",
        overflow: "hidden",
        minHeight: 640,
      }}
    >
      {/* Background glows */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: "5%", left: "10%", width: 500, height: 300, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(37,99,235,0.06) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: "5%", right: "5%", width: 400, height: 300, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(59,130,246,0.05) 0%, transparent 70%)" }} />
      </div>

      {/* Heading */}
      <div style={{
        textAlign: "center", marginBottom: 56, position: "relative", zIndex: 5,
        opacity: inView ? 1 : 0, transform: inView ? "none" : "translateY(20px)",
        transition: "all 0.65s ease",
      }}>
        <span style={{
          display: "inline-block", fontSize: 11, fontWeight: 700, letterSpacing: "4px",
          color: "#2563eb", textTransform: "uppercase", marginBottom: 14,
          border: "1px solid rgba(37,99,235,0.25)", borderRadius: 99,
          padding: "5px 14px", background: "rgba(37,99,235,0.05)",
        }}>Simple Process</span>
        <h2 style={{ fontSize: "clamp(30px,5vw,48px)", fontWeight: 800, color: "#1e293b", margin: 0, letterSpacing: "-1px", lineHeight: 1.15 }}>
          How It{" "}
          <span style={{
            background: "linear-gradient(90deg, #1e40af, #2563eb, #3b82f6, #2563eb)",
            backgroundSize: "300% auto",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            animation: "shine 4s linear infinite",
          }}>Works</span>
        </h2>
      </div>

      {/* Flow Layout */}
      <div style={{ maxWidth: 860, margin: "0 auto", position: "relative" }}>

        {/* SVG Canvas — behind cards */}
        <svg
          viewBox="0 0 800 520"
          preserveAspectRatio="none"
          style={{
            position: "absolute", inset: 0, width: "100%", height: "100%",
            pointerEvents: "none", zIndex: 1, display: "block",
          }}
        >
          <defs>
            <linearGradient id="hiwGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="50%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#60a5fa" />
            </linearGradient>
            <filter id="hiwGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="hiwNodeGlow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="6" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Ghost track */}
          <path d={PATH} fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="3" strokeLinecap="round" />

          {/* Dashed rhythm track */}
          <path d={PATH} fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="8"
            strokeDasharray="1 20" strokeLinecap="round" />

          {/* Main animated draw */}
          <path
            d={PATH}
            fill="none"
            stroke="url(#hiwGrad)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={PATH_LENGTH}
            strokeDashoffset={dashOffset}
            filter="url(#hiwGlow)"
          />

          {/* Node rings + dots */}
          {NODE_POS.map((n, i) => {
            const revealed = prog > i * 0.38;
            return (
              <g key={i} filter="url(#hiwNodeGlow)">
                {/* outer pulse ring */}
                <circle cx={n.cx} cy={n.cy} r={22}
                  fill="none"
                  stroke={steps[i].color}
                  strokeWidth="1"
                  opacity={revealed ? 0.25 : 0}
                  style={{ transition: "opacity 0.5s" }}
                />
                {/* mid ring */}
                <circle cx={n.cx} cy={n.cy} r={14}
                  fill={steps[i].color}
                  opacity={revealed ? 0.2 : 0}
                  style={{ transition: "opacity 0.5s 0.1s" }}
                />
                {/* core dot */}
                <circle cx={n.cx} cy={n.cy} r={7}
                  fill={steps[i].color}
                  opacity={revealed ? 1 : 0}
                  style={{ transition: "opacity 0.4s 0.15s" }}
                />
                <circle cx={n.cx} cy={n.cy} r={3}
                  fill="#fff"
                  opacity={revealed ? 1 : 0}
                  style={{ transition: "opacity 0.3s 0.25s" }}
                />
              </g>
            );
          })}
        </svg>

        {/* Traveling dot overlaid with CSS offset-path */}
        {prog >= 1 && <div className="traveler" />}

        {/* Step Cards — zigzag positions */}
        <div style={{ position: "relative", zIndex: 3, paddingBottom: 8 }}>
          {steps.map((step, i) => {
            const isRight = step.x === "right";
            const revealed = inView && prog > i * 0.3;
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: isRight ? "flex-end" : "flex-start",
                  marginBottom: i < steps.length - 1 ? 96 : 0,
                  paddingLeft: isRight ? 0 : 0,
                  paddingRight: isRight ? 0 : 0,
                }}
              >
                <div
                  style={{
                    width: "clamp(240px, 42%, 320px)",
                    padding: "28px 26px 30px",
                    borderRadius: 20,
                    background: "#ffffff",
                    border: `2px solid ${step.color}20`,
                    boxShadow: `0 0 0 1px ${step.color}08, 0 12px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8)`,
                    position: "relative",
                    backdropFilter: "blur(12px)",
                    opacity: revealed ? 1 : 0,
                    transform: revealed
                      ? "translateY(0) scale(1)"
                      : `translateY(36px) scale(0.94) translateX(${isRight ? 24 : -24}px)`,
                    transition: "all 0.65s cubic-bezier(0.34, 1.4, 0.64, 1)",
                    transitionDelay: `${0.2 + i * 0.18}s`,
                    animation: revealed ? `floatY ${3.2 + i * 0.5}s ease-in-out ${i * 0.6}s infinite` : "none",
                  }}
                >
                  {/* Top colored bar */}
                  <div style={{
                    position: "absolute", top: 0,
                    left: isRight ? "auto" : 24, right: isRight ? 24 : "auto",
                    width: 40, height: 2.5,
                    borderRadius: "0 0 4px 4px",
                    background: step.color,
                    boxShadow: `0 0 10px ${step.color}`,
                  }} />

                  {/* Step badge */}
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    marginBottom: 18,
                    opacity: revealed ? 1 : 0,
                    animation: revealed ? `badge-pop 0.5s ease ${0.35 + i * 0.18}s both` : "none",
                  }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 8,
                      background: `${step.color}15`,
                      border: `1px solid ${step.color}30`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: step.color,
                      fontSize: 11, fontWeight: 800, letterSpacing: "0.5px",
                    }}>{step.num}</div>
                  </div>

                  {/* Icon */}
                  <div style={{
                    width: 50, height: 50, borderRadius: 14,
                    background: `${step.color}10`,
                    border: `1px solid ${step.color}20`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: step.color, marginBottom: 16,
                  }}>{step.icon}</div>

                  <h3 style={{ fontSize: 18, fontWeight: 700, color: "#1e293b", margin: "0 0 8px", letterSpacing: "-0.2px" }}>
                    {step.title}
                  </h3>
                  <p style={{ fontSize: 13.5, color: "#64748b", margin: 0, lineHeight: 1.65 }}>
                    {step.desc}
                  </p>

                  {/* Side connector stub to SVG line */}
                  <div style={{
                    position: "absolute", top: "50%",
                    [isRight ? "left" : "right"]: -18,
                    transform: "translateY(-50%)",
                    width: 18, height: 1.5,
                    background: `linear-gradient(${isRight ? "to left" : "to right"}, ${step.color}cc, transparent)`,
                    opacity: revealed ? 1 : 0, transition: "opacity 0.5s 0.5s",
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer note */}
      <div style={{
        textAlign: "center", marginTop: 48, position: "relative", zIndex: 5,
        opacity: inView ? 1 : 0, transition: "opacity 0.7s 1.2s",
      }}>
        <span style={{
          fontSize: 13, color: "#64748b",
          display: "inline-flex", alignItems: "center", gap: 8,
        }}>
          <span style={{
            display: "inline-block", width: 7, height: 7, borderRadius: "50%",
            background: "#4ade80", boxShadow: "0 0 8px #4ade80",
          }} />
          Entire process takes under 3 minutes
        </span>
      </div>
    </section>
  );
}

const features = [
  { icon: feather1, title: "AI-Powered Matching", desc: "Our AI analyzes government documents and your profile instantly" },
  { icon: feather2, title: "Personalized Results", desc: "Get scholarships that match your academic profile exactly" },
  { icon: feather3, title: "Mobile Friendly", desc: "Check eligibility anytime, anywhere from your phone" },
  { icon: feather4, title: "Data Secure", desc: "Your information is encrypted and never sold to third parties" },
  { icon: feather5, title: "Real-Time Updates", desc: "Scheme information updated directly from government sources" },
  { icon: feather6, title: "Works for Everyone", desc: "Students, parents, schools, and NGOs all benefit from Docu-Agent" },
];

function FeatureCard({ feature, index, visible }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`
        relative overflow-hidden rounded-2xl p-8 transition-all duration-500 cursor-default
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
        ${hovered ? 'shadow-2xl -translate-y-2 bg-white border-blue-200' : 'shadow-md bg-white/80 border-gray-200'}
        border-2 backdrop-blur-sm
      `}
      style={{
        transitionDelay: visible ? `${index * 100}ms` : '0ms',
      }}
    >
      {/* Gradient overlay on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent transition-opacity duration-500 ${hovered ? 'opacity-100' : 'opacity-0'}`}></div>
      
      {/* Content */}
      <div className="relative z-10">
        {/* Icon using individual feather images */}
        <div className={`
          w-16 h-16 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50
          flex items-center justify-center mb-6
          transition-all duration-300
          ${hovered ? 'scale-110 rotate-3 shadow-lg' : 'scale-100 rotate-0'}
        `}>
          <img 
            src={feature.icon} 
            alt={feature.title}
            className={`w-10 h-10 object-contain ${hovered ? 'animate-float' : ''}`}
          />
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-3 tracking-tight">
          {feature.title}
        </h3>

        {/* Animated divider */}
        <div className="mb-4 overflow-hidden">
          <div className={`h-1 rounded-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-500 ${hovered ? 'w-16' : 'w-10'}`}></div>
        </div>

        {/* Description */}
        <p className="text-gray-600 leading-relaxed">
          {feature.desc}
        </p>
      </div>

      {/* Corner decoration */}
      <div className={`absolute -bottom-4 -right-4 w-24 h-24 bg-blue-100 rounded-full transition-all duration-500 ${hovered ? 'opacity-30 scale-150' : 'opacity-10 scale-100'}`}></div>
    </div>
  );
}

function FeatureCards() {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { 
        if (entry.isIntersecting) {
          setVisible(true);
        }
      },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="features"
      ref={ref}
      className="py-20 px-4 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden"
    >
      {/* Background decorative elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '1s' }}></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div 
          className={`
            text-center mb-16 transition-all duration-700
            ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}
          `}
        >
          <div className="inline-block bg-blue-100 text-blue-900 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            ✨ Powerful Features
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            Why Choose <span className="text-blue-900">Docu-Agent?</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Smart scholarship matching for smarter students
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <FeatureCard key={idx} feature={feature} index={idx} visible={visible} />
          ))}
        </div>
      </div>
    </section>
  );
}

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
    <div className="min-h-screen app-shell page-shell text-slate-900 font-poppins">
      <style>{shimmerStyle}</style>
      <Navbar />

      {/* Hero Section */}
      <section className="py-12 sm:py-18 px-4 relative overflow-hidden">
        {/* Floating decorative icons with shimmer effect */}

        <div className="max-w-4xl mx-auto text-center relative z-10 mt-0">
          {/* Badge */}
          <div className="inline-block bg-blue-50 text-blue-900 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            AI-Powered Scholarship Finder
          </div>

          {/* Headline */}
          <h1 className="text-3xl text-[32px] md:text-[48px] font-semibold text-slate-900 mb-4 leading-tight">
            Find Government Scholarships You <span className="text-blue-900">Deserve</span>
          </h1>

          {/* Subtext */}
          <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-2xl mx-auto">
            Stop reading long PDFs. Let our AI instantly match you with government scholarships and schemes you're eligible for.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
            <a href="/signup" className="px-8 py-3 bg-blue-900 text-white rounded-lg hover:bg-blue-800 font-semibold text-sm sm:text-base text-center transition">
              Check Eligibility Free
            </a>
            <a href="#how" className="px-8 py-3 border-2 border-blue-900 text-blue-900 rounded-lg hover:bg-blue-50 font-semibold text-sm sm:text-base text-center transition">
              Learn More
            </a>
          </div>

          {/* Image */}
          <div className="relative max-w-5xl mx-auto">
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl overflow-hidden shadow-xl shimmer-overlay">
              <img 
                src={homeImage} 
                alt="AI-Powered Eligibility Analysis" 
                className="w-full h-auto max-h-[26rem] object-cover"
              />
            </div>
            {/* Badge on image */}
            
          </div>
        </div>
      </section>

      {/* Trust Stats */}
      <section className="bg-[#F5F7FA] py-12 px-4">
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
      <FeatureCards />

      {/* Auto-Fill Agent Spotlight */}
      <section className="py-20 px-4 relative overflow-hidden bg-gradient-to-b from-white via-blue-50/40 to-white">
        <div className="absolute -top-24 left-10 h-64 w-64 rounded-full bg-emerald-200/40 blur-3xl animate-float" />
        <div className="absolute bottom-0 right-10 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl animate-float" style={{ animationDelay: '1.2s' }} />
        <div className="max-w-7xl mx-auto relative">
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-blue-100 text-blue-900 text-xs font-semibold">
                Browser Extension Ready
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mt-5 leading-tight">
                Auto-Fill Agent that submits <span className="text-blue-900">live scholarship forms</span>
              </h2>
              <p className="text-lg text-slate-600 mt-4 max-w-xl">
                Map OCR-extracted data to every portal in seconds. The agent validates confidence, highlights gaps,
                and fills the application while you review.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                {['Smart field mapping', 'Confidence scoring', 'Safe review mode'].map((item) => (
                  <span key={item} className="px-3 py-1.5 rounded-full bg-white border border-slate-200 text-xs text-slate-600">
                    {item}
                  </span>
                ))}
              </div>
              <div className="mt-8 flex flex-wrap gap-4">
                <a
                  href="/auto-fill"
                  className="px-6 py-3 rounded-xl bg-blue-900 text-white font-semibold text-sm hover:bg-blue-800 transition"
                >
                  Launch Auto-Fill Agent
                </a>
                <a
                  href="#how"
                  className="px-6 py-3 rounded-xl border border-blue-900 text-blue-900 font-semibold text-sm hover:bg-blue-50 transition"
                >
                  See how it works
                </a>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-3xl border border-slate-200 bg-white shadow-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Live Portal</p>
                    <h3 className="text-lg font-semibold text-slate-900">National Scholarship Portal</h3>
                  </div>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">Autofill ready</span>
                </div>
                <div className="mt-5 space-y-3">
                  {[
                    { label: 'Applicant Name', value: 'Aarav Mehta' },
                    { label: 'Date of Birth', value: '2003-08-22' },
                    { label: 'Annual Income', value: '185000' }
                  ].map((field) => (
                    <div key={field.label} className="grid grid-cols-[1fr_1.2fr] gap-3 items-center">
                      <span className="text-xs text-slate-500">{field.label}</span>
                      <div className="rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-700 bg-slate-50">
                        {field.value}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 rounded-2xl bg-slate-900 text-white px-4 py-3 text-xs">
                  Mapping complete: 9 of 9 fields matched
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 rounded-3xl border border-slate-200 bg-white shadow-lg p-4 w-56">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Agent Log</p>
                <p className="text-sm font-semibold text-slate-900 mt-2">Confidence: 94%</p>
                <p className="text-xs text-slate-500 mt-1">3 fields auto-verified, 0 conflicts</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <HowItWorksFlowchart />

      {/* Results Section */}
   
   

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
                <div className="w-8 h-8 bg-blue-400 rounded-lg flex items-center justify-center">
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
