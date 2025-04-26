// src/pages/LoginPage.test.tsx
import { render } from '@testing-library/react';
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
        const { getByRole, getByLabelText, getByText } = render(
            <BrowserRouter> {/* Wrap with Router if Link is used */}
                <AuthProvider> {/* Wrap with necessary context providers */}
                    <LoginPage />
                </AuthProvider>
            </BrowserRouter>
        );

        // Check for key elements using testing-library queries
        expect(getByRole('heading', { name: /customer login/i })).toBeInTheDocument();
        expect(getByLabelText(/email address/i)).toBeInTheDocument();
        expect(getByLabelText(/password/i)).toBeInTheDocument();
        expect(getByRole('button', { name: /login/i })).toBeInTheDocument();
        expect(getByText(/forgot password/i)).toBeInTheDocument();
        expect(getByText(/register here/i)).toBeInTheDocument();
    });

    // Add more tests as needed
}); 