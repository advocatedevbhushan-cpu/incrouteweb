import React, { useState, useEffect } from "react";
import { useAuth } from "../lib/AuthContext";
import { Mail, Lock, User, Sparkles, Building2, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Login() {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);

  // Form values
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Check for expired account redirects
  useEffect(() => {
    const isExpiredRedirect = sessionStorage.getItem("incroute_auth_expired");
    if (isExpiredRedirect) {
      setError("Your workspace access has expired 90 days after project completion. Please contact us to renew your account.");
      sessionStorage.removeItem("incroute_auth_expired");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (isSignUp) {
        if (!email || !password || !fullName) {
          throw new Error("All fields are required for registration.");
        }
        if (password.length < 8) {
          throw new Error("Password must be at least 8 characters long.");
        }
        // Sign up always creates a customer account — partners/admins are created by admin
        await signUp(email, password, fullName, "customer");
        setSuccess("Account created successfully! Welcome to your compliance journey.");
      } else {
        if (!email || !password) {
          throw new Error("Email and password are required.");
        }
        await signIn(email, password);
        setSuccess("Signed in successfully!");
      }
    } catch (err: any) {
      console.error(err);
      let msg = err.message || "An authentication error occurred.";
      // Translate Firebase error codes to friendly messages
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        msg = "Invalid email or password. Please check your credentials and try again.";
      } else if (err.code === "auth/email-already-in-use") {
        msg = "This email is already registered. Please sign in instead.";
      } else if (err.code === "auth/too-many-requests") {
        msg = "Too many failed attempts. Please wait a few minutes before trying again.";
      } else if (err.code === "auth/network-request-failed") {
        msg = "Network error. Please check your internet connection.";
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await signInWithGoogle("customer");
      setSuccess("Signed in with Google successfully!");
    } catch (err: any) {
      console.error(err);
      let msg = err.message || "Google Authentication failed.";
      if (err.code === "auth/popup-closed-by-user") {
        msg = "Google sign-in was cancelled.";
      } else if (err.code === "auth/popup-blocked") {
        msg = "Pop-up blocked by browser. Please allow pop-ups for this site.";
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-8 md:my-16">
      <div className="bg-brand-bg-lighter border border-brand-border rounded-3xl p-8 shadow-2xl relative overflow-hidden backdrop-blur-lg">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 blur-3xl rounded-full" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-brand-gold/5 blur-3xl rounded-full" />

        <div className="text-center space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-gold/10 text-brand-gold text-[10px] font-semibold rounded-full border border-brand-gold/20 uppercase tracking-widest font-mono">
            <Sparkles className="w-3 h-3" /> Secure Client Portal
          </div>
          <h2 className="text-3xl font-light text-brand-text tracking-tight font-serif">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </h2>
          <p className="text-xs text-brand-text-muted">
            {isSignUp
              ? "Register to follow your business compliance timeline and milestones."
              : "Sign in to access your compliance journey and progress tracker."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4 relative z-10">
          {isSignUp && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider pl-1">
                Full Name / Company Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-brand-text-muted/50" />
                <input
                  type="text"
                  placeholder="e.g. Bhushan Law Chambers Pvt Ltd"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-brand-input-bg border border-brand-border rounded-xl px-4 py-3 pl-10 text-xs text-brand-text placeholder-brand-text-muted/30 focus:border-brand-gold outline-none transition-colors"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider pl-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-brand-text-muted/50" />
              <input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-brand-input-bg border border-brand-border rounded-xl px-4 py-3 pl-10 text-xs text-brand-text placeholder-brand-text-muted/30 focus:border-brand-gold outline-none transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider pl-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-brand-text-muted/50" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-brand-input-bg border border-brand-border rounded-xl px-4 py-3 pl-10 text-xs text-brand-text placeholder-brand-text-muted/30 focus:border-brand-gold outline-none transition-colors"
              />
            </div>
            {isSignUp && (
              <p className="text-[10px] text-brand-text-muted pl-1 mt-1">Minimum 8 characters required.</p>
            )}
          </div>

          {/* Registration notice – customer only */}
          {isSignUp && (
            <div className="flex items-start gap-2 p-3 bg-brand-gold/5 border border-brand-gold/20 rounded-xl">
              <Building2 className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
              <p className="text-[10px] text-brand-text-muted leading-relaxed">
                This portal is for <span className="text-brand-gold font-semibold">client accounts only</span>. 
                Partner and admin accounts are created by our team. 
                If you are a partner, please contact the admin for login credentials.
              </p>
            </div>
          )}

          {/* Feedback messages */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl text-xs flex items-start gap-2"
              >
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl text-xs"
              >
                {success}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-brand-gold hover:bg-white text-black hover:text-black font-semibold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-lg shadow-brand-gold/15 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              isSignUp ? "Create My Account" : "Sign In"
            )}
          </button>
        </form>

        <div className="relative my-6 z-10 flex items-center justify-center">
          <div className="absolute inset-x-0 h-[1px] bg-brand-border" />
          <span className="relative z-10 bg-brand-bg-lighter px-3 text-[10px] text-brand-text-muted font-mono uppercase tracking-widest">or continue with</span>
        </div>

        {/* Google sign in */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-3 bg-brand-bg-lighter border border-brand-border hover:border-brand-gold/40 text-brand-text text-xs font-semibold rounded-xl uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2 z-10 relative"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </button>

        {/* Form switcher */}
        <div className="mt-6 text-center text-xs z-10 relative">
          <span className="text-brand-text-muted">
            {isSignUp ? "Already registered? " : "New client? "}
          </span>
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError("");
              setSuccess("");
            }}
            className="text-brand-gold font-semibold hover:underline cursor-pointer pl-0.5"
          >
            {isSignUp ? "Sign In Here" : "Create Account"}
          </button>
        </div>
      </div>
    </div>
  );
}
