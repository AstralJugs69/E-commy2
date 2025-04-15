// src/tests/example.test.ts
import { describe, it, expect } from 'vitest';

// Example: Test a simple hypothetical utility function
function add(a: number, b: number): number {
    return a + b;
}

describe('Example Suite', () => {
    it('should add two numbers correctly', () => {
        expect(add(1, 2)).toBe(3);
    });

    it('should handle zero', () => {
        expect(add(5, 0)).toBe(5);
    });
}); 