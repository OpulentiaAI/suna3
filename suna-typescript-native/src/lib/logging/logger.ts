import { env, isDevelopment } from '../config/environment';

// Log levels
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

// Log entry interface
export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  error?: Error;
  requestId?: string;
  userId?: string;
}

// Logger configuration
interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableStructured: boolean;
  enableColors: boolean;
}

class Logger {
  private config: LoggerConfig;
  private requestId?: string;
  private userId?: string;

  constructor(config?: Partial<LoggerConfig>) {
    this.config = {
      level: isDevelopment ? LogLevel.DEBUG : LogLevel.INFO,
      enableConsole: true,
      enableStructured: !isDevelopment,
      enableColors: isDevelopment,
      ...config,
    };
  }

  // Set context for all subsequent logs
  setContext(requestId?: string, userId?: string) {
    this.requestId = requestId;
    this.userId = userId;
  }

  // Create child logger with additional context
  child(context: Record<string, any>) {
    const childLogger = new Logger(this.config);
    childLogger.requestId = this.requestId;
    childLogger.userId = this.userId;
    return childLogger;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.config.level;
  }

  private formatMessage(entry: LogEntry): string {
    if (this.config.enableStructured) {
      return JSON.stringify(entry);
    }

    const timestamp = entry.timestamp;
    const level = LogLevel[entry.level];
    const context = entry.context ? ` ${JSON.stringify(entry.context)}` : '';
    const error = entry.error ? ` ${entry.error.stack}` : '';
    
    if (this.config.enableColors) {
      const colors = {
        [LogLevel.DEBUG]: '\x1b[36m', // Cyan
        [LogLevel.INFO]: '\x1b[32m',  // Green
        [LogLevel.WARN]: '\x1b[33m',  // Yellow
        [LogLevel.ERROR]: '\x1b[31m', // Red
      };
      const reset = '\x1b[0m';
      const color = colors[entry.level] || '';
      
      return `${color}[${timestamp}] ${level}${reset}: ${entry.message}${context}${error}`;
    }

    return `[${timestamp}] ${level}: ${entry.message}${context}${error}`;
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>, error?: Error) {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error,
      requestId: this.requestId,
      userId: this.userId,
    };

    if (this.config.enableConsole) {
      const formatted = this.formatMessage(entry);
      
      switch (level) {
        case LogLevel.DEBUG:
          console.debug(formatted);
          break;
        case LogLevel.INFO:
          console.info(formatted);
          break;
        case LogLevel.WARN:
          console.warn(formatted);
          break;
        case LogLevel.ERROR:
          console.error(formatted);
          break;
      }
    }

    // TODO: Add external logging service integration (e.g., Sentry, LogRocket)
    // if (this.config.enableExternal) {
    //   this.sendToExternalService(entry);
    // }
  }

  debug(message: string, context?: Record<string, any>) {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: Record<string, any>) {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: Record<string, any>) {
    this.log(LogLevel.WARN, message, context);
  }

  error(message: string, error?: Error, context?: Record<string, any>) {
    this.log(LogLevel.ERROR, message, context, error);
  }

  // Structured logging methods
  structlog(level: LogLevel, message: string, fields: Record<string, any> = {}) {
    this.log(level, message, fields);
  }
}

// Default logger instance
export const logger = new Logger();

// Create request-scoped logger
export function createRequestLogger(requestId: string, userId?: string): Logger {
  const requestLogger = new Logger();
  requestLogger.setContext(requestId, userId);
  return requestLogger;
}

// Performance timing utility
export class Timer {
  private startTime: number;
  private logger: Logger;
  private operation: string;

  constructor(operation: string, logger: Logger = logger) {
    this.operation = operation;
    this.logger = logger;
    this.startTime = performance.now();
    this.logger.debug(`Started ${operation}`);
  }

  end(context?: Record<string, any>) {
    const duration = performance.now() - this.startTime;
    this.logger.info(`Completed ${this.operation}`, {
      duration_ms: Math.round(duration),
      ...context,
    });
    return duration;
  }
}

// Async operation wrapper with logging
export async function withLogging<T>(
  operation: string,
  fn: () => Promise<T>,
  logger: Logger = logger
): Promise<T> {
  const timer = new Timer(operation, logger);
  try {
    const result = await fn();
    timer.end({ success: true });
    return result;
  } catch (error) {
    timer.end({ success: false });
    logger.error(`Failed ${operation}`, error as Error);
    throw error;
  }
}
