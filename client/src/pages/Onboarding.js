import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  Target, 
  BookOpen, 
  DollarSign, 
  Utensils, 
  Brain, 
  Calendar,
  Sparkles,
  Heart,
  Zap
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button, Card } from '../components/ui';
import toast from 'react-hot-toast';

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user, completeOnboarding } = useAuth();
  const navigate = useNavigate();

  const steps = [
    {
      id: 'welcome',
      title: 'Welcome to Untangle!',
      subtitle: 'Your personal lifestyle management companion',
      icon: <Sparkles className="w-16 h-16 text-accent-yellow" />,
      content: (
        <div className="text-center space-y-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto w-24 h-24 bg-gradient-to-r from-accent-yellow via-accent-green to-accent-teal rounded-3xl flex items-center justify-center shadow-2xl"
          >
            <span className="text-text-inverse font-bold text-4xl">U</span>
          </motion.div>
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-text-primary">Welcome, {user?.firstName}!</h2>
            <p className="text-lg text-text-secondary max-w-md mx-auto">
              We're excited to help you organize and optimize every aspect of your life. 
              Let's take a quick tour to show you what Untangle can do for you.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'features',
      title: 'What Untangle Does',
      subtitle: 'Your all-in-one lifestyle management platform',
      icon: <Target className="w-16 h-16 text-accent-green" />,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              icon: <BookOpen className="w-8 h-8 text-accent-teal" />,
              title: 'Journal & Reflection',
              description: 'Track your thoughts, emotions, and daily experiences with AI-powered insights.'
            },
            {
              icon: <DollarSign className="w-8 h-8 text-accent-yellow" />,
              title: 'Financial Management',
              description: 'Monitor expenses, set budgets, and achieve your financial goals.'
            },
            {
              icon: <Utensils className="w-8 h-8 text-accent-green" />,
              title: 'Food & Nutrition',
              description: 'Track meals, discover healthy recipes, and maintain a balanced diet.'
            },
            {
              icon: <Brain className="w-8 h-8 text-accent-purple" />,
              title: 'Mindfulness & Wellness',
              description: 'Practice meditation, track mood, and build healthy habits.'
            },
            {
              icon: <Calendar className="w-8 h-8 text-accent-blue" />,
              title: 'Goals & Tasks',
              description: 'Set meaningful goals, manage tasks, and track your progress.'
            },
            {
              icon: <Heart className="w-8 h-8 text-accent-pink" />,
              title: 'AI-Powered Insights',
              description: 'Get personalized recommendations and insights based on your data.'
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-6 bg-background-secondary/50 rounded-2xl border border-border-primary/20 backdrop-blur-sm"
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 p-3 bg-background-primary/50 rounded-xl">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-text-secondary text-sm">
                    {feature.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )
    },
    {
      id: 'goals',
      title: 'What are your goals?',
      subtitle: 'Help us personalize your experience',
      icon: <Target className="w-16 h-16 text-accent-teal" />,
      content: (
        <div className="space-y-6">
          <p className="text-center text-text-secondary mb-8">
            Select the areas you'd like to focus on. You can always change these later.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { id: 'fitness', label: 'Fitness & Health', icon: <Zap className="w-5 h-5" /> },
              { id: 'finance', label: 'Financial Wellness', icon: <DollarSign className="w-5 h-5" /> },
              { id: 'mindfulness', label: 'Mindfulness & Mental Health', icon: <Brain className="w-5 h-5" /> },
              { id: 'productivity', label: 'Productivity & Organization', icon: <Calendar className="w-5 h-5" /> },
              { id: 'nutrition', label: 'Nutrition & Diet', icon: <Utensils className="w-5 h-5" /> },
              { id: 'relationships', label: 'Relationships & Social', icon: <Heart className="w-5 h-5" /> }
            ].map((goal) => (
              <motion.button
                key={goal.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="p-4 bg-background-secondary/30 rounded-xl border border-border-primary/20 hover:border-accent-green/50 transition-all duration-200 text-left group"
              >
                <div className="flex items-center space-x-3">
                  <div className="text-accent-green group-hover:text-accent-teal transition-colors">
                    {goal.icon}
                  </div>
                  <span className="text-text-primary font-medium">{goal.label}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'preferences',
      title: 'Set your preferences',
      subtitle: 'Customize your Untangle experience',
      icon: <Heart className="w-16 h-16 text-accent-pink" />,
      content: (
        <div className="space-y-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-3">
                What time do you usually wake up?
              </label>
              <select className="w-full p-3 bg-background-secondary/50 border border-border-primary/20 rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-green/50">
                <option value="5:00">5:00 AM</option>
                <option value="6:00">6:00 AM</option>
                <option value="7:00" selected>7:00 AM</option>
                <option value="8:00">8:00 AM</option>
                <option value="9:00">9:00 AM</option>
                <option value="10:00">10:00 AM</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-primary mb-3">
                What time do you usually go to sleep?
              </label>
              <select className="w-full p-3 bg-background-secondary/50 border border-border-primary/20 rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-green/50">
                <option value="9:00">9:00 PM</option>
                <option value="10:00">10:00 PM</option>
                <option value="11:00" selected>11:00 PM</option>
                <option value="12:00">12:00 AM</option>
                <option value="1:00">1:00 AM</option>
                <option value="2:00">2:00 AM</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-3">
                How would you describe your current lifestyle?
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  'Very active',
                  'Moderately active', 
                  'Somewhat active',
                  'Mostly sedentary'
                ].map((option) => (
                  <button
                    key={option}
                    className="p-3 bg-background-secondary/30 border border-border-primary/20 rounded-lg text-text-primary hover:border-accent-green/50 transition-colors text-left"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'complete',
      title: 'You\'re all set!',
      subtitle: 'Welcome to your new lifestyle management journey',
      icon: <CheckCircle className="w-16 h-16 text-accent-green" />,
      content: (
        <div className="text-center space-y-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto w-32 h-32 bg-gradient-to-r from-accent-green to-accent-teal rounded-full flex items-center justify-center shadow-2xl"
          >
            <CheckCircle className="w-16 h-16 text-text-inverse" />
          </motion.div>
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-text-primary">Ready to get started!</h2>
            <p className="text-lg text-text-secondary max-w-md mx-auto">
              Your personalized dashboard is ready. Start tracking your goals, 
              managing your finances, and building healthy habits today.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            {[
              { icon: <Target className="w-6 h-6" />, text: 'Set your first goal' },
              { icon: <BookOpen className="w-6 h-6" />, text: 'Write your first journal entry' },
              { icon: <DollarSign className="w-6 h-6" />, text: 'Track your first expense' }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="flex items-center space-x-2 text-text-secondary"
              >
                <div className="text-accent-green">{item.icon}</div>
                <span className="text-sm">{item.text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      const result = await completeOnboarding();
      if (result.success) {
        toast.success('Welcome to Untangle!');
        navigate('/overview');
      }
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast.error('Failed to complete onboarding. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="min-h-screen bg-background-primary flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl w-full"
      >
        <Card className="p-8 md:p-12">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-text-secondary">
                Step {currentStep + 1} of {steps.length}
              </span>
              <span className="text-sm font-medium text-text-secondary">
                {Math.round(((currentStep + 1) / steps.length) * 100)}%
              </span>
            </div>
            <div className="w-full bg-background-secondary/30 rounded-full h-2">
              <motion.div
                className="bg-gradient-to-r from-accent-green to-accent-teal h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* Header */}
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                  className="mb-6"
                >
                  {currentStepData.icon}
                </motion.div>
                <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-2">
                  {currentStepData.title}
                </h1>
                <p className="text-lg text-text-secondary">
                  {currentStepData.subtitle}
                </p>
              </div>

              {/* Content */}
              <div className="min-h-[400px] flex items-center">
                {currentStepData.content}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border-primary/20">
            <Button
              variant="ghost"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </Button>

            <div className="flex space-x-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentStep
                      ? 'bg-accent-green'
                      : index < currentStep
                      ? 'bg-accent-teal'
                      : 'bg-background-secondary/50'
                  }`}
                />
              ))}
            </div>

            {isLastStep ? (
              <Button
                onClick={handleComplete}
                loading={loading}
                className="flex items-center space-x-2 bg-gradient-to-r from-accent-green to-accent-teal hover:from-accent-green/90 hover:to-accent-teal/90"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                className="flex items-center space-x-2"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default Onboarding;
