/**
 * Password validation utility
 * Validates password strength according to requirements:
 * - Minimum 8 characters
 * - Must contain lowercase letter
 * - Must contain uppercase letter
 * - Must contain digit
 * - Must contain symbol
 */

export interface PasswordValidationResult {
  isValid: boolean
  errors: string[]
}

export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = []

  // Minimum length
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }

  // Check for lowercase
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }

  // Check for uppercase
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }

  // Check for digit
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one digit')
  }

  // Check for symbol (special character)
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    errors.push('Password must contain at least one symbol (!@#$%^&*()_+-=[]{};\':"\\|,.<>/? etc.)')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

