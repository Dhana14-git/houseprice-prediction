import React, { useState, useEffect } from 'react';
import Footer from '../components/Footer';
import { Link, useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  // Theme Logic: Persists choice in local storage
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));

  // 6️⃣ Smooth scroll function for "Watch Demo"
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden transition-colors duration-500 font-['Manrope']">
      
      {/* --- Header --- */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-[#233648] bg-white/80 dark:bg-[#101922]/80 backdrop-blur-md transition-colors">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-6 py-4 lg:px-10">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="text-[#137fec]">
              <svg className="size-8" fill="none" viewBox="0 0 48 48">
                <path d="M44 11.2727C44 14.0109 39.8386 16.3957 33.69 17.6364C39.8386 18.877 44 21.2618 44 24C44 26.7382 39.8386 29.123 33.69 30.3636C39.8386 31.6043 44 33.9891 44 36.7273C44 40.7439 35.0457 44 24 44C12.9543 44 4 40.7439 4 36.7273C4 33.9891 8.16144 31.6043 14.31 30.3636C8.16144 29.123 4 26.7382 4 24C4 21.2618 8.16144 18.877 14.31 17.6364C8.16144 16.3957 4 14.0109 4 11.2727C4 7.25611 12.9543 4 24 4C35.0457 4 44 7.25611 44 11.2727Z" fill="currentColor"></path>
              </svg>
            </div>
            <h2 className="text-xl font-extrabold tracking-tight dark:text-white transition-colors">EstatePredict</h2>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full bg-slate-100 dark:bg-[#233648] hover:scale-110 transition-all border border-slate-200 dark:border-transparent flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-[20px] text-slate-600 dark:text-slate-300">
                {theme === 'dark' ? 'light_mode' : 'dark_mode'}
              </span>
            </button>
            
            <div className="flex items-center gap-4">
              <Link 
                to="/auth" 
                className="hidden sm:block text-sm font-bold opacity-70 hover:opacity-100 dark:text-white transition-colors"
              >
                Sign In
              </Link>
              {/* 1️⃣ Header "Get Started" → /dashboard */}
              <button 
                onClick={() => navigate('/dashboard')}
                className="min-w-[120px] rounded-lg h-10 px-4 bg-[#137fec] text-white text-sm font-bold shadow-lg shadow-[#137fec]/20 hover:scale-105 active:scale-95 transition-all"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* --- Hero Section --- */}
        <section className="relative px-6 py-12 lg:px-10 lg:py-20 bg-slate-50 dark:bg-transparent transition-colors duration-500">
          <div className="mx-auto max-w-[1280px]">
            <div className="overflow-hidden rounded-2xl bg-slate-900 shadow-2xl">
              <div 
                className="flex min-h-[600px] flex-col gap-8 bg-cover bg-center items-start justify-center px-8 py-16 lg:px-20"
                style={{ backgroundImage: `linear-gradient(to right, rgba(16, 25, 34, 0.95) 30%, rgba(16, 25, 34, 0.4) 100%), url("https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070")` }}
              >
                <div className="max-w-2xl space-y-6">
                  <span className="inline-block px-4 py-1.5 bg-[#137fec]/20 text-[#137fec] rounded-full text-xs font-bold tracking-widest uppercase border border-[#137fec]/30">AI-Powered Valuation</span>
                  <h1 className="text-white text-4xl lg:text-6xl font-black leading-tight tracking-tight">Predict the Future Value of Your Home.</h1>
                  <p className="text-slate-300 text-lg lg:text-xl font-medium leading-relaxed opacity-90">Leveraging advanced MERN stack architecture and Machine Learning to provide institutional-grade real estate valuations in seconds.</p>
                </div>
                <div className="flex flex-wrap gap-4">
                  {/* 2️⃣ Hero "Get Started Free" → /dashboard */}
                  <button 
                    onClick={() => navigate('/dashboard')}
                    className="h-14 px-8 bg-[#137fec] text-white text-lg font-bold rounded-lg shadow-xl shadow-[#137fec]/30 hover:bg-[#137fec]/90 hover:scale-105 transition-all"
                  >
                    Get Started Free
                  </button>
                  {/* 3️⃣ Watch Demo → Scroll to “How it Works” */}
                  <button 
                    onClick={() => scrollToSection('how-it-works')}
                    className="h-14 px-8 bg-white/10 text-white text-lg font-bold rounded-lg border border-white/20 backdrop-blur-md hover:bg-white/20 transition-all flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined">play_circle</span> Watch Demo
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- Stats Section --- */}
        <section className="px-6 py-12 lg:px-10">
          <div className="mx-auto max-w-[1280px] grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard label="Prediction Accuracy" value="90.5%" trend="+2.4%" />
            <StatCard label="Assets Analyzed" value="28K+" trend="+15%" />
            <StatCard label="Market Sources" value="85+" trend="+5%" />
          </div>
        </section>

        {/* --- How It Works Section --- */}
        <section className="px-6 py-24 bg-[#f9fafb] dark:bg-[#0b1219] transition-colors duration-500" id="how-it-works">
          <div className="mx-auto max-w-[1100px]">
            <div className="text-center mb-24 space-y-4">
              <h2 className="text-4xl lg:text-5xl font-black tracking-tight dark:text-white transition-colors">How it Works</h2>
              <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-lg font-medium opacity-80 transition-colors">
                Our multi-layered Machine Learning pipeline processes complex market variables into simple, actionable insights.
              </p>
            </div>
            <div className="flex flex-col items-center max-w-5xl mx-auto px-4">
              <TimelineStep 
                icon="database" 
                title="Data Aggregation" 
                desc="Automated collection from verified market sources, public records, and real-time MLS listings." 
              />
              <TimelineStep 
                icon="settings_input_component" 
                title="Feature Engineering" 
                desc="Proprietary algorithms identify critical variables—from school ratings to local transit proximity—that actually drive price appreciation." 
              />
              <TimelineStep 
                icon="psychology" 
                title="Neural Prediction" 
                desc="Receive a high-precision valuation generated by our neural network, adjusted for current market volatility and macroeconomic trends." 
                isLast 
              />
            </div>
          </div>
        </section>

        {/* --- Features Section --- */}
        <section className="px-6 py-24 lg:px-10 bg-white dark:bg-transparent transition-colors" id="features">
          <div className="mx-auto max-w-[1280px]">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
              <div className="max-w-xl space-y-4">
                <h2 className="text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white transition-colors">Powerful Features for Smarter Decisions</h2>
                <p className="text-slate-500 dark:text-slate-400 text-lg transition-colors">Everything you need to navigate the modern real estate market with data-driven precision.</p>
              </div>
              <button className="text-[#137fec] font-bold flex items-center gap-2 hover:underline">View all features <span className="material-symbols-outlined">arrow_forward</span></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard icon="verified" title="Validated Accuracy" desc="Our models are back-tested against millions of historical sale prices for reliability." />
              <FeatureCard icon="map" title="Location Intelligence" desc="Interactive heatmaps and neighborhood micro-trend analysis to identify hotspots." />
              <FeatureCard icon="update" title="Real-time Updates" desc="Market conditions change. Our platform refreshes valuations as new data flows in." />
            </div>
          </div>
        </section>

        {/* --- CTA Section --- */}
        <section className="px-6 py-20 lg:px-10 bg-white dark:bg-transparent transition-colors">
          <div className="mx-auto max-w-[1280px]">
            <div className="relative overflow-hidden rounded-[2.5rem] bg-[#137fec] px-8 py-20 text-center text-white lg:px-20 shadow-2xl shadow-[#137fec]/30">
              <div className="absolute inset-0 opacity-10 pointer-events-none">
                <svg className="h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                  <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"></path>
                  </pattern>
                  <rect width="100%" height="100%" fill="url(#grid)"></rect>
                </svg>
              </div>
              <div className="relative z-10 max-w-3xl mx-auto space-y-10">
                <h2 className="text-4xl lg:text-6xl font-black leading-tight tracking-tight">Ready to discover your property's true worth?</h2>
                <p className="text-blue-100 text-lg lg:text-xl font-medium opacity-90 max-w-xl mx-auto">Join homeowners and investors who stay ahead of the market.</p>
                <div className="flex flex-wrap justify-center gap-6 pt-4">
                  {/* 4️⃣ Create Free Account → /auth */}
                  <button 
                    onClick={() => navigate('/auth')}
                    className="h-16 min-w-[220px] rounded-full bg-white px-8 text-lg font-bold text-[#137fec] shadow-2xl transition-all hover:scale-105 active:scale-95"
                  >
                    Create Free Account
                  </button>
                  {/* 5️⃣ Contact Sales → mailto link */}
                  <a 
                    href="mailto:sales@estatepredict.ai"
                    className="h-16 min-w-[220px] rounded-full border-2 border-white/30 bg-white/10 px-8 text-lg font-bold text-white backdrop-blur-sm transition-all hover:bg-white/20 flex items-center justify-center"
                  >
                    Contact Sales
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

/* --- Sub-Components --- */

const StatCard = ({ label, value, trend }) => (
  <div className="flex flex-col gap-2 rounded-xl p-8 border border-slate-200 dark:border-[#324d67] bg-white dark:bg-[#1a2530] shadow-sm transition-all hover:-translate-y-1">
    <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider">{label}</p>
    <div className="flex items-baseline gap-2">
      <p className="text-3xl font-black text-slate-900 dark:text-white transition-colors">{value}</p>
      <p className="text-[#0bda5b] text-sm font-bold flex items-center bg-[#0bda5b]/10 px-2 py-0.5 rounded-md">
        <span className="material-symbols-outlined text-sm">trending_up</span> {trend}
      </p>
    </div>
  </div>
);

const FeatureCard = ({ icon, title, desc }) => (
  <div className="group rounded-[2rem] border border-slate-200 dark:border-slate-800 p-10 bg-white dark:bg-[#1a2530] hover:shadow-2xl transition-all duration-500">
    <div className="mb-8 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#137fec] text-white group-hover:scale-110 transition-all">
      <span className="material-symbols-outlined text-3xl">{icon}</span>
    </div>
    <h3 className="mb-4 text-2xl font-black tracking-tight text-slate-900 dark:text-white transition-colors">{title}</h3>
    <p className="text-slate-500 dark:text-slate-400 text-lg font-medium leading-relaxed opacity-80 transition-colors">{desc}</p>
  </div>
);

const TimelineStep = ({ icon, title, desc, isLast = false }) => (
  <div className="flex w-full group items-start max-w-3xl mx-auto px-4 font-['Manrope']">
    {/* Visual Column */}
    <div className="flex flex-col items-center shrink-0 w-20">
      <div className={`relative z-10 flex h-14 w-14 items-center justify-center rounded-full border-2 transition-all duration-300 shadow-md
        ${isLast 
          ? 'bg-[#137fec] border-[#137fec] text-white shadow-[0_0_25px_rgba(19,127,236,0.4)]' 
          : 'bg-white dark:bg-[#101922] border-slate-200 dark:border-slate-800 text-[#137fec] group-hover:border-[#137fec]/40'}`}
      >
        <span className="material-symbols-outlined text-2xl font-light">{icon}</span>
      </div>
      {!isLast && <div className="w-[1.5px] h-32 bg-slate-200 dark:bg-slate-800 my-2 transition-colors"></div>}
    </div>

    {/* Content Column */}
    <div className={`flex flex-col pt-2 pl-6 ${!isLast ? 'pb-20' : ''}`}>
      <h3 className="text-2xl font-black mb-3 text-slate-900 dark:text-white group-hover:text-[#137fec] transition-colors leading-none tracking-tight">{title}</h3>
      <p className="text-slate-500 dark:text-slate-400 text-lg font-medium leading-relaxed max-w-xl opacity-90 transition-colors">{desc}</p>
    </div>
  </div>
);

export default Home;