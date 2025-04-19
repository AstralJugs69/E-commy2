/**
 * Utility functions for formatting data throughout the application
 */

/**
 * Format a date string into a localized date and time string
 * @param isoString ISO date string to format
 * @returns Formatted date and time string
 */
export const formatDateTime = (dateString: string | Date): string => {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

/**
 * Format a number as currency (USD)
 * @param amount Amount to format
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
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
  return new Intl.DateTimeFormat('en-US', options).format(dateObj);
};

/**
 * Get a user-friendly description for each order status
 * @param status Order status string
 * @returns Human-readable description of the status
 */
export const getOrderStatusDescription = (status: string): string => {
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
}; 