export const validateGoalType = (type: string): boolean => {
  const validTypes = ['annual_books', 'monthly_pages', 'reading_streak', 'daily_hours'];
  return validTypes.includes(type);
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const sanitizeString = (input: string): string => {
  return input.replace(/[<>\"'&]/g, '');
};

export const validateId = (id: any): number | null => {
  const parsed = parseInt(id);
  return isNaN(parsed) || parsed <= 0 ? null : parsed;
};