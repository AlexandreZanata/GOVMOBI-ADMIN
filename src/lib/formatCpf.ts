/**
 * Formats an 11-digit CPF string as "XXX.XXX.XXX-XX".
 *
 * Strips any non-digit characters before formatting. Returns the raw
 * value unchanged if the digit count is not exactly 11.
 *
 * @param cpf - Raw CPF string (expected: 11 digits)
 * @returns Formatted CPF string in the pattern `000.000.000-00`
 */
export function formatCpf(cpf: string): string {
  const digits = cpf.replace(/\D/g, "");
  if (digits.length !== 11) return cpf;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}
