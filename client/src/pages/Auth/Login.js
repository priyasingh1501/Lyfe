import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button, Input, Header, Section } from '../../components/ui';

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
    <Section className="flex items-center justify-center py-12">
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
            className="mx-auto w-20 h-20 bg-gradient-to-r from-accent-yellow via-accent-green to-accent-teal rounded-2xl flex items-center justify-center shadow-lg"
          >
            <span className="text-text-inverse font-bold text-3xl">L</span>
          </motion.div>
          
          <Header level={2} className="mt-6">
            Welcome back to Alfred
          </Header>
          
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-2 text-sm text-text-secondary"
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
          <div className="space-y-5">
            {/* Email Field */}
            <Input
              id="email"
              name="email"
              type="email"
              label="Email address"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              icon={<Mail size={20} className="text-text-muted" />}
            />

            {/* Password Field */}
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                label="Password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                icon={<Lock size={20} className="text-text-muted" />}
                className="pr-12"
              />
              {/* Password Toggle Button */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors z-20 pointer-events-auto"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>

          {/* Remember me and Forgot password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-accent-green focus:ring-accent-green border-border-primary rounded bg-background-secondary focus:ring-2 focus:ring-offset-2 focus:ring-offset-background-primary"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-text-secondary">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <button 
                type="button"
                className="font-medium text-accent-green hover:text-accent-green/80 transition-colors duration-200"
                onClick={() => {/* TODO: Implement forgot password */}}
              >
                Forgot your password?
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            className="w-full"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>

          {/* Sign up link */}
          <div className="text-center">
            <p className="text-sm text-text-secondary">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-medium text-accent-green hover:text-accent-green/80 transition-colors duration-200"
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
          <p className="text-xs text-text-muted">
            By signing in, you agree to our{' '}
            <button 
              type="button"
              className="text-accent-green hover:text-accent-green/80"
              onClick={() => {/* TODO: Implement Terms of Service */}}
            >
              Terms of Service
            </button>{' '}
            and{' '}
            <button 
              type="button"
              className="text-accent-green hover:text-accent-green/80"
              onClick={() => {/* TODO: Implement Privacy Policy */}}
            >
              Privacy Policy
            </button>
          </p>
        </motion.div>
      </motion.div>
    </Section>
  );
};

export default Login;
