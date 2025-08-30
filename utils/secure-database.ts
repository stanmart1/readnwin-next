import { query } from './database';

export const secureQuery = async (queryText: string, params: any[] = []) => {
  // Validate query doesn't contain dangerous patterns
  const dangerousPatterns = [
    /;\s*(drop|delete|truncate|alter)\s+/i,
    /union\s+select/i,
    /--/,
    /\/\*/
  ];
  
  for (const pattern of dangerousPatterns) {
    if (pattern.test(queryText)) {
      throw new Error('Potentially dangerous query detected');
    }
  }
  
  // Sanitize parameters
  const sanitizedParams = params.map(param => {
    if (typeof param === 'string') {
      return param.replace(/['"\\]/g, '');
    }
    return param;
  });
  
  return await query(queryText, sanitizedParams);
};

export const buildWhereClause = (filters: Record<string, any>): { clause: string; params: any[] } => {
  const conditions: string[] = [];
  const params: any[] = [];
  let paramIndex = 1;
  
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== '') {
      // Only allow alphanumeric column names
      if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key)) {
        continue;
      }
      
      conditions.push(`${key} = $${paramIndex}`);
      params.push(value);
      paramIndex++;
    }
  }
  
  return {
    clause: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '',
    params
  };
};