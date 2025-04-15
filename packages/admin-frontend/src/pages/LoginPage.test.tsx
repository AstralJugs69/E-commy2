import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom'; 
import LoginPage from './LoginPage';

// Mock useNavigate as it's used in the component
vi.mock('react-router-dom', async () => {
    const original = await vi.importActual('react-router-dom');
    return {
        ...original,
        useNavigate: () => vi.fn(), // Simple mock function
    };
});

// Mock axios for API calls
vi.mock('axios', () => ({
    default: {
        post: vi.fn().mockResolvedValue({ data: { token: 'mock-token' } })
    }
}));

describe('Admin LoginPage Component', () => {
    it('renders login form elements', () => {
        render(
            <BrowserRouter>
                <LoginPage />
            </BrowserRouter>
        );

        // Check for key elements using testing-library queries
        expect(screen.getByRole('heading', { name: /admin login/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
        expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
    });

    // Add more tests as needed for interaction, form submission, etc.
}); 