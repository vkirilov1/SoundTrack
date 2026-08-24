export function validatePassword(password: string): string | null {
  if (!password) return "Password cannot be blank";
  if (password.length < 8) return "Password must be at least 8 characters long";
  if (!/[0-9]/.test(password))
    return "Password must contain at least one digit";
  if (!/[a-z]/.test(password))
    return "Password must contain at least one lowercase letter";
  if (!/[A-Z]/.test(password))
    return "Password must contain at least one uppercase letter";
  if (!/[@#$%^&+=]/.test(password))
    return "Password must contain at least one special character (@#$%^&+=)";
  if (/\s/.test(password)) return "Password must not contain whitespace";
  return null;
}
