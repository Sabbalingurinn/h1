export const isString = (value: unknown): value is string => typeof value === 'string';

export const isNotEmptyString = (value: unknown, options?: { min?: number; max?: number }): value is string => {
  if (!isString(value) || !value.trim()) return false;
  const length = value.trim().length;
  if (options?.min && length < options.min) return false;
  if (options?.max && length > options.max) return false;
  return true;
};

export const isInt = (value: unknown): boolean => Number.isInteger(Number(value));

export const isPositiveNumber = (value: unknown): boolean => Number(value) > 0;

export const toPositiveNumberOrDefault = (value: unknown, defaultValue: number): number => {
  const num = Number(value);
  return num > 0 ? num : defaultValue;
};

export const lengthValidationError = (fieldName: string, min: number, max?: number): string => {
  return max
    ? `${fieldName} must be between ${min} and ${max} characters.`
    : `${fieldName} must be at least ${min} characters.`;
};

export const isValidEmail = (email: unknown): boolean => {
  return isString(email) && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
};

export const isEmpty = (value: unknown): boolean => {
  return value === null || value === undefined || (isString(value) && value.trim().length === 0);
};