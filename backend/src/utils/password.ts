import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

/**
 * Hash a password
 * @param password - Plain text password
 * @returns Hashed password
 */
export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Compare a password with a hash
 * @param password - Plain text password
 * @param hash - Hashed password
 * @returns True if password matches hash
 */
export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};

/**
 * Validate password strength
 * @param password - Password to validate
 * @returns Object with validation result and error message
 */
export const validatePassword = (password: string): { valid: boolean; message?: string } => {
  if (password.length < 6) {
    return {
      valid: false,
      message: 'Password must be at least 6 characters long',
    };
  }

  // Check for at least one letter and one number
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return {
      valid: false,
      message: 'Password must contain at least one letter and one number',
    };
  }

  return { valid: true };
};