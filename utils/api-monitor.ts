import { NextRequest } from 'next/server';
import { logApiAccess, logSecurityEvent } from './secure-logger';

interface ApiMetrics {
  totalRequests: number;
  errorCount: number;
  averageResponseTime: number;
  lastReset: number;
}

const metrics: ApiMetrics = {
  totalRequests: 0,
  errorCount: 0,
  averageResponseTime: 0,
  lastReset: Date.now()
};

const suspiciousPatterns = [
  /\.\.\//g, // Directory traversal
  /<script/gi, // XSS attempts
  /union\s+select/gi, // SQL injection
  /drop\s+table/gi, // SQL injection
  /exec\s*\(/gi, // Code execution
  /eval\s*\(/gi, // Code execution
];

export const monitorApiRequest = (
  request: NextRequest,
  startTime: number,
  statusCode: number,
  userId?: string
): void => {
  const duration = Date.now() - startTime;
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const method = request.method;
  const path = request.nextUrl.pathname;
  
  // Update metrics
  metrics.totalRequests++;
  if (statusCode >= 400) {
    metrics.errorCount++;
  }
  metrics.averageResponseTime = (metrics.averageResponseTime + duration) / 2;
  
  // Log API access
  logApiAccess(method, path, userId, ip, statusCode);
  
  // Check for suspicious patterns in URL and headers
  const fullUrl = request.url;
  const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(fullUrl));
  
  if (isSuspicious) {
    logSecurityEvent('suspicious_request_pattern', userId, ip, userAgent, {
      url: fullUrl,
      method,
      statusCode
    });
  }
  
  // Log slow requests
  if (duration > 5000) {
    logSecurityEvent('slow_request', userId, ip, userAgent, {
      duration,
      path,
      method
    });
  }
  
  // Log failed authentication attempts
  if (statusCode === 401 || statusCode === 403) {
    logSecurityEvent('authentication_failure', userId, ip, userAgent, {
      path,
      method,
      statusCode
    });
  }
};

export const getApiMetrics = (): ApiMetrics & { uptime: number } => {
  return {
    ...metrics,
    uptime: Date.now() - metrics.lastReset
  };
};

export const resetMetrics = (): void => {
  metrics.totalRequests = 0;
  metrics.errorCount = 0;
  metrics.averageResponseTime = 0;
  metrics.lastReset = Date.now();
};