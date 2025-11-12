export const config = {
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  logging: {
    enableDebugLogs: import.meta.env.VITE_ENABLE_DEBUG_LOGS === 'true',
    enableConsoleErrors: import.meta.env.DEV,
    logLevel: (import.meta.env.VITE_LOG_LEVEL || 'error') as 'debug' | 'info' | 'warn' | 'error'
  }
};
