// Password policy used by Sign-Up (and available to Sign-In).
// Rules:
//   - Minimum 8 characters
//   - At least 1 uppercase letter
//   - At least 1 lowercase letter
//   - At least 1 number
//   - At least 1 special character from !@#$%^&*

export interface PasswordRule {
  key: string;
  label: string;
  test: (pw: string) => boolean;
}

export const passwordRules: PasswordRule[] = [
  { key: "length", label: "At least 8 characters", test: p => p.length >= 8 },
  { key: "upper",  label: "At least 1 uppercase letter", test: p => /[A-Z]/.test(p) },
  { key: "lower",  label: "At least 1 lowercase letter", test: p => /[a-z]/.test(p) },
  { key: "number", label: "At least 1 number",           test: p => /[0-9]/.test(p) },
  { key: "special", label: "At least 1 special character (!@#$%^&*)", test: p => /[!@#$%^&*]/.test(p) },
];

export function getPasswordErrors(pw: string): string[] {
  // Returns human-readable error messages for every failing rule.
  return passwordRules.filter(r => !r.test(pw)).map(r => `Password must contain ${r.label.toLowerCase()}`);
}

export function isPasswordValid(pw: string): boolean {
  return passwordRules.every(r => r.test(pw));
}
