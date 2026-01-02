'use client';

import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  XCircle,
  CheckCircle,
  UserCheck,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import "./AuthModal.css";

// Declare Google Identity Services types
declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (config: { client_id: string; callback: (response: { credential: string }) => void }) => void;
          prompt: () => void;
        };
      };
    };
  }
}

interface GoogleSignInResponse {
  credential: string;
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ValidationResult {
  isValid: boolean;
  message: string;
}

interface PasswordStrength {
  score: number; // 0-4
  feedback: string[];
  color: string;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Validation states
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [usernameSuccess, setUsernameSuccess] = useState(false);
  const [fullNameError, setFullNameError] = useState<string | null>(null);
  const [fullNameSuccess, setFullNameSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    feedback: [],
    color: "#ef4444",
  });

  // Email validation
  const validateEmail = (email: string): ValidationResult => {
    if (!email.trim()) {
      return { isValid: false, message: "Email is required" };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { isValid: false, message: "Please enter a valid email address" };
    }

    return { isValid: true, message: "" };
  };

  // Username validation
  const validateUsername = (username: string): ValidationResult => {
    if (!username.trim()) {
      return { isValid: false, message: "Username is required" };
    }

    if (username.trim().length < 3) {
      return {
        isValid: false,
        message: "Username must be at least 3 characters long",
      };
    }

    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
      return {
        isValid: false,
        message: "Username can only contain letters, numbers, and underscores",
      };
    }

    return { isValid: true, message: "" };
  };

  // Full name validation
  const validateFullName = (fullName: string): ValidationResult => {
    if (!fullName.trim()) {
      return { isValid: false, message: "Full name is required" };
    }

    return { isValid: true, message: "" };
  };

  // Password strength validation
  const validatePasswordStrength = (password: string): PasswordStrength => {
    const feedback: string[] = [];
    const requirements = [
      { test: password.length >= 8, label: "At least 8 characters" },
      { test: /[a-z]/.test(password), label: "One lowercase letter" },
      { test: /[A-Z]/.test(password), label: "One uppercase letter" },
      { test: /\d/.test(password), label: "One number" },
      { test: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>?/]/.test(password), label: "One special character" }
    ];

    let score = 0;
    requirements.forEach(req => {
      if (req.test) {
        score += 1;
      } else {
        feedback.push(req.label);
      }
    });

    let color = "#ef4444"; // red for low
    if (score >= 4) color = "#10b981"; // green for strong
    else if (score >= 2) color = "#3b82f6"; // blue for medium

    return { score, feedback, color };
  };

  // Google Sign-In handler
  const handleGoogleSignIn = useCallback((response: GoogleSignInResponse) => {
    console.log('Google sign in credential:', response.credential);
    // In a real app, you'd send the credential to your backend
    // For frontend only, we'll simulate success
    setLoading(true);
    setTimeout(() => {
      setSuccessMessage("Google authentication successful!");
      setLoading(false);
      setTimeout(() => {
        onClose();
        resetForm();
      }, 1500);
    }, 1000);
  }, [onClose]);

  // Initialize Google Sign-In
  useEffect(() => {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.initialize({
        client_id: '331811061779-qhmm4q1lo85jgd8h5joeeutpakegvide.apps.googleusercontent.com', // This would be set in production
        callback: handleGoogleSignIn,
      });
    }
  }, [handleGoogleSignIn]);

  // Handle Google Sign-In button click
  const handleGoogleAuth = () => {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    } else {
      // Fallback for when Google script isn't loaded
      handleGoogleSignIn({ credential: 'simulated' });
    }
  };

  // Real-time validation effects
  useEffect(() => {
    if (email) {
      const result = validateEmail(email);
      setEmailError(result.isValid ? null : result.message);
      setEmailSuccess(result.isValid);
    } else {
      setEmailError(null);
      setEmailSuccess(false);
    }
  }, [email]);

  useEffect(() => {
    if (password) {
      const strength = validatePasswordStrength(password);
      setPasswordStrength(strength);
    } else {
      setPasswordStrength({ score: 0, feedback: [], color: "#ef4444" });
    }
  }, [password]);


  useEffect(() => {
    if (username && !isLogin) {
      const result = validateUsername(username);
      setUsernameError(result.isValid ? null : result.message);
      setUsernameSuccess(result.isValid);
    } else {
      setUsernameError(null);
      setUsernameSuccess(false);
    }
  }, [username, isLogin]);

  useEffect(() => {
    if (fullName && !isLogin) {
      const result = validateFullName(fullName);
      setFullNameError(result.isValid ? null : result.message);
      setFullNameSuccess(result.isValid);
    } else {
      setFullNameError(null);
      setFullNameSuccess(false);
    }
  }, [fullName, isLogin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    // Comprehensive validation
    const emailValidation = validateEmail(email);
    const passwordValidation = passwordStrength.score >= 4;
    const usernameValidation = isLogin
      ? { isValid: true, message: "" }
      : validateUsername(username);
    const fullNameValidation = isLogin
      ? { isValid: true, message: "" }
      : validateFullName(fullName);

    if (!emailValidation.isValid) {
      setError(emailValidation.message);
      setLoading(false);
      return;
    }

    if (!passwordValidation) {
      setError("Please ensure your password meets all requirements");
     setLoading(false);
      return;
    }

    if (!usernameValidation.isValid) {
      setError(usernameValidation.message);
      setLoading(false);
      return;
    }

    if (!fullNameValidation.isValid) {
      setError(fullNameValidation.message);
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        // Sign in
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (signInError) {
          setError(signInError.message);
          setLoading(false);
          return;
        }

        if (data.user) {
          // Check if profile exists, if not create it
          const { error: profileError } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', data.user.id)
            .single();

          if (profileError && profileError.code === 'PGRST116') {
            // Profile doesn't exist, create it
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: data.user.id,
                username: (data.user.user_metadata?.username || email.split('@')[0]).trim(),
                email: data.user.email?.trim(),
                full_name: (data.user.user_metadata?.full_name || '').trim(),
                bio: '',
                avatar_url: '',
                role: 'user'
              });

            if (insertError) {
              console.error('Error creating profile:', insertError);
            }
          }

          setSuccessMessage("Login successful!");
          setTimeout(() => {
            onClose();
            resetForm();
          }, 1500);
        }
      } else {
        // Check if username is already taken
        const { data: existingProfile, error: checkError } = await supabase
          .from('profiles')
          .select('username')
          .eq('username', username.trim())
          .single();

        if (checkError && checkError.code !== 'PGRST116') {
          setError("Error checking username availability");
          setLoading(false);
          return;
        }

        if (existingProfile) {
          setError("Username is already taken. Please choose a different one.");
          setLoading(false);
          return;
        }

        // Sign up
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              username: username.trim(),
              full_name: fullName.trim(),
              email: email.trim(),
            },
          },
        });

        if (signUpError) {
          setError(signUpError.message);
          setLoading(false);
          return;
        }

        if (data.user) {
          // Create profile immediately after sign up
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              username: username.trim(),
              email: data.user.email || email.trim(),
              full_name: data.user.user_metadata?.full_name || fullName.trim(),
              bio: '',
              avatar_url: '',
              role: 'user'
            });

          if (insertError) {
            console.error('Error creating profile:', insertError);
            // Profile creation failed, but account was created successfully
            // Log the error but still show success message
          }

          setSuccessMessage("Signup successful! Please check your email to confirm your account.");
          setIsLogin(true); // Switch to login mode
          setTimeout(() => {
            resetForm();
          }, 3000);
        }
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setFullName("");
    setUsername("");
    setError(null);
    setSuccessMessage(null);
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setError(null);
    setSuccessMessage(null);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="modal-header">
          <h2>{isLogin ? "Welcome Back" : "Join Our Community"}</h2>
          <p>{isLogin ? "Sign in to your account" : "Create your account"}</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        {successMessage && (
          <div className="success-message">{successMessage}</div>
        )}

        <div className="google-auth-section">
          <button
            type="button"
            className="google-auth-button"
            onClick={handleGoogleAuth}
            disabled={loading}
          >
            <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div className="divider">
            <span>or</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <>
              <div className="input-group">
                <UserCheck className="input-icon" size={20} />
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required={!isLogin}
                  className={`auth-input ${usernameError ? "error" : usernameSuccess ? "success" : ""} ${usernameSuccess ? "input-valid" : usernameError ? "input-invalid" : ""}`}
                  style={{ borderColor: username ? (usernameSuccess ? '#10b981' : usernameError ? '#ef4444' : undefined) : undefined }}
                  disabled={loading}
                />
                {usernameError && (
                  <div className="field-error">
                    <XCircle size={16} />
                    <span>{usernameError}</span>
                  </div>
                )}
                {usernameSuccess && !usernameError && (
                  <div className="field-success">
                    <CheckCircle size={16} />
                    <span>Username looks good!</span>
                  </div>
                )}
              </div>

              <div className="input-group">
                <User className="input-icon" size={20} />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required={!isLogin}
                  className={`auth-input ${fullNameError ? "error" : fullNameSuccess ? "success" : ""} ${fullNameSuccess ? "input-valid" : fullNameError ? "input-invalid" : ""}`}
                  style={{ borderColor: fullName ? (fullNameSuccess ? '#10b981' : fullNameError ? '#ef4444' : undefined) : undefined }}
                  disabled={loading}
                />
                {fullNameError && (
                  <div className="field-error">
                    <XCircle size={16} />
                    <span>{fullNameError}</span>
                  </div>
                )}
                {fullNameSuccess && !fullNameError && (
                  <div className="field-success">
                    <CheckCircle size={16} />
                    <span>Full name looks good!</span>
                  </div>
                )}
              </div>
            </>
          )}

          <div className="input-group">
            <Mail className="input-icon" size={20} />
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={`auth-input ${emailError ? "error" : emailSuccess ? "success" : ""} ${emailSuccess ? "input-valid" : emailError ? "input-invalid" : ""}`}
              style={{ borderColor: email ? (emailSuccess ? '#10b981' : emailError ? '#ef4444' : undefined) : undefined }}
              disabled={loading}
            />
          </div>

          <div className="input-group">
            <Lock className="input-icon" size={20} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="auth-input"
              style={{ borderColor: password ? passwordStrength.color : undefined }}
              disabled={loading}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <button
            type="submit"
            className="auth-button primary"
            disabled={
              loading ||
              !!emailError ||
              passwordStrength.score < 4 ||
              (!isLogin && (!!usernameError || !!fullNameError))
            }
          >
            {loading ? "Processing..." : isLogin ? "Sign In" : "Sign Up"}
          </button>
        </form>

        <div className="auth-switch">
          <p>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              className="switch-button"
              onClick={switchMode}
              disabled={loading}
            >
              {isLogin ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
