import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, Lock, Mail, User, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const result = await register({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        password: formData.password
      });
      
      if (result.success) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-primary flex">
      {/* Left Half - Register Form */}
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
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
            <span className="text-[#0A0C0F] font-bold text-3xl">U</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 text-3xl font-extrabold text-[#E8EEF2] font-oswald tracking-wide"
          >
            Create your account
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-2 text-sm text-[#C9D1D9]"
          >
            Start managing your lifestyle with Untangle
          </motion.p>
        </div>

        {/* Back to Login Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <Link
            to="/login"
            className="inline-flex items-center text-sm text-[#3CCB7F] hover:text-[#2BB870] transition-colors duration-200"
          >
            <ArrowLeft size={16} className="mr-1" />
            Back to login
          </Link>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 space-y-6"
          onSubmit={handleSubmit}
        >
          <div className="space-y-4">
            {/* First Name Field */}
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-[#C9D1D9] mb-2 font-oswald tracking-wide">
                First Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={20} className="text-[#2A313A]" />
                </div>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  autoComplete="given-name"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`appearance-none relative block w-full pl-10 pr-3 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:z-10 sm:text-sm transition-all duration-200 bg-[#11151A] text-[#E8EEF2] placeholder-[#6B7280] ${
                    errors.firstName 
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                      : 'border-[#2A313A] focus:ring-[#3CCB7F] focus:border-[#3CCB7F] hover:border-[#3A414A]'
                  }`}
                  placeholder="Enter your first name"
                />
              </div>
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-400">{errors.firstName}</p>
              )}
            </div>

            {/* Last Name Field */}
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-[#C9D1D9] mb-2 font-oswald tracking-wide">
                Last Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={20} className="text-[#2A313A]" />
                </div>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  autoComplete="family-name"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`appearance-none relative block w-full pl-10 pr-3 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:z-10 sm:text-sm transition-all duration-200 bg-[#11151A] text-[#E8EEF2] placeholder-[#6B7280] ${
                    errors.lastName 
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                      : 'border-[#2A313A] focus:ring-[#3CCB7F] focus:border-[#3CCB7F] hover:border-[#3A414A]'
                  }`}
                  placeholder="Enter your last name"
                />
              </div>
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-400">{errors.lastName}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#C9D1D9] mb-2 font-oswald tracking-wide">
                Email Address
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
                  className={`appearance-none relative block w-full pl-10 pr-3 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:z-10 sm:text-sm transition-all duration-200 bg-[#11151A] text-[#E8EEF2] placeholder-[#6B7280] ${
                    errors.email 
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                      : 'border-[#2A313A] focus:ring-[#3CCB7F] focus:border-[#3CCB7F] hover:border-[#3A414A]'
                  }`}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">{errors.email}</p>
              )}
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
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`appearance-none relative block w-full pl-10 pr-12 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:z-10 sm:text-sm transition-all duration-200 bg-[#11151A] text-[#E8EEF2] placeholder-[#6B7280] ${
                    errors.password 
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                      : 'border-[#2A313A] focus:ring-[#3CCB7F] focus:border-[#3CCB7F] hover:border-[#3A414A]'
                  }`}
                  placeholder="Create a password"
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
              {errors.password && (
                <p className="mt-1 text-sm text-red-400">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#C9D1D9] mb-2 font-oswald tracking-wide">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={20} className="text-[#2A313A]" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`appearance-none relative block w-full pl-10 pr-12 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:z-10 sm:text-sm transition-all duration-200 bg-[#11151A] text-[#E8EEF2] placeholder-[#6B7280] ${
                    errors.confirmPassword 
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                      : 'border-[#2A313A] focus:ring-primary-500 focus:border-[#3CCB7F] hover:border-[#3A414A]'
                  }`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} className="text-[#2A313A] hover:text-[#C9D1D9]" />
                  ) : (
                    <Eye size={20} className="text-[#2A313A] hover:text-[#C9D1D9]" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>
              )}
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="flex items-center">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              required
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
              I agree to the{' '}
              <a href="#" className="text-primary-600 hover:text-primary-500">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-primary-600 hover:text-primary-500">
                Privacy Policy
              </a>
            </label>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating account...
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </div>

          {/* Sign in link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-primary-600 hover:text-primary-500 transition-colors duration-200"
              >
                Sign in here
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
          <p className="text-xs text-gray-500">
            By creating an account, you agree to our{' '}
            <a href="#" className="text-primary-600 hover:text-primary-500">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-primary-600 hover:text-primary-500">
              Privacy Policy
            </a>
          </p>
        </motion.div>
        </motion.div>
      </div>

      {/* Right Half - Masonry Video Cards */}
      <div className="hidden lg:flex lg:flex-1 relative bg-background-primary p-6 overflow-y-auto">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-green/5 via-accent-teal/5 to-accent-yellow/5"></div>
        
        {/* Masonry Grid Container - 50% width and height, centered */}
        <div className="relative w-1/2 h-1/2 mx-auto my-auto columns-2 gap-3 space-y-3">
          {/* Video Card 1 - Extra Small */}
          <div className="break-inside-avoid mb-3">
            <div className="relative group rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-110 hover:rotate-2">
              <video
                className="w-full h-28 object-cover"
                autoPlay
                muted
                loop
                playsInline
                onError={(e) => {
                  e.target.style.display = 'none';
                  const fallbackDiv = e.target.parentElement.querySelector('.video-fallback');
                  if (fallbackDiv) {
                    fallbackDiv.style.display = 'flex';
                  }
                }}
              >
                <source src="/videos/welcome-video.mp4" type="video/mp4" />
              </video>
              <div className="video-fallback hidden absolute inset-0 bg-gradient-to-br from-accent-yellow via-accent-green to-accent-teal items-center justify-center">
                <div className="text-center text-text-inverse">
                  <div className="w-6 h-6 bg-text-inverse/20 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-xs font-bold">U</span>
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute bottom-1 left-1 text-text-inverse opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0">
                <h3 className="font-bold text-xs">Join</h3>
              </div>
            </div>
          </div>

          {/* Video Card 2 - Large */}
          <div className="break-inside-avoid mb-3">
            <div className="relative group rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-rotate-0.5">
              <video
                className="w-full h-72 object-cover"
                autoPlay
                muted
                loop
                playsInline
                onError={(e) => {
                  e.target.style.display = 'none';
                  const fallbackDiv = e.target.parentElement.querySelector('.video-fallback');
                  if (fallbackDiv) {
                    fallbackDiv.style.display = 'flex';
                  }
                }}
              >
                <source src="/videos/join-community.mp4" type="video/mp4" />
              </video>
              <div className="video-fallback hidden absolute inset-0 bg-gradient-to-br from-accent-green via-accent-teal to-accent-yellow items-center justify-center">
                <div className="text-center text-text-inverse">
                  <div className="w-18 h-18 bg-text-inverse/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl font-bold">U</span>
                  </div>
                  <h3 className="text-lg font-bold">Create</h3>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute bottom-5 left-5 text-text-inverse opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-5 group-hover:translate-y-0">
                <h3 className="font-bold text-lg">Create Account</h3>
                <p className="text-sm opacity-90">Get started today</p>
              </div>
            </div>
          </div>

          {/* Video Card 3 - Medium */}
          <div className="break-inside-avoid mb-3">
            <div className="relative group rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-400 transform hover:scale-105 hover:rotate-1">
              <video
                className="w-full h-48 object-cover"
                autoPlay
                muted
                loop
                playsInline
                onError={(e) => {
                  e.target.style.display = 'none';
                  const fallbackDiv = e.target.parentElement.querySelector('.video-fallback');
                  if (fallbackDiv) {
                    fallbackDiv.style.display = 'flex';
                  }
                }}
              >
                <source src="/videos/start-journey.mp4" type="video/mp4" />
              </video>
              <div className="video-fallback hidden absolute inset-0 bg-gradient-to-br from-accent-teal via-accent-yellow to-accent-green items-center justify-center">
                <div className="text-center text-text-inverse">
                  <div className="w-12 h-12 bg-text-inverse/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-lg font-bold">U</span>
                  </div>
                  <h3 className="text-sm font-bold">Connect</h3>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400"></div>
              <div className="absolute bottom-3 left-3 text-text-inverse opacity-0 group-hover:opacity-100 transition-all duration-400 transform translate-y-3 group-hover:translate-y-0">
                <h3 className="font-bold text-sm">Connect & Share</h3>
                <p className="text-xs opacity-90">Build connections</p>
              </div>
            </div>
          </div>

          {/* Video Card 4 - Small */}
          <div className="break-inside-avoid mb-3">
            <div className="relative group rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-350 transform hover:scale-110 hover:-rotate-1">
              <video
                className="w-full h-36 object-cover"
                autoPlay
                muted
                loop
                playsInline
                onError={(e) => {
                  e.target.style.display = 'none';
                  const fallbackDiv = e.target.parentElement.querySelector('.video-fallback');
                  if (fallbackDiv) {
                    fallbackDiv.style.display = 'flex';
                  }
                }}
              >
                <source src="/videos/transform-life.mp4" type="video/mp4" />
              </video>
              <div className="video-fallback hidden absolute inset-0 bg-gradient-to-br from-accent-green via-accent-teal to-accent-yellow items-center justify-center">
                <div className="text-center text-text-inverse">
                  <div className="w-10 h-10 bg-text-inverse/20 rounded-full flex items-center justify-center mx-auto mb-1">
                    <span className="text-lg font-bold">U</span>
                  </div>
                  <h3 className="text-xs font-bold">Discover</h3>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-350"></div>
              <div className="absolute bottom-2 left-2 text-text-inverse opacity-0 group-hover:opacity-100 transition-all duration-350 transform translate-y-2 group-hover:translate-y-0">
                <h3 className="font-bold text-xs">Discover</h3>
                <p className="text-xs opacity-90">Explore</p>
              </div>
            </div>
          </div>

          {/* Video Card 5 - Extra Large */}
          <div className="break-inside-avoid mb-3">
            <div className="relative group rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:rotate-0.5">
              <video
                className="w-full h-80 object-cover"
                autoPlay
                muted
                loop
                playsInline
                onError={(e) => {
                  e.target.style.display = 'none';
                  const fallbackDiv = e.target.parentElement.querySelector('.video-fallback');
                  if (fallbackDiv) {
                    fallbackDiv.style.display = 'flex';
                  }
                }}
              >
                <source src="/videos/grow-daily.mp4" type="video/mp4" />
              </video>
              <div className="video-fallback hidden absolute inset-0 bg-gradient-to-br from-accent-yellow via-accent-green to-accent-teal items-center justify-center">
                <div className="text-center text-text-inverse">
                  <div className="w-20 h-20 bg-text-inverse/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl font-bold">U</span>
                  </div>
                  <h3 className="text-xl font-bold">Learn</h3>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute bottom-6 left-6 text-text-inverse opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                <h3 className="font-bold text-xl">Learn & Grow</h3>
                <p className="text-sm opacity-90 mt-1">Continuous learning</p>
              </div>
            </div>
          </div>

          {/* Video Card 6 - Medium */}
          <div className="break-inside-avoid mb-3">
            <div className="relative group rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-450 transform hover:scale-105 hover:-rotate-1">
              <video
                className="w-full h-52 object-cover"
                autoPlay
                muted
                loop
                playsInline
                onError={(e) => {
                  e.target.style.display = 'none';
                  const fallbackDiv = e.target.parentElement.querySelector('.video-fallback');
                  if (fallbackDiv) {
                    fallbackDiv.style.display = 'flex';
                  }
                }}
              >
                <source src="/videos/achieve-goals.mp4" type="video/mp4" />
              </video>
              <div className="video-fallback hidden absolute inset-0 bg-gradient-to-br from-accent-teal via-accent-yellow to-accent-green items-center justify-center">
                <div className="text-center text-text-inverse">
                  <div className="w-14 h-14 bg-text-inverse/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-xl font-bold">U</span>
                  </div>
                  <h3 className="text-sm font-bold">Succeed</h3>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-450"></div>
              <div className="absolute bottom-3 left-3 text-text-inverse opacity-0 group-hover:opacity-100 transition-all duration-450 transform translate-y-3 group-hover:translate-y-0">
                <h3 className="font-bold text-sm">Succeed Together</h3>
                <p className="text-xs opacity-90">Achieve goals</p>
              </div>
            </div>
          </div>

          {/* Video Card 7 - Small */}
          <div className="break-inside-avoid mb-3">
            <div className="relative group rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-350 transform hover:scale-110 hover:rotate-1">
              <video
                className="w-full h-32 object-cover"
                autoPlay
                muted
                loop
                playsInline
                onError={(e) => {
                  e.target.style.display = 'none';
                  const fallbackDiv = e.target.parentElement.querySelector('.video-fallback');
                  if (fallbackDiv) {
                    fallbackDiv.style.display = 'flex';
                  }
                }}
              >
                <source src="/videos/grow-daily.mp4" type="video/mp4" />
              </video>
              <div className="video-fallback hidden absolute inset-0 bg-gradient-to-br from-accent-green via-accent-teal to-accent-yellow items-center justify-center">
                <div className="text-center text-text-inverse">
                  <div className="w-8 h-8 bg-text-inverse/20 rounded-full flex items-center justify-center mx-auto mb-1">
                    <span className="text-sm font-bold">U</span>
                  </div>
                  <h3 className="text-xs font-bold">Grow</h3>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-350"></div>
              <div className="absolute bottom-2 left-2 text-text-inverse opacity-0 group-hover:opacity-100 transition-all duration-350 transform translate-y-2 group-hover:translate-y-0">
                <h3 className="font-bold text-xs">Grow</h3>
                <p className="text-xs opacity-90">Improve</p>
              </div>
            </div>
          </div>

          {/* Video Card 8 - Large */}
          <div className="break-inside-avoid mb-3">
            <div className="relative group rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:rotate-0.5">
              <video
                className="w-full h-64 object-cover"
                autoPlay
                muted
                loop
                playsInline
                onError={(e) => {
                  e.target.style.display = 'none';
                  const fallbackDiv = e.target.parentElement.querySelector('.video-fallback');
                  if (fallbackDiv) {
                    fallbackDiv.style.display = 'flex';
                  }
                }}
              >
                <source src="/videos/achieve-goals.mp4" type="video/mp4" />
              </video>
              <div className="video-fallback hidden absolute inset-0 bg-gradient-to-br from-accent-yellow via-accent-green to-accent-teal items-center justify-center">
                <div className="text-center text-text-inverse">
                  <div className="w-16 h-16 bg-text-inverse/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl font-bold">U</span>
                  </div>
                  <h3 className="text-lg font-bold">Achieve</h3>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute bottom-4 left-4 text-text-inverse opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                <h3 className="font-bold text-lg">Achieve Dreams</h3>
                <p className="text-sm opacity-90">Make it happen</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
