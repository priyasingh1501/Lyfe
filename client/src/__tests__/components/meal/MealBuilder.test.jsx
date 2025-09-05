import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import MealBuilder from '../../../components/meal/MealBuilder';

// Mock the AuthContext
jest.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => ({
    token: 'mock-token',
    user: { _id: 'mock-user-id' }
  })
}));

// Mock the config
jest.mock('../../../config', () => ({
  buildApiUrl: (endpoint) => `http://localhost:5002${endpoint}`
}));

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn()
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>
  },
  AnimatePresence: ({ children }) => children
}));

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('MealBuilder', () => {
  test('renders meal builder header', () => {
    renderWithRouter(<MealBuilder />);
    
    expect(screen.getByText('MEAL BUILDER')).toBeInTheDocument();
    expect(screen.getByText(/Build your meal, see nutritional insights/)).toBeInTheDocument();
  });

  test('renders food search section', () => {
    renderWithRouter(<MealBuilder />);
    
    expect(screen.getByText('Search & Add Foods')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search for foods/)).toBeInTheDocument();
  });

  test('renders meal items section', () => {
    renderWithRouter(<MealBuilder />);
    
    expect(screen.getByText('Meal Items')).toBeInTheDocument();
    expect(screen.getByText(/No foods added yet/)).toBeInTheDocument();
  });

  test('renders meal context section', () => {
    renderWithRouter(<MealBuilder />);
    
    expect(screen.getByText('Meal Context & Notes')).toBeInTheDocument();
    expect(screen.getByLabelText('Post-workout meal')).toBeInTheDocument();
    expect(screen.getByLabelText('Contains fermented foods')).toBeInTheDocument();
  });

  test('renders save meal button', () => {
    renderWithRouter(<MealBuilder />);
    
    expect(screen.getByText('Save Meal')).toBeInTheDocument();
  });

  test('renders meal analysis section', () => {
    renderWithRouter(<MealBuilder />);
    
    expect(screen.getByText('Add foods to see live analysis')).toBeInTheDocument();
  });
});
