export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  function_name: string;
  user_id?: string;
  request_id?: string;
  [key: string]: any;
}

export class EdgeFunctionLogger {
  private context: LogContext;

  constructor(functionName: string, context: Partial<LogContext> = {}) {
    this.context = { 
      function_name: functionName,
      request_id: crypto.randomUUID(),
      ...context 
    };
  }

  private formatLog(level: LogLevel, message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level: level.toUpperCase(),
      function: this.context.function_name,
      request_id: this.context.request_id,
      message,
      ...this.context,
      ...(data && { data })
    };
    return JSON.stringify(logEntry);
  }

  debug(message: string, data?: any) {
    console.log(this.formatLog('debug', message, data));
  }

  info(message: string, data?: any) {
    console.log(this.formatLog('info', message, data));
  }

  warn(message: string, data?: any) {
    console.warn(this.formatLog('warn', message, data));
  }

  error(message: string, error?: any) {
    console.error(this.formatLog('error', message, {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }));
  }
}
