import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, User, Sparkles, Info } from 'lucide-react';
import { authStart, authSuccess, authFail, clearError } from '../store/slices/authSlice.js';
import API from '../utils/api.js';

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState('');

  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(clearError());
    
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate, dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (password !== confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters');
      return;
    }

    dispatch(authStart());

    try {
      const { data } = await API.post('/auth/register', { name, email, password });
      if (data.success) {
        dispatch(authSuccess({ user: data, token: data.token }));
        navigate('/dashboard');
      }
    } catch (err) {
      console.error(err);
      dispatch(authFail(err.response?.data?.message || 'Registration failed. Please try again.'));
    }
  };

  const activeError = validationError || error;

  return (
    <div className="w-full min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative grid-bg">
      
      {/* Decorative background shapes */}
      <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-brand-primary/10 rounded-full blur-[80px] pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/3 w-72 h-72 bg-indigo-500/10 rounded-full blur-[90px] pointer-events-none" />

      {/* Card container */}
      <div className="w-full max-w-md rounded-3xl glass-card border shadow-2xl p-8 relative z-10 text-left space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <span className="text-3xl font-black font-display text-gradient tracking-tight">Shopino</span>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100">Create Account</h2>
          <p className="text-xs text-slate-400 font-medium">Join us to compare prices and save intelligently</p>
        </div>

        {activeError && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-500 text-xs flex items-start gap-2">
            <Info size={16} className="shrink-0 mt-0.5" />
            <span>{activeError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Name field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400">Full Name</label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1.5 focus:ring-brand-primary"
              />
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User size={16} />
              </div>
            </div>
          </div>

          {/* Email field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1.5 focus:ring-brand-primary"
              />
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail size={16} />
              </div>
            </div>
          </div>

          {/* Password field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="•••••••• (Min 6 chars)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1.5 focus:ring-brand-primary"
              />
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock size={16} />
              </div>
            </div>
          </div>

          {/* Confirm Password field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400">Confirm Password</label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 text-slate-850 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1.5 focus:ring-brand-primary"
              />
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock size={16} />
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 font-bold text-white bg-gradient-to-r from-brand-primary to-brand-secondary rounded-xl hover:shadow-xl hover:brightness-105 active:scale-98 transition-all disabled:opacity-50 cursor-pointer text-center text-xs flex items-center justify-center gap-1.5"
            >
              {loading ? 'Registering...' : 'Sign Up'}
              <Sparkles size={14} />
            </button>
          </div>

        </form>

        {/* Footer redirection link */}
        <div className="text-center text-xs text-slate-455 text-slate-400 border-t border-slate-100 dark:border-slate-850 pt-4">
          Already have an account?{' '}
          <Link to="/login" className="font-extrabold text-brand-primary hover:text-brand-secondary transition-colors">
            Sign In
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Register;
