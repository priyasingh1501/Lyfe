import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0C0F] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8"
      >
        {/* Header */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto w-20 h-20 bg-gradient-to-r from-[#FFD200] via-[#3CCB7F] to-[#4ECDC4] rounded-2xl flex items-center justify-center shadow-lg"
          >
            <span className="text-[#0A0C0F] font-bold text-3xl">L</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 text-3xl font-extrabold text-[#E8EEF2] font-oswald tracking-wide"
          >
            Welcome back to Alfred
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-2 text-sm text-[#C9D1D9]"
          >
            Sign in to manage your lifestyle
          </motion.p>
        </div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 space-y-6"
          onSubmit={handleSubmit}
        >
          <div className="space-y-4">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#C9D1D9] mb-2 font-oswald tracking-wide">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={20} className="text-[#2A313A]" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none relative block w-full pl-10 pr-3 py-3 border-2 border-[#2A313A] placeholder-[#6B7280] text-[#E8EEF2] bg-[#11151A] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3CCB7F] focus:border-[#3CCB7F] focus:z-10 sm:text-sm transition-all duration-200 hover:border-[#3A414A]"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#C9D1D9] mb-2 font-oswald tracking-wide">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={20} className="text-[#2A313A]" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none relative block w-full pl-10 pr-12 py-3 border-2 border-[#2A313A] placeholder-[#6B7280] text-[#E8EEF2] bg-[#11151A] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3CCB7F] focus:border-[#3CCB7F] focus:z-10 sm:text-sm transition-all duration-200 hover:border-[#3A414A]"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff size={20} className="text-[#2A313A] hover:text-[#C9D1D9]" />
                  ) : (
                    <Eye size={20} className="text-[#2A313A] hover:text-[#C9D1D9]" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Remember me and Forgot password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-[#3CCB7F] focus:ring-[#3CCB7F] border-[#2A313A] rounded bg-[#11151A]"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-[#C9D1D9]">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className="font-medium text-[#3CCB7F] hover:text-[#2BB870] transition-colors duration-200">
                Forgot your password?
              </a>
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-[#0A0C0F] bg-gradient-to-r from-[#FFD200] via-[#3CCB7F] to-[#4ECDC4] hover:from-[#FFB800] hover:via-[#2BB870] hover:to-[#3DB8B0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3CCB7F] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl font-oswald tracking-wide"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#0A0C0F] mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign in'
              )}
            </button>
          </div>

          {/* Sign up link */}
          <div className="text-center">
            <p className="text-sm text-[#C9D1D9]">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-medium text-[#3CCB7F] hover:text-[#2BB870] transition-colors duration-200"
              >
                Sign up here
              </Link>
            </p>
          </div>
        </motion.form>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center"
        >
          <p className="text-xs text-[#6B7280]">
            By signing in, you agree to our{' '}
            <a href="#" className="text-[#3CCB7F] hover:text-[#2BB870]">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-[#3CCB7F] hover:text-[#2BB870]">
              Privacy Policy
            </a>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;
