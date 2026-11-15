import React, { useState, useEffect } from 'react';
import {
  Building2,
  Mail,
  Lock,
  User,
  Phone,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Database,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface AuthPagesProps {
  mode: 'login' | 'signup' | 'forgot';
  onNavigate: (page: string) => void;
}

export const AuthPages: React.FC<AuthPagesProps> = ({ mode: initialMode, onNavigate }) => {
  const {
    login,
    signup,
    resetPassword,
    resendConfirmation,
    switchPersona,
    availableProfiles,
  } = useAuth();
  const [currentMode, setCurrentMode] = useState<'login' | 'signup' | 'forgot'>(initialMode);

  // Sync mode if parent navigation prop changes
  useEffect(() => {
    setCurrentMode(initialMode);
    setErrorMsg(null);
    setInfoMsg(null);
    setConfirmationSent(false);
    setResetSent(false);
  }, [initialMode]);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [userType, setUserType] = useState<UserRole>('both');
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);
  const [schemaMissing, setSchemaMissing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  const switchMode = (nextMode: 'login' | 'signup' | 'forgot') => {
    setCurrentMode(nextMode);
    setErrorMsg(null);
    setInfoMsg(null);
    setConfirmationSent(false);
    setResetSent(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setInfoMsg(null);

    try {
      if (currentMode === 'login') {
        const res = await login(email, password);
        if (!res.ok) {
          setErrorMsg(res.error || 'Unable to sign in. Please verify your credentials.');
          if (res.needsEmailConfirmation) {
            setConfirmationSent(true);
          }
          return;
        }
        if (res.schemaMissing) {
          setSchemaMissing(true);
        }
        onNavigate('dashboard');
      } else if (currentMode === 'signup') {
        const res = await signup({
          email,
          full_name: fullName,
          phone_number: phoneNumber,
          user_type: userType,
          company_name: companyName,
          password,
        });
        if (!res.ok) {
          setErrorMsg(res.error || 'Unable to complete registration.');
          return;
        }
        if (res.schemaMissing) {
          setSchemaMissing(true);
        }
        if (res.needsEmailConfirmation) {
          setConfirmationSent(true);
          setInfoMsg(
            res.message ||
              'Registration saved! Please check your email inbox to confirm your account before signing in.'
          );
          return;
        }
        onNavigate('dashboard');
      } else {
        const res = await resetPassword(email);
        if (!res.ok) {
          setErrorMsg(res.error || 'Unable to send password reset email.');
          return;
        }
        setResetSent(true);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Authentication error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!email) return;
    setResending(true);
    setErrorMsg(null);
    try {
      const res = await resendConfirmation(email);
      if (res.ok) {
        setInfoMsg(res.message || 'Verification email resent! Please check your inbox.');
      } else {
        setErrorMsg(res.error || 'Could not resend confirmation email.');
      }
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7561A8] to-[#51416F] flex items-center justify-center text-white mx-auto shadow-md">
            <Building2 className="w-6 h-6" />
          </div>
          <h2 className="font-display font-extrabold text-2xl text-[#252536]">
            {currentMode === 'login'
              ? 'Log in to MatLink'
              : currentMode === 'signup'
              ? 'Create Your Account'
              : 'Reset Password'}
          </h2>
          <p className="text-xs text-[#8B8D98]">
            {currentMode === 'login'
              ? 'Enter your credentials to access your construction dashboard'
              : currentMode === 'signup'
              ? 'Join Pune’s premier sustainable construction material exchange'
              : 'Enter your email to receive recovery instructions'}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        {currentMode !== 'forgot' && (
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#F1F2F5] rounded-2xl">
            <button
              type="button"
              onClick={() => switchMode('login')}
              className={`py-2 rounded-xl text-xs font-bold transition-all ${
                currentMode === 'login'
                  ? 'bg-white text-[#252536] shadow-xs'
                  : 'text-[#8B8D98] hover:text-[#252536]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => switchMode('signup')}
              className={`py-2 rounded-xl text-xs font-bold transition-all ${
                currentMode === 'signup'
                  ? 'bg-white text-[#252536] shadow-xs'
                  : 'text-[#8B8D98] hover:text-[#252536]'
              }`}
            >
              Sign Up
            </button>
          </div>
        )}

        {/* Inline Error Banner */}
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-left">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <p className="text-xs text-red-700 leading-relaxed">{errorMsg}</p>
          </div>
        )}

        {/* Schema Setup Notice if Supabase tables aren't initialized yet */}
        {schemaMissing && (
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-left">
            <Database className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800 space-y-1">
              <p className="font-bold">Supabase Tables Setup Needed</p>
              <p className="leading-relaxed">
                Run <code className="font-mono bg-amber-100 px-1 rounded">supabase/setup.sql</code>{' '}
                in your Supabase SQL Editor so <code className="font-mono">profiles</code> and{' '}
                <code className="font-mono">sign_in_logs</code> store every registration.
              </p>
            </div>
          </div>
        )}

        {resetSent ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
            <h3 className="font-bold text-sm text-[#252536]">Password Reset Email Sent!</h3>
            <p className="text-xs text-[#8B8D98]">
              Check your inbox for <strong>{email}</strong> for instructions to reset your account
              password.
            </p>
            <button
              type="button"
              onClick={() => switchMode('login')}
              className="mt-2 text-xs font-bold text-[#7561A8] hover:underline"
            >
              Return to Login
            </button>
          </div>
        ) : confirmationSent ? (
          <div className="py-6 text-center space-y-3.5 bg-emerald-50/60 border border-emerald-200 rounded-2xl px-4">
            <CheckCircle className="w-11 h-11 text-emerald-600 mx-auto" />
            <h3 className="font-bold text-sm text-[#252536]">Confirm Your Email Address</h3>
            <p className="text-xs text-[#51416F] leading-relaxed">
              {infoMsg ||
                `We sent a confirmation link to ${email}. Verify your email to activate your MatLink dashboard session.`}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-1">
              <button
                type="button"
                disabled={resending}
                onClick={handleResendConfirmation}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-emerald-200 text-xs font-bold text-emerald-700 hover:bg-emerald-50 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                {resending ? 'Sending...' : 'Resend Email'}
              </button>
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="px-3.5 py-2 rounded-xl bg-[#7561A8] text-white text-xs font-bold hover:bg-[#51416F] transition-colors"
              >
                Go to Sign In
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {currentMode === 'signup' && (
              <>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#252536]">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#8B8D98] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Ramesh Patil"
                      className="w-full pl-9 pr-3 py-2.5 bg-[#F1F2F5] text-xs text-[#252536] rounded-xl border border-transparent focus:border-[#7561A8] focus:bg-white focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#252536]">Phone Number</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#8B8D98] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+91 98220 12345"
                      className="w-full pl-9 pr-3 py-2.5 bg-[#F1F2F5] text-xs text-[#252536] rounded-xl border border-transparent focus:border-[#7561A8] focus:bg-white focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#252536]">User Type</label>
                  <select
                    value={userType}
                    onChange={(e) => setUserType(e.target.value as UserRole)}
                    className="w-full p-2.5 bg-[#F1F2F5] text-xs text-[#252536] rounded-xl border border-transparent focus:border-[#7561A8] focus:bg-white focus:outline-hidden font-medium"
                  >
                    <option value="seller">Material Seller (Have leftover stock to sell)</option>
                    <option value="buyer">Material Buyer (Looking to buy discounted stock)</option>
                    <option value="both">Both Buyer and Seller</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#252536]">
                    Company / Firm Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Patil Construction LLP"
                    className="w-full p-2.5 bg-[#F1F2F5] text-xs text-[#252536] rounded-xl border border-transparent focus:border-[#7561A8] focus:bg-white focus:outline-hidden"
                  />
                </div>
              </>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#252536]">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#8B8D98] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contractor@example.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-[#F1F2F5] text-xs text-[#252536] rounded-xl border border-transparent focus:border-[#7561A8] focus:bg-white focus:outline-hidden"
                />
              </div>
            </div>

            {currentMode !== 'forgot' && (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#252536]">Password</label>
                  {currentMode === 'login' && (
                    <button
                      type="button"
                      onClick={() => switchMode('forgot')}
                      className="text-[11px] text-[#7561A8] hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#8B8D98] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full pl-9 pr-3 py-2.5 bg-[#F1F2F5] text-xs text-[#252536] rounded-xl border border-transparent focus:border-[#7561A8] focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-xs sm:text-sm bg-[#7561A8] hover:bg-[#51416F] disabled:opacity-60 text-white shadow-md shadow-[#7561A8]/30 transition-all flex items-center justify-center gap-2 mt-2"
            >
              {loading
                ? 'Connecting to Supabase...'
                : currentMode === 'login'
                ? 'Sign In to Dashboard'
                : currentMode === 'signup'
                ? 'Complete Registration'
                : 'Send Password Reset Link'}
            </button>
          </form>
        )}

        {/* Toggle between login / signup */}
        <div className="pt-2 text-center text-xs text-[#8B8D98]">
          {currentMode === 'login' ? (
            <p>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => switchMode('signup')}
                className="font-bold text-[#7561A8] hover:underline"
              >
                Sign Up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="font-bold text-[#7561A8] hover:underline"
              >
                Sign In
              </button>
            </p>
          )}
        </div>

        {/* 1-Click Persona Login for Presentation Evaluation */}
        <div className="pt-4 border-t border-gray-100 space-y-2">
          <p className="text-[11px] font-semibold text-[#8B8D98] text-center">
            Or test with 1-Click Evaluation Persona:
          </p>
          <div className="grid grid-cols-2 gap-2">
            {availableProfiles.slice(0, 4).map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  switchPersona(p.id);
                  onNavigate('dashboard');
                }}
                className="p-2 rounded-xl border border-gray-200 hover:border-[#7561A8] text-left text-[11px] hover:bg-purple-50/50 transition-colors"
              >
                <p className="font-bold text-[#252536] truncate">{p.full_name}</p>
                <p className="text-[10px] text-[#8B8D98] capitalize">{p.user_type}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
