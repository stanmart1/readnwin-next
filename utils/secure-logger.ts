interface LogEntry {
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  timestamp: string;
  userId?: string;
  ip?: string;
  userAgent?: string;
  action?: string;
  resource?: string;
  metadata?: Record<string, any>;
}

const SENSITIVE_FIELDS = [
  'password', 'token', 'secret', 'key', 'authorization', 'cookie',
  'session', 'csrf', 'api_key', 'access_token', 'refresh_token'
];

const sanitizeLogData = (data: any): any => {
  if (typeof data === 'string') {
    // Redact sensitive patterns
    return data.replace(/(password|token|secret|key)[\s]*[:=][\s]*[^\s,}]+/gi, '$1=[REDACTED]');
  }
  
  if (Array.isArray(data)) {
    return data.map(sanitizeLogData);
  }
  
  if (data && typeof data === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      if (SENSITIVE_FIELDS.some(field => key.toLowerCase().includes(field))) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = sanitizeLogData(value);
      }
    }
    return sanitized;
  }
  
  return data;
};

export const secureLog = (entry: Omit<LogEntry, 'timestamp'>): void => {
  const sanitizedEntry: LogEntry = {
    ...entry,
    timestamp: new Date().toISOString(),
    metadata: entry.metadata ? sanitizeLogData(entry.metadata) : undefined
  };
  
  // In production, you would send this to a secure logging service
  if (process.env.NODE_ENV === 'development') {
    console.log(`[${sanitizedEntry.level.toUpperCase()}] ${sanitizedEntry.message}`, sanitizedEntry);
  }
};

export const logSecurityEvent = (
  action: string,
  userId?: string,
  ip?: string,
  userAgent?: string,
  metadata?: Record<string, any>
): void => {
  secureLog({
    level: 'warn',
    message: `Security event: ${action}`,
    userId,
    ip,
    userAgent,
    action,
    metadata
  });
};

export const logApiAccess = (
  method: string,
  path: string,
  userId?: string,
  ip?: string,
  statusCode?: number
): void => {
  secureLog({
    level: 'info',
    message: `API access: ${method} ${path}`,
    userId,
    ip,
    metadata: { method, path, statusCode }
  });
};