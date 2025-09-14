// Input validation and sanitization utilities for security

export const sanitizeEmail = (email: string): string => {
  return email.toLowerCase().trim();
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

export const sanitizeString = (input: string, maxLength: number = 255): string => {
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+=/gi, ''); // Remove event handlers
};

export const validateAmount = (amount: number): boolean => {
  return Number.isInteger(amount) && amount > 0 && amount <= 100000000; // Max $1M in cents
};

export const sanitizeNumericInput = (input: any): number | null => {
  const parsed = parseInt(input);
  return isNaN(parsed) ? null : parsed;
};

export const validateUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

export const rateLimitKey = (identifier: string, action: string): string => {
  return `${sanitizeString(identifier, 50)}_${sanitizeString(action, 20)}`;
};

export const validateUserAgent = (userAgent: string): boolean => {
  // Basic user agent validation - reject obviously malicious patterns
  if (!userAgent || userAgent.length > 500) return false;
  if (userAgent.includes('<script>') || userAgent.includes('javascript:')) return false;
  return true;
};

export const validateIP = (ip: string): boolean => {
  // Basic IP validation for IPv4 and IPv6
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  
  return ipv4Regex.test(ip) || ipv6Regex.test(ip) || ip === 'unknown';
};