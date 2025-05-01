/**
 * Utility functions for formatting data throughout the application
 */
import i18next from 'i18next';

/**
 * Format a date string into a localized date and time string
 * @param isoString ISO date string to format
 * @returns Formatted date and time string
 */
export const formatDateTime = (dateString: string | Date): string => {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return new Intl.DateTimeFormat(i18next.language || 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

/**
 * Format a number as currency
 * @param amount - The amount to format
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat(i18next.language || 'en', {
    style: 'currency',
    currency: 'ETB',
  }).format(amount);
};

/**
 * Get the appropriate Bootstrap badge variant based on order status
 * @param status Order status string
 * @returns Bootstrap variant name
 */
export const getStatusBadgeVariant = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'warning';
    case 'processing':
      return 'info';
    case 'shipped':
      return 'primary';
    case 'delivered':
      return 'success';
    case 'cancelled':
      return 'danger';
    default:
      return 'secondary';
  }
};

/**
 * Formats a date to a readable string
 * @param dateString The date string to format
 * @returns Formatted date string
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat(i18next.language || 'en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}; 