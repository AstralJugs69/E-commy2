/**
 * Utility functions for formatting data throughout the application
 */
import i18next from 'i18next';
import { TFunction } from 'i18next';

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
 * Format a number as currency (ETB)
 * @param amount Amount to format
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
 * Format a date as a string with the specified format
 * @param date The date to format
 * @param options Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export const formatDate = (
  date: Date | string, 
  options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric'
  }
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(i18next.language || 'en-US', options).format(dateObj);
};

/**
 * Get a user-friendly description for each order status
 * @param status Order status string
 * @param t Translation function
 * @returns Human-readable description of the status
 */
export const getOrderStatusDescription = (status: string, t?: TFunction): string => {
  if (!t) {
    // Fallback when t function is not provided
    switch (status) {
      case 'Pending Call':
        return "Awaiting phone verification call.";
      case 'Verified':
        return "Order verified, preparing for processing.";
      case 'Processing':
        return "Your order is being processed.";
      case 'Shipped':
        return "Your order has shipped.";
      case 'Delivered':
        return "Your order has been delivered.";
      case 'Cancelled':
        return "Order cancelled.";
      default:
        return "Status unknown.";
    }
  }
  
  // With translations
  switch (status) {
    case 'Pending Call':
      return t('orders.statusDescription.pendingCall', "Awaiting phone verification call.");
    case 'Verified':
      return t('orders.statusDescription.verified', "Order verified, preparing for processing.");
    case 'Processing':
      return t('orders.statusDescription.processing', "Your order is being processed.");
    case 'Shipped':
      return t('orders.statusDescription.shipped', "Your order has shipped.");
    case 'Delivered':
      return t('orders.statusDescription.delivered', "Your order has been delivered.");
    case 'Cancelled':
      return t('orders.statusDescription.cancelled', "Order cancelled.");
    default:
      return t('orders.statusDescription.unknown', "Status unknown.");
  }
}; 