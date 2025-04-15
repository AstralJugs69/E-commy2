// src/pages/LoginPage.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom'; // Needed if component uses Link/useNavigate
import { AuthProvider } from '../context/AuthContext'; // Wrap with providers if needed
import LoginPage from './LoginPage';

// Mock useNavigate as it's used in the component
vi.mock('react-router-dom', async () => {
    const original = await vi.importActual('react-router-dom');
    return {
        ...original,
        useNavigate: () => vi.fn(), // Simple mock function
    };
});

// Mock useAuth context
vi.mock('../context/AuthContext', () => ({
    useAuth: () => ({
        login: vi.fn(),
        isAuthenticated: false, // Assume not authenticated for login page test
        // Add other context values if needed by the component
    }),
    AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div> // Simple provider mock
}));

// Mock toast
vi.mock('react-hot-toast', () => ({
    default: {
        success: vi.fn(),
        error: vi.fn()
    }
}));

describe('LoginPage Component', () => {
    it('renders login form elements', () => {
        render(
            <BrowserRouter> {/* Wrap with Router if Link is used */}
                <AuthProvider> {/* Wrap with necessary context providers */}
                    <LoginPage />
                </AuthProvider>
            </BrowserRouter>
        );

        // Check for key elements using testing-library queries
        expect(screen.getByRole('heading', { name: /customer login/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
        expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
        expect(screen.getByText(/register here/i)).toBeInTheDocument();
    });

    // Add more tests as needed
}); 