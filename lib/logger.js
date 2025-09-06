const { sanitizeLog } = require('./security');

class SecureLogger {
  log(level, message, data = {}) {
    const { message: cleanMessage, data: cleanData } = sanitizeLog(message, data);
    
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message: cleanMessage,
      ...cleanData
    };
    
    console.log(JSON.stringify(logEntry));
  }
  
  info(message, data) {
    this.log('info', message, data);
  }
  
  warn(message, data) {
    this.log('warn', message, data);
  }
  
  error(message, data) {
    this.log('error', message, data);
  }
}

module.exports = new SecureLogger();