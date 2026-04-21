import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../services/api';

const Register = ({ theme, toggleTheme }) => {
  const navigate = useNavigate();
  
  // Single consolidated state for form data
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
  });
  
  // State for backend error handling
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(''); // Clear error when user starts typing
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await registerUser(formData);
      navigate('/login'); // Redirect to login after successful signup
    } catch (err) {
      // Capture the specific error message from your MERN backend
      setError(err.response?.data?.msg || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-['Manrope'] bg-[#f6f7f8] dark:bg-[#101922] transition-colors duration-500">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-slate-200 dark:border-[#233648] px-6 md:px-10 py-3 bg-white/80 dark:bg-[#101922]/80 backdrop-blur-md z-10">
        <Link to="/" className="flex items-center gap-4">
          <div className="size-8 text-[#137fec]">
            <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path d="M44 11.2727C44 14.0109 39.8386 16.3957 33.69 17.6364C39.8386 18.877 44 21.2618 44 24C44 26.7382 39.8386 29.123 33.69 30.3636C39.8386 31.6043 44 33.9891 44 36.7273C44 40.7439 35.0457 44 24 44C12.9543 44 4 40.7439 4 36.7273C4 33.9891 8.16144 31.6043 14.31 30.3636C8.16144 29.123 4 26.7382 4 24C4 21.2618 8.16144 18.877 14.31 17.6364C8.16144 16.3957 4 14.0109 4 11.2727C4 7.25611 12.9543 4 24 4C35.0457 4 44 7.25611 44 11.2727Z" fill="currentColor" />
            </svg>
          </div>
          <h2 className="text-slate-900 dark:text-white text-xl font-extrabold tracking-tight transition-colors">EstatePredict</h2>
        </Link>
        <button onClick={toggleTheme} className="p-2 rounded-full bg-slate-100 dark:bg-[#233648] border border-slate-200 dark:border-transparent transition-all">
          <span className="material-symbols-outlined text-[20px] text-slate-600 dark:text-slate-300">
            {theme === 'dark' ? 'light_mode' : 'dark_mode'}
          </span>
        </button>
      </header>

      <main className="flex-1 flex flex-col md:flex-row">
        {/* Left Side Visual */}
        <div className="hidden md:flex md:w-1/2 relative overflow-hidden bg-slate-900">
          <div className="absolute inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069')` }} />
          <div className="absolute inset-0 bg-[#137fec]/20 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#101922] via-[#101922]/40 to-transparent" />
          <div className="relative z-10 p-20 flex flex-col justify-end h-full">
            <h1 className="text-white text-5xl font-black leading-tight mb-6">Join the Revolution in Data-Driven Real Estate.</h1>
            <p className="text-slate-200 text-lg font-medium max-w-xl opacity-90 leading-relaxed">Create your account to access institutional-grade property nodes and precision market analytics.</p>
          </div>
        </div>

        {/* Right Side Form */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 bg-white dark:bg-[#101922] transition-colors">
          <div className="w-full max-w-[440px] flex flex-col gap-8">
            <div className="space-y-2">
              <h2 className="text-slate-900 dark:text-white text-4xl font-black tracking-tight transition-colors">Create Account</h2>
              <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">Start predicting market shifts with 94% accuracy.</p>
            </div>

            {/* Error Message Display */}
            {error && (
              <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 dark:bg-red-900/20 dark:text-red-400 text-sm font-bold rounded-r-lg">
                {error}
              </div>
            )}

            <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-slate-700 dark:text-slate-200 text-sm font-bold">Full Name</label>
                <input required name="fullName" value={formData.fullName} onChange={handleChange} className="w-full rounded-xl border border-slate-200 dark:border-[#324d67] bg-white dark:bg-[#192633] h-14 px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#137fec] outline-none transition-all placeholder:opacity-50" placeholder="John Doe" type="text" />
              </div>
              <div className="space-y-2">
                <label className="text-slate-700 dark:text-slate-200 text-sm font-bold">Email Address</label>
                <input required name="email" value={formData.email} onChange={handleChange} className="w-full rounded-xl border border-slate-200 dark:border-[#324d67] bg-white dark:bg-[#192633] h-14 px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#137fec] outline-none transition-all placeholder:opacity-50" placeholder="e.g. investor@example.com" type="email" />
              </div>
              <div className="space-y-2">
                <label className="text-slate-700 dark:text-slate-200 text-sm font-bold">Password</label>
                <input required name="password" value={formData.password} onChange={handleChange} className="w-full rounded-xl border border-slate-200 dark:border-[#324d67] bg-white dark:bg-[#192633] h-14 px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#137fec] outline-none transition-all placeholder:opacity-50" placeholder="••••••••" type="password" />
              </div>

              <button type="submit" className="w-full rounded-xl h-14 bg-[#137fec] text-white text-lg font-black shadow-xl shadow-[#137fec]/20 hover:scale-[1.02] active:scale-95 transition-all mt-4">
                Sign Up
              </button>
            </form>

            <p className="text-center text-slate-500 dark:text-slate-400 text-sm font-medium">
              Already have an account? <Link to="/login" className="text-[#137fec] font-black hover:underline">Sign In</Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Register;