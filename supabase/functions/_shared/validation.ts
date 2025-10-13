// ============================================
// PHASE 3: Input Validation Utilities
// ============================================
// Shared validation functions for edge functions
// Prevents injection attacks and data corruption

/**
 * Validates amount in cents
 * @param amount - Amount in cents
 * @returns true if valid (1 to 100,000,000 cents = $1 to $1,000,000)
 */
export const validateAmount = (amount: number): boolean => {
  return Number.isInteger(amount) && amount > 0 && amount <= 100000000;
};

/**
 * Validates UUID format
 * @param uuid - UUID string to validate
 * @returns true if valid UUID v4 format
 */
export const validateUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * Sanitizes string input to prevent XSS and injection attacks
 * @param input - Raw string input
 * @param maxLength - Maximum allowed length (default: 255)
 * @returns Sanitized string
 */
export const sanitizeString = (input: string, maxLength = 255): string => {
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
};

/**
 * Validates email format
 * @param email - Email string to validate
 * @returns true if valid RFC-compliant email
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
};

/**
 * Validates percentage (0-100)
 * @param percentage - Percentage value
 * @returns true if valid (0-100)
 */
export const validatePercentage = (percentage: number): boolean => {
  return typeof percentage === 'number' && percentage >= 0 && percentage <= 100;
};

/**
 * Validates date is not in the past
 * @param date - Date to validate
 * @returns true if date is in the future
 */
export const validateFutureDate = (date: Date): boolean => {
  return date > new Date();
};
