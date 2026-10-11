import React, { useState } from 'react';
import { Navigate, useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../../components/ui/Logo';
import { Shield, Lock, Mail, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { user, signIn, isLoading: isAuthLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Destination path after successful login
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/workspace/dashboard';

  // If already logged in, redirect immediately
  if (!isAuthLoading && user) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await signIn(trimmedEmail, password);

      if (error) {
        // Sanitize and provide clear, actionable user messages without exposing internal stack traces
        if (error.message.toLowerCase().includes('invalid login credentials')) {
          setErrorMessage('Invalid email or password. Please verify your credentials and try again.');
        } else if (error.message.toLowerCase().includes('email not confirmed')) {
          setErrorMessage('Email address has not been confirmed. Please check your inbox.');
        } else if (error.message.toLowerCase().includes('network') || error.message.toLowerCase().includes('fetch')) {
          setErrorMessage('Unable to connect to the authentication server. Please check your network connection.');
        } else {
          setErrorMessage(error.message || 'Authentication failed. Please verify your credentials.');
        }
        setIsSubmitting(false);
        return;
      }

      // Successful login -> navigate to intended destination
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Sign-in error:', err);
      setErrorMessage('An unexpected error occurred during sign-in. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F7F5] flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-[#102A2A]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        {/* Top Back Link */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#063B35] hover:text-[#00B86B] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Public Website</span>
          </Link>
        </div>

        {/* Card Header */}
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl border border-[#E1EBE7] shadow-sm">
          <div className="flex flex-col items-center text-center mb-6">
            <Logo variant="dark" size="md" />
            <div className="mt-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#063B35]/5 text-[11px] font-bold text-[#063B35] uppercase tracking-wider">
              <Shield className="w-3 h-3 text-[#00B86B]" />
              <span>Operations Center Access</span>
            </div>
            <h1 className="mt-3 text-xl sm:text-2xl font-extrabold text-[#063B35] tracking-tight uppercase">
              Sign In to Workspace
            </h1>
            <p className="mt-1 text-xs text-[#617070]">
              Authorized commercial dispatch &amp; facility staff portal.
            </p>
          </div>

          {/* Error Notice */}
          {errorMessage && (
            <div
              role="alert"
              className="mb-5 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-start gap-2.5 animate-in fade-in duration-150"
            >
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label
                htmlFor="login-email"
                className="block text-[11px] font-extrabold uppercase tracking-wider text-[#063B35] mb-1.5"
              >
                Work Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#617070]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@northstarfacility.com"
                  className="w-full h-11 pl-10 pr-3.5 bg-[#F3F7F5] border border-[#E1EBE7] rounded-xl text-xs sm:text-sm font-semibold text-[#063B35] placeholder:text-[#617070]/60 focus:outline-none focus:ring-2 focus:ring-[#00B86B] focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="block text-[11px] font-extrabold uppercase tracking-wider text-[#063B35] mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#617070]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="login-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full h-11 pl-10 pr-3.5 bg-[#F3F7F5] border border-[#E1EBE7] rounded-xl text-xs sm:text-sm font-semibold text-[#063B35] placeholder:text-[#617070]/60 focus:outline-none focus:ring-2 focus:ring-[#00B86B] focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 rounded-xl bg-[#063B35] text-white text-xs sm:text-sm font-bold tracking-wide uppercase hover:bg-[#042925] active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#00B86B]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#00B86B]" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </div>
          </form>

          {/* Security Notice */}
          <div className="mt-6 pt-4 border-t border-[#E1EBE7] text-center">
            <p className="text-[11px] text-[#617070]">
              Authorized facility operations staff only. Session credentials are verified securely through Supabase Auth.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
